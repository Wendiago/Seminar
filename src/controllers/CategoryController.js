const Category = require("../models/Category");

const categoryController = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find();

      res.status(200).json({
        success: true,
        message: "Get all categories successfully !",
        data: categories,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err,
        data: [],
      });
    }
  },

  getCategoryByID: async (req, res) => {
    try {
      const id = req.params.id;

      const category = await Category.findById(id);
      res.status(200).json({
        success: true,
        message: "Get category successfully !",
        data: category,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err,
        data: [],
      });
    }
  },
};

module.exports = categoryController;
