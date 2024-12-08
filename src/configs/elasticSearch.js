const { Client } = require("@elastic/elasticsearch");
const dotenv = require("dotenv");
dotenv.config();

const elasticOption = {
  node: "http://localhost:9200",
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
};

const elasticClient = new Client(elasticOption);

module.exports = { elasticClient, elasticOption };
