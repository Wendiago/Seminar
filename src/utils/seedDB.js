const csv = require("csv-parser");
const fs = require("fs");
require("dotenv").config();

const Product = require("../models/Product");
const Category = require("../models/Category");

const insertCategories = async () => {
  const categories = [];
  fs.createReadStream("./data/amazon_categories.csv")
    .pipe(csv())
    .on("data", (row) => {
      categories.push(row);
    })
    .on("end", async () => {
      try {
        await Category.insertMany(categories);
        console.log("Categories inserted successfully.");
      } catch (err) {
        console.error("Error inserting categories:", err);
      }
    });
};

const insertProducts = async () => {
  const categoryMap = {};
  const categories = await Category.find();

  // Create a map of category_id (string) to MongoDB _id (ObjectId)
  categories.forEach((category) => {
    categoryMap[category.id.trim()] = category._id; // Store ObjectId directly
  });

  //console.log("Category Map:", categoryMap);

  return new Promise((resolve, reject) => {
    const BATCH_SIZE = 500;
    let productsBatch = [];

    const stream = fs
      .createReadStream("./data/amazon_products.csv")
      .pipe(csv())
      .on("data", (row) => {
        try {
          const mappedCategoryId = categoryMap[row.category_id?.trim()];

          productsBatch.push({
            title: row.title,
            imgUrl: row.imgUrl,
            stars: parseFloat(row.stars),
            reviews: parseInt(row.reviews, 10),
            price: parseFloat(row.price),
            listPrice: parseFloat(row.listPrice),
            category_id: mappedCategoryId,
            isBestSeller: row.isBestSeller === "true",
            boughtInLastMonth: row.boughtInLastMonth === "true",
            quantity: Math.floor(Math.random() * (1000 - 10 + 1)) + 10, //Generate random quantity
          });

          if (productsBatch.length >= BATCH_SIZE) {
            stream.pause(); // Pause the stream to process the batch
            Product.insertMany(productsBatch)
              .then(() => {
                productsBatch = []; // Clear batch
                stream.resume(); // Resume the stream
              })
              .catch((err) => {
                console.error("Error inserting batch:", err);
                reject(err);
              });
          }
        } catch (err) {
          console.error("Error processing row:", err);
        }
      })
      .on("end", async () => {
        try {
          if (productsBatch.length > 0) {
            await Product.insertMany(productsBatch); // Insert remaining items
          }
          console.log("Products inserted successfully.");
          resolve(); // Resolve the Promise
        } catch (err) {
          console.error("Error inserting remaining products:", err);
          reject(err);
        }
      })
      .on("error", (err) => {
        console.error("Error reading CSV file:", err);
        reject(err);
      });
  });
};

module.exports = {
  insertCategories,
  insertProducts,
};
