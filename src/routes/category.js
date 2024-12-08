const categoryController = require("../controllers/CategoryController");
const router = require("express").Router();

// GET CATEGORY BY ID
router.get("/:id", categoryController.getCategoryByID);

// GET ALL CATEGORIES
router.get("/", categoryController.getAllCategories);

module.exports = router;
