const jwt = require("jsonwebtoken");
const jwtSecretKey = 'your_secret_key_here';

const generateToken = (employee) => {
    const { uuid, name, roles } = employee; // Предположим, что роли хранятся в объекте employee

    // Создаем токен с информацией из сущности Employees
    const token = jwt.sign({ uuid, name, roles }, jwtSecretKey, { expiresIn: "1h" }); // Установите срок действия токена по своему усмотрению

    // Выводим токен в консоль
    console.log('Generated token:', token);

    return token;
};

module.exports = { generateToken };
