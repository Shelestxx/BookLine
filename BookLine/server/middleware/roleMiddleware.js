const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

module.exports = function (requiredRole) {
    return (req, res, next) => {
        if (req.method === "OPTIONS") return next();

        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(403).json({ message: "Користувач не авторизований" });
            }

            const token = authHeader.split(' ')[1];
            const user = jwt.verify(token, JWT_SECRET);
            
            // Перевірка ролі (User з БД має роль 'Admin' або 'User')
            if (user.role !== requiredRole) {
                return res.status(403).json({ message: "У вас немає доступу (потрібна роль: " + requiredRole + ")" });
            }

            next();
        } catch (e) {
            console.log(e);
            return res.status(403).json({ message: "Користувач не авторизований" });
        }
    }
};