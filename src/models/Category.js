var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category_name: { type: String, required: true },
  banner: { type: String },
});

var Category = mongoose.model("Category", schema, "category");

module.exports = Category;
