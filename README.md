# Elastic search has to be installed locally to use!!
.env file structure
PORT = 8000

MONGO_URL = 
MONGO_DBNAME=

ELASTICSEARCH_USERNAME = 
ELASTICSEARCH_PASSWORD = 

- Create a data folder and extract [data](https://www.kaggle.com/datasets/asaniczka/amazon-products-dataset-2023-1-4m-products?select=amazon_products.csv) here to use for mongodb
- run **npm i**, **npm start** to start
- Access **http://localhost:8000/seed** to import data from data folder to your mongodb
- Access **http://localhost:8000/api/product** for elastic search demo, some parameters to use:
    + search: search keyword
    + page
    + limit
    + minPrice
    + maxPrice
    + order: asc or dsc, sort based on price

