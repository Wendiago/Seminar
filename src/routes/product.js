const productController = require("../controllers/ProductController");
const router = require("express").Router();

// GET PRODUCTS: Use this route for elastic search demo
router.get("/", productController.getProducts);

// GET SIMILAR PRODUCTS
router.get("/similar/:id", productController.getSimilarProducts);

// GET PRODUCT BY ID
router.get("/:id", productController.getProductById);

// UPDATE PRODUCT BY ID
router.post("/update/:id", productController.updateProduct);

// GET ALL PRODUCTS IN CATEGORY
router.get("/category/:categoryId", productController.getAllProductInCate);

module.exports = router;
