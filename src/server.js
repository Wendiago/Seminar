const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const productRoute = require("./routes/product");
const categoryRoute = require("./routes/category");

const connectToDB = require("./configs/db");
const { insertCategories, insertProducts } = require("./utils/seedDB.js");
const {
  transferDataFromMongoToES,
  getmappingFromES,
  testSearchFromES,
} = require("./utils/elasticSearchUtils.js");
const {
  SyncMongoDbWithElasticSearch,
} = require("synchronize-mongodb-elasticsearch");
const { elasticOption } = require("./configs/elasticSearch.js");

const PORT = process.env.PORT || 8000;

const app = express();

//CONNECT DATABASE
connectToDB();

// This function creates a "products" index in Elastic search and define mapping if not exists
// Then it transfer data from mongodb to elastic search
// If the process encounters an error, the index will be deleted so we can restart for more convenience
transferDataFromMongoToES();

//Test mapping
//getmappingFromES();

//Test search
//testSearchFromES();

//Syncing mongodb and elastic search
const mongoDbOptions = {
  uri: process.env.MONGO_URL,
  dbName: process.env.MONGO_DBNAME,
};

const syncDbWithElasticsearch = new SyncMongoDbWithElasticSearch(
  mongoDbOptions,
  elasticOption
);

syncDbWithElasticsearch.start();

// Use this route on first run to import data from csv file to your Mongodb database
app.use("/seed", async () => {
  try {
    await insertCategories();
    await insertProducts();
    console.log("Seed database successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    res.status(500).send("An error occurred while seeding data.");
  }
});

//ROUTES
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
