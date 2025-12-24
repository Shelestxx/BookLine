const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

//  1. ПІДКЛЮЧАЄМО ОХОРОНУ
const roleMiddleware = require('../middleware/roleMiddleware');

// === ПУБЛІЧНІ (Можна всім) ===
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

// === ЗАХИЩЕНІ (Тільки Адмін з токеном) ===
//  Якщо тут немає "roleMiddleware", то захисту немає!

// Додати:
router.post('/', roleMiddleware('Admin'), bookController.createBook);

// Оновити:
router.put('/:id', roleMiddleware('Admin'), bookController.updateBook);

// Видалити:
router.delete('/:id', roleMiddleware('Admin'), bookController.deleteBook);

module.exports = router;