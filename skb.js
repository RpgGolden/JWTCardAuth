const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const app = express();
const jwtCheck = require("./auth/jwtCheck")
const Roles = require('./roles/roles');
const checkRole = require('./roles/checkRoles');

const port = 5000;

var empRouter = require('./employees');
var attenRouter = require('./attendeces');
var sequelize = require('./sequalize');

const Employees = require('./db_Emp')(sequelize);
const Attendances = require('./db_Atten')(sequelize);

Employees.hasMany(Attendances);
Attendances.belongsTo(Employees, { as: "Employee" });

app.use(bodyParser.urlencoded({ extended: true }));

app.post("/update", jwtCheck, checkRole([Roles.RFID]), async (request, response) => {
  if (!request.body || !request.body.id) return response.sendStatus(400);

  console.log(request.body);

  try {
    const employee = await Employees.findOne({
      where: { uuid: request.body.id }
    });

    const attendance = await Attendances.findOne({
      where: { timeOut: null, EmployeeId: employee ? employee.id : 0 },
      order: [['timeIn', 'DESC']],
    });

    if (employee) {
      const curTime = new Date();
      curTime.setHours(curTime.getHours() + 3);
      const isEvening = (curTime.getHours() > 16) ? 1 : 0;

      if (!attendance) {
        const attendanceRecord = await Attendances.create({
          EmployeeId: employee.id,
          timeIn: !attendance ? curTime : null,
          timeOut: null,
        });

        let trackName = "/welcome/1";

        if (employee.birthday == curTime.toISOString().split('T')[0]) // День рождение
        {
          trackName = "birthday"
          console.log(employee.birthday);
          console.log("Happy birthday!");
        }

        response.send(`In:${employee.trackStr};${trackName}`);
        console.log(curTime.toUTCString() + " - " + employee.name + " пришёл")
      }
      else {
        let trackName = "/bb/bb"

        if (isEvening)
          trackName = "/bb/good_night"

        await attendance.update({ timeOut: curTime });
        console.log(curTime.toUTCString() + " - " + employee.name + " вышёл")
        response.send(`Out:${employee.trackStr};${trackName}`);
      }

    } else {
      console.log("Employee not found")
      response.send("Employee not found");
    }
  } catch (error) {
    console.error(error);
    response.status(500).send("Internal Server Error");
  }
});

app.use(cors());
app.use(express.json());
app.use('/employees', empRouter);
app.use('/attendeces', attenRouter);

app.use(function (req, res) {
  console.log("Request unknown");
  console.log(util.inspect(req.body));
  res.redirect('/employees');
});

sequelize.sync({ force: false }).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});