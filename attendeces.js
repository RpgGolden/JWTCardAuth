const { Sequelize } = require("sequelize");
var sequelize = require("./sequalize");
const Attendances = require("./db_Atten")(sequelize);
const Employees = require("./db_Emp")(sequelize);
const jwtCheck = require("./auth/jwtCheck");
var express = require("express");
const Roles = require('./roles/roles');
const checkRole = require('./roles/checkRoles');
var app = express.Router();

Employees.hasMany(Attendances);
Attendances.belongsTo(Employees, { as: "Employee" });

app.get("/", jwtCheck, checkRole([Roles.ADMIN, Roles.USER]), async (req, res) => {
  try {
    const {
      _start = 0,
      _end = 10,
      _sort = "id",
      _order = "ASC",
      name,
    } = req.query;

    const filterOptions = {};
    if (name) {
      filterOptions["$Employee.name$"] = {
        [Sequelize.Op.iLike]: `%${name}%`,
      };
    }

    const employees = await Attendances.findAll({
      attributes: [
        "id",
        [Sequelize.col("Employee.name"), "name"],
        [Sequelize.col("Employee.lab"), "lab"],
        "timeIn",
        "timeOut",
      ],
      include: [
        {
          model: Employees,
          as: "Employee",
          attributes: [],
          required: true,
        },
      ],
      where: filterOptions,
      order: [[_sort, _order]],
      offset: parseInt(_start),
      limit: parseInt(_end) - parseInt(_start),
    });

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Expose-Headers", "X-Total-Count");
    res.header("X-Total-Count", employees.length);

    for (emp in employees) {
      employees[emp].dataValues.timeIn = formatTimestamp(
        employees[emp].dataValues.timeIn
      );
      employees[emp].dataValues.timeOut = formatTimestamp(
        employees[emp].dataValues.timeOut
      );

      const firstName = employees[emp].dataValues.name.split(" ")[0];
    }

    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/online", jwtCheck,checkRole([Roles.ADMIN, Roles.USER]), async (req, res) => {
  try {
    const {
      _start = 0,
      _end = 10,
      _sort = "id",
      _order = "ASC",
      name,
    } = req.query;

    const filterOptions = {};
    if (name) {
      filterOptions["$Employee.name$"] = {
        [Sequelize.Op.iLike]: `%${name}%`,
      };
    }

    filterOptions["$Attendances.timeOut$"] = {
      [Sequelize.Op.is]: null,
    };

    const employees = await Attendances.findAll({
      attributes: [
        "id",
        [Sequelize.col("Employee.name"), "name"],
        [Sequelize.col("Employee.lab"), "lab"],
        "timeIn",
        "timeOut",
      ],
      include: [
        {
          model: Employees,
          as: "Employee",
          attributes: [],
          required: true,
        },
      ],
      where: filterOptions,
      order: [[_sort, _order]],
      offset: parseInt(_start),
      limit: parseInt(_end) - parseInt(_start),
    });

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Expose-Headers", "X-Total-Count");
    res.header("X-Total-Count", employees.length);

    for (emp in employees) {
      employees[emp].dataValues.timeIn = formatTimestamp(
        employees[emp].dataValues.timeIn
      );
      employees[emp].dataValues.timeOut = formatTimestamp(
        employees[emp].dataValues.timeOut
      );
    }

    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/:id", jwtCheck, checkRole([Roles.ADMIN]), async (req, res) => {
  try {
    const attenId = req.params.id;

    // Удаляем отметку
    const deletedRowCount = await Attendances.destroy({
      where: { id: attenId },
    });

    if (deletedRowCount > 0) {
      res.header("Access-Control-Allow-Origin", "*");
      res.status(204).end(); // 204 No Content, успешно удалено
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  } catch (error) {
    console.error("Error deleting employee", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/", jwtCheck, checkRole([Roles.ADMIN]), async (req, res) => {
  try {
    const newAttenData = req.body;

    const employee = await Employees.findOne({
      where: { id: newAttenData.id },
    });

    console.log(req.body.timeIn);
    console.log(req.body.timeOut);
    if (!employee) {
      console.error("Employee not found");
      res.status(500).json({ error: "Employee not found" });
      return;
    }

    // Создаем новую отметку
    const newEmployee = await Attendances.create({
      timeIn: addHoursToDateString(3, newAttenData.timeIn),
      timeOut: newAttenData.timeOut
        ? addHoursToDateString(3, newAttenData.timeOut)
        : null,
      EmployeeId: employee.dataValues.id,
    });

    res.header("Access-Control-Allow-Origin", "*");
    res.json({ data: newEmployee });
  } catch (error) {
    console.error("Error creating employee", error);
    res.status(500).json({ error: "Employee not found" });
  }
});

function formatTimestamp(timestamp) {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
  const year = String(date.getUTCFullYear()).slice(-2);

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

function addHoursToDateString(hour, dateString) {
  const originalDate = new Date(dateString);
  const newDate = new Date(originalDate.getTime() + hour * 60 * 60 * 1000);
  const newDateString =
    newDate.toISOString().replace("T", " ").slice(0, -5) + "+00";

  return newDateString;
}

module.exports = app;
