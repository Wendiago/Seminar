var mongoose = require("mongoose");

var schema = new mongoose.Schema({
  title: { type: String, required: true },
  imgUrl: { type: String },
  stars: { type: Number },
  reviews: { type: Number },
  price: { type: Number },
  listPrice: { type: Number },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  isBestSeller: { type: Boolean },
  boughtInLastMonth: { type: Boolean },
  quantity: { type: Number, required: true },
});

var Product = mongoose.model("Product", schema, "product");

module.exports = Product;
