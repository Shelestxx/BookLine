const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

module.exports = (req, res, next) => {
    if (req.method === "OPTIONS") return next();

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Немає токена авторизації" });
        }

        const token = authHeader.split(" ")[1]; // "Bearer TOKEN"
        if (!token) {
            return res.status(401).json({ message: "Токен порожній" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Зберігаємо дані юзера в запит
        next();
    } catch (e) {
        res.status(401).json({ message: "Невірний токен або термін дії вийшов" });
    }
};