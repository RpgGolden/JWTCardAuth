const jwt = require("jsonwebtoken");
const jwtSecretKey = process.env.JWT_SECRET;

const generateToken = (employee) => {
    const { uuid, name } = employee;

    // Создаем токен с информацией из сущности Employees
    const token = jwt.sign({ uuid, name }, jwtSecretKey, { expiresIn: "1h" }); // Установите срок действия токена по своему усмотрению

    // Выводим токен в консоль
    console.log('Generated token:', token);

    return token;
};

module.exports = { generateToken };
