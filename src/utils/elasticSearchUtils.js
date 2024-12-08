const { elasticClient } = require("../configs/elasticSearch");
const Product = require("../models/Product");

const pageSize = 1000; // Adjust batch size as needed
let pageNumber = 0;

async function createIndex() {
  try {
    const indexExists = await elasticClient.indices.exists({
      index: "products",
    });

    if (!indexExists) {
      const response = await elasticClient.indices.create({
        index: "products",
        body: {
          mappings: {
            properties: {
              title: { type: "text" },
              imgUrl: { type: "keyword" },
              stars: { type: "integer" },
              reviews: { type: "integer" },
              price: { type: "float" },
              listPrice: { type: "float" },
              category_id: { type: "keyword" },
              isBestSeller: { type: "boolean" },
              boughtInLastMonth: { type: "boolean" },
              quantity: { type: "integer" },
            },
          },
        },
      });
      console.log("Index created:", response);
    } else {
      console.log("Index 'products' already exists.");
    }
  } catch (error) {
    console.error("Error creating index:", error);
  }
}

async function deleteAllFromES() {
  try {
    // Delete the entire index
    await elasticClient.indices.delete({ index: "products" });
    console.log("Deleted all data from Elasticsearch");
  } catch (error) {
    console.error("Error deleting data from Elasticsearch", error);
  }
}

async function getmappingFromES() {
  try {
    const response = await elasticClient.indices.getMapping();
    console.log(response.products.mappings.properties);
  } catch (error) {
    console.error("Error deleting data from Elasticsearch", error);
  }
}

async function testSearchFromES() {
  try {
    const response = await elasticClient.search({
      index: "products",
      from: 0,
      size: 20,

      query: {
        bool: {
          must: [
            {
              match: {
                title: "Luggage",
              },
            },
          ],
          filter: [
            {
              range: {
                price: {
                  gte: 16.0,
                  lte: 18.0,
                },
              },
            },
          ],
        },
      },
    });
    console.log(response.hits.hits);
  } catch (error) {
    console.error("Error deleting data from Elasticsearch", error);
  }
}

async function transferDataFromMongoToES() {
  try {
    // Check if the index exists before proceeding
    const indexExists = await elasticClient.indices.exists({
      index: "products",
    });

    if (!indexExists) {
      console.log("Index 'products' does not exist. Creating index...");
      await createIndex(); // Create the index if it does not exist

      // Retrieve the products to index
      const products = await Product.find({})
        .skip(pageNumber * pageSize) // Skip the already indexed records
        .limit(pageSize);

      if (products.length === 0) return; // Stop if no more data

      // Prepare the bulk data for insertion
      const body = products.flatMap((doc) => [
        { index: { _index: "products", _id: doc._id } },
        {
          title: doc.title,
          imgUrl: doc.imgUrl,
          stars: doc.stars,
          reviews: doc.reviews,
          price: doc.price,
          listPrice: doc.listPrice,
          category_id: doc.category_id,
          isBestSeller: doc.isBestSeller,
          boughtInLastMonth: doc.boughtInLastMonth,
          quantity: doc.quantity,
        },
      ]);

      // Bulk insert data into Elasticsearch
      const response = await elasticClient.bulk({ body });
      if (response.errors) {
        console.log("Bulk insert failed", response.errors);
      } else {
        console.log(`Inserted page ${pageNumber + 1}`);
        console.log(response.items);
      }

      // Increment the page number and recursively call for the next batch
      pageNumber++;
      transferDataFromMongoToES();
    } else {
      return; //do nothing
    }
  } catch (error) {
    console.error("Error indexing to Elasticsearch", error);
    deleteAllFromES();
  }
}

module.exports = {
  transferDataFromMongoToES,
  getmappingFromES,
  testSearchFromES,
};
