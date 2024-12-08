const Product = require("../models/Product");
const { elasticClient } = require("../configs/elasticSearch");
const productController = {
  getProducts: async (req, res) => {
    try {
      //console.log(req.query);
      const { search, page, limit, order, minPrice, maxPrice } = req.query;
      const offset = (page - 1) * limit;

      // Build the Elasticsearch query
      const query = {
        bool: {
          must: [
            {
              match: {
                title: search,
              },
            },
          ],
          filter: [],
        },
      };

      // Add price range filter if applicable
      if (minPrice && maxPrice) {
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        if (!isNaN(min) && !isNaN(max)) {
          query.bool.filter.push({
            range: {
              price: {
                gte: min,
                lte: max,
              },
            },
          });
        }
      }

      // Sorting options
      const sortDirection = order === "desc" ? "desc" : "asc";
      const sortField = "price";

      // Execute the Elasticsearch search
      const response = await elasticClient.search({
        index: "products",
        from: offset,
        size: 12,
        query: query,
        sort: [{ [sortField]: { order: sortDirection } }],
      });

      //console.log(response);
      // Process the Elasticsearch response
      const totalHits = response.hits.total.value;
      const products = response.hits.hits.map((hit) => hit._source);
      //console.log(products);

      res.status(200).json({
        success: true,
        message: "Search products successfully!",
        data: products,
        totalPages: Math.ceil(totalHits / limit),
        totalProducts: totalHits,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err,
        data: [],
      });
    }
  },

  getSimilarProducts: async (req, res) => {
    try {
      const id = req.params.id;
      const product = await Product.findById(id);
      const productCategory = product.category_id;
      const similarProducts = await Product.find({
        category_id: { $in: productCategory },
        _id: { $ne: id },
      }).limit(3);

      res.status(200).json({
        success: true,
        message: "Get similar products successfully!",
        data: similarProducts,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err,
        data: [],
      });
    }
  },
  getProductById: async (req, res) => {
    try {
      const id = req.params.id;

      const product = await Product.findById(id);

      res.status(200).json({
        success: true,
        message: "Get product successfully !",
        data: product,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err,
        data: {},
      });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const updateProduct = {
        title: req.body.title,
        category_id: req.body.category_id,
        quantity: req.body.quantity,
        imgUrl: req.body.imgUrl,
        stars: req.body.stars,
        reviews: req.body.reviews,
        price: req.body.price,
        listPrice: req.body.listPrice,
      };

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateProduct,
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
          data: {},
        });
      }
      return res.status(200).json({
        success: true,
        message: "Edit Product successfully !",
        data: updatedProduct,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: err,
        data: {},
      });
    }
  },

  getAllProductInCate: async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      console.log(categoryId);
      const { page, limit, order, minPrice, maxPrice } = req.query;
      const offset = (page - 1) * limit;

      const keyWordSearch = req.query.search;

      const query = {
        category_id: categoryId,
      };

      if (keyWordSearch) {
        query.$or = [
          { name: { $regex: new RegExp(keyWordSearch, "i") } },
          { id: { $regex: new RegExp(keyWordSearch, "i") } },
        ];
      }

      if (minPrice && maxPrice) {
        query.price = { $gte: minPrice, $lte: maxPrice };
      }

      const sortDirection = order === "desc" ? -1 : 1;
      const sortField = "price";

      const products = await Product.find(query)
        .skip(offset)
        .limit(limit)
        .sort({ [sortField]: sortDirection })
        .exec();
      const totalProducts = await Product.countDocuments(query).exec();

      res.status(200).json({
        success: true,
        message: "Get all products in category successfully!",
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts: totalProducts,
        data: products,
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

module.exports = productController;
