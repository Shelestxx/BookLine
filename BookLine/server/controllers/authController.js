const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Беремо ключ із .env (так безпечніше)
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

module.exports = {
    // === РЕЄСТРАЦІЯ ===
    register: async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Всі поля обов'язкові" });
        }

        try {
            // 1. Перевіряємо, чи існує користувач
            const [existing] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
            if (existing.length > 0) {
                return res.status(400).json({ message: "Користувач з таким email вже існує" });
            }

            // 2. Хешуємо пароль
            const hash = bcrypt.hashSync(password, 10);

            // 3. Створюємо користувача
            const sqlUser = "INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)";
            const [userResult] = await db.query(sqlUser, [username, email, hash]);
            const newUserId = userResult.insertId;

            // 4. Призначаємо роль 'User' (знаходимо ID ролі 'User' і прив'язуємо)
            // Цей запит автоматично знайде ID для 'User' і вставить запис у UserRoles
            const sqlRole = `
                INSERT INTO UserRoles (user_id, role_id)
                SELECT ?, role_id FROM Roles WHERE role_name = 'User'
            `;
            await db.query(sqlRole, [newUserId]);

            res.status(201).json({ message: "Користувача зареєстровано успішно!" });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Помилка сервера при реєстрації" });
        }
    },

    // === ЛОГІН ===
    login: async (req, res) => {
        const { email, password } = req.body;

        try {
            // 1. Шукаємо користувача ТА його роль одним запитом
            const sql = `
                SELECT u.*, r.role_name
                FROM Users u
                JOIN UserRoles ur ON u.user_id = ur.user_id
                JOIN Roles r ON ur.role_id = r.role_id
                WHERE u.email = ?
            `;
            
            const [users] = await db.query(sql, [email]);

            if (users.length === 0) {
                return res.status(400).json({ message: "Користувача не знайдено" });
            }

            const user = users[0];

            // 2. Перевіряємо пароль
            const isMatch = bcrypt.compareSync(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ message: "Невірний пароль" });
            }

            // 3. Генеруємо токен
            const token = jwt.sign(
                {
                    id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role: user.role_name // Наприклад: 'Admin' або 'User'
                },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({
                message: "Вхід успішний",
                token,
                user: {
                    id: user.user_id,
                    username: user.username,
                    role: user.role_name
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Помилка сервера при вході" });
        }
    }
};