const db = require('../db');

module.exports = {
    // 1. Отримати всі книги (з іменами авторів та жанрів)
    getAllBooks: async (req, res) => {
        try {
            const sql = `
                SELECT 
                    b.book_id, b.title, b.price, b.quantity, b.image_url,
                    a.author_name AS author,
                    g.genre_name AS genre
                FROM Books b
                LEFT JOIN Authors a ON b.author_id = a.author_id
                LEFT JOIN Genres g ON b.genre_id = g.genre_id
            `;
            const [rows] = await db.query(sql);
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    },

    // 2. Отримати одну книгу за ID
    getBookById: async (req, res) => {
        try {
            const sql = `
                SELECT 
                    b.book_id, b.title, b.price, b.quantity, b.image_url,
                    b.author_id, b.genre_id, -- Повертаємо ID для форми редагування
                    a.author_name AS author,
                    g.genre_name AS genre
                FROM Books b
                LEFT JOIN Authors a ON b.author_id = a.author_id
                LEFT JOIN Genres g ON b.genre_id = g.genre_id
                WHERE b.book_id = ?
            `;
            const [rows] = await db.query(sql, [req.params.id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Книгу не знайдено" });
            }
            res.json(rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    },

    // 3. Додати нову книгу
    createBook: async (req, res) => {
        const { title, price, quantity, author_id, genre_id, image_url } = req.body;

        // Валідація
        if (!title || !price || !author_id || !genre_id) {
            return res.status(400).json({ message: "Назва, ціна, автор та жанр обов'язкові" });
        }

        try {
            const sql = `
                INSERT INTO Books (title, price, quantity, author_id, genre_id, image_url)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [result] = await db.query(sql, [title, price, quantity, author_id, genre_id, image_url]);
            res.status(201).json({ message: "Книгу додано", id: result.insertId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    },

    // 4. Оновити книгу
    updateBook: async (req, res) => {
        const { title, price, quantity, author_id, genre_id, image_url } = req.body;
        const bookId = req.params.id;

        try {
            const sql = `
                UPDATE Books
                SET title=?, price=?, quantity=?, author_id=?, genre_id=?, image_url=?
                WHERE book_id=?
            `;
            const [result] = await db.query(sql, [title, price, quantity, author_id, genre_id, image_url, bookId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Книгу не знайдено або дані не змінилися" });
            }
            res.json({ message: "Книгу оновлено" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    },

// 5. Видалити книгу
    deleteBook: async (req, res) => {
        try {
            console.log("Спроба видалити книгу з ID:", req.params.id); // <--- Додай цей лог

            // УВАГА: Тут має бути book_id, бо так називається колонка в твоїй базі
            const sql = "DELETE FROM Books WHERE book_id = ?"; 
            
            const [result] = await db.query(sql, [req.params.id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Книгу не знайдено в базі" });
            }
            res.json({ message: "Книгу видалено" });
        } catch (err) {
            console.error("Помилка видалення:", err); // <--- Покаже помилку в терміналі
            res.status(500).json({ error: err.message });
        }
    }
};