const { Sequelize } = require("sequelize");
var sequelize = require("./sequalize");
const Employees = require("./db_Emp")(sequelize);
const Attendances = require("./db_Atten")(sequelize);
var express = require("express");
const jwtCheck = require("./auth/jwtCheck");
const { generateToken } = require("./auth/jwtCreate");
var app = express.Router();

app.get("/", jwtCheck, async (req, res) => {
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
      filterOptions["$Employees.name$"] = {
        [Sequelize.Op.iLike]: `%${name}%`,
      };
    }

    const employees = await Employees.findAll({
      where: filterOptions,
      order: [[_sort, _order]],
      offset: parseInt(_start),
      limit: parseInt(_end) - parseInt(_start),
    });

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Expose-Headers", "X-Total-Count");
    res.header("X-Total-Count", employees.length);

    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/", async (req, res) => {
  try {
    const newEmployeeData = req.body;

    // Создаем нового сотрудника
    const newEmployee = await Employees.create(newEmployeeData);

    res.header("Access-Control-Allow-Origin", "*");
    res.json({ data: newEmployee });
  } catch (error) {
    console.error("Error creating employee", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/:id", jwtCheck, async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employees.findByPk(employeeId);

    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  } catch (error) {
    console.error("Error fetching employee", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/:id", jwtCheck, async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedData = req.body;

    // Обновляем данные сотрудника
    const [updatedRowsCount, [updatedEmployee]] = await Employees.update(
      updatedData,
      {
        where: { id: employeeId },
        returning: true,
      }
    );

    if (updatedRowsCount > 0) {
      res.header("Access-Control-Allow-Origin", "*");
      res.json({ data: updatedEmployee });
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  } catch (error) {
    console.error("Error updating employee", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/:id", jwtCheck, async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Удаляем сотрудника
    const deletedRowCount = await Employees.destroy({
      where: { id: employeeId },
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

app.post("/login", async (req, res) => {
  try {
    const { name, uuid } = req.body;
    const employee = await Employees.findOne({ where: { name, uuid } });

    if (!employee) {
      res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(employee);

    res.json({ data: employee, token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
