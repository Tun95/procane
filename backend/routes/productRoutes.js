import express from "express";
import Product from "../models/productModels.js";
import mongoose from "mongoose";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth, isSellerOrAdmin } from "../utils.js";

const productRouter = express.Router();

productRouter.get("/", async (req, res) => {
  const seller = req.query.seller || "";
  const sellerFilter = seller ? { seller } : {};
  const products = await Product.find({ ...sellerFilter })
    .populate("seller")
    .sort("-createdAt");
  res.send(products);
});

//=============
//TOP SALES FETCH
//=============
productRouter.get(
  "/top-sales",
  expressAsyncHandler(async (req, res) => {
    try {
      const products = await Product.find()
        .sort({ numSales: -1 }) // Sort by numSales in descending order
        .limit(10); // Limit the result to 10 products

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

//=============
//DISCOUNT FETCH
//=============
productRouter.get("/discount", async (req, res) => {
  try {
    const products = await Product.find({ discount: { $gte: 50 } })
      .populate("seller")
      .sort("-createdAt")
      .limit(10);
    res.send(products);
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while retrieving the products." });
  }
});

//=============
//NEW ARRIVAL FETCH
//=============
productRouter.get("/new-arrival", async (req, res) => {
  try {
    const latestProducts = await Product.find()
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (latest first)
      .limit(10); // Limit the results to 10 products

    res.send(latestProducts);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving new arrivals" });
  }
});

//=============
//FLASHDEAL FETCH
//=============
productRouter.get("/flashdeal", async (req, res) => {
  try {
    const seller = req.query.seller || ""; // Get the seller query parameter
    const sellerFilter = seller ? { seller } : {}; // Create the seller filter object
    const products = await Product.find({ flashdeal: true, ...sellerFilter })
      .populate("seller")
      .sort("-createdAt")
      .limit(10);
    res.send(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve flashdeal products" });
  }
});

//==============
//CREATE PRODUCT
//==============
productRouter.post(
  "/",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const { name, slug } = req.body;

    const productNameExist = await Product.findOne({
      $or: [{ name }, { slug }],
    });

    if (productNameExist) {
      return res
        .status(400)
        .send({ message: "Product name or slug already exists" });
    }
    const newProduct = new Product({
      seller: req.user._id,
      ...req.body,
    });

    const product = await newProduct.save();
    res.send({ message: "Product Created Successfully", product });
  })
);

//============================
// AFFILIATE PRODUCTS APPROVAL
//============================
// Update product for affiliate promotion
productRouter.patch(
  "/affiliate/:id",
  // isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const productId = req.params.id;
      const { affiliateEnabled, affiliateCommissionRate } = req.body;

      // Find the product by ID
      const product = await Product.findById(productId);

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      // Update affiliate fields
      product.affiliateEnabled = affiliateEnabled;
      product.affiliateCommissionRate = affiliateCommissionRate;

      // Save the updated product
      const updatedProduct = await product.save();

      res.json({
        message: "Product updated for affiliate promotion",
        product: updatedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

//=======================
//SELLER'S PRODUCT CROSS CHECK
//=======================
productRouter.post(
  "/seller",
  isAuth,
  // isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const sellerId = req.user._id; // Assuming the authenticated user's ID is stored in req.user._id

    try {
      // Fetch products with the specified seller
      const products = await Product.find({ "seller.id": sellerId });

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

//UPDATING PRODUCT
productRouter.put(
  "/:id",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.keygen = req.body.keygen;
      product.category = req.body.category;
      product.size = req.body.size;
      product.color = req.body.color;
      product.brand = req.body.brand;
      product.image = req.body.image;
      product.images = req.body.images;
      product.desc = req.body.desc;
      product.price = req.body.price;
      product.discount = req.body.discount;
      product.flashdeal = Boolean(req.body.flashdeal);
      product.countInStock = req.body.countInStock;
      await product.save();
      res.send({ message: "Product Updated" });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

//PRODUCT DELETE
productRouter.delete(
  "/:id",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.send({ message: "Product Deleted Successfully" });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

//===========================
// SALE PERFORMANCE
//===========================
productRouter.get(
  "/sales-performance/:id",
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;

    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const salesPerformance = await Product.aggregate([
        // Match the specific product by its ID and createdAt greater than or equal to three days ago
        {
          $match: {
            _id: mongoose.Types.ObjectId(productId),
            createdAt: { $gte: threeDaysAgo },
          },
        },
        // Group by date in the specified format and sum up the numSales for each date
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalSales: { $sum: "$numSales" }, // Sum up the numSales for each date
          },
        },
        // Sort the results by date in ascending order
        { $sort: { _id: 1 } },
      ]);

      res.status(200).json(salesPerformance);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "An error occurred while fetching sales performance",
      });
    }
  })
);

//PRODUCT REVIEW
productRouter.post(
  "/:id/reviews",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      // if (product.seller === req.user.id) {
      //   return res
      //     .status(400)
      //     .send({ message: "You can't review your product" });
      // } else {
      if (product.reviews.find((x) => x.email === req.user.email)) {
        return res
          .status(400)
          .send({ message: "You already submitted a review" });
      }
      const review = {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        image: req.user.image,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: "Review Created",
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

//===============
//DELETE REVIEW
//===============
productRouter.delete(
  "/:id/reviews/:reviewId",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const reviewId = req.params.reviewId;

    const product = await Product.findById(productId);
    if (product) {
      const review = product.reviews.find((r) => r._id.toString() === reviewId);
      if (review) {
        // Check if the review belongs to the authenticated user
        if (review.email === req.user.email) {
          // Remove the review from the product's reviews array
          product.reviews = product.reviews.filter(
            (r) => r._id.toString() !== reviewId
          );

          product.numReviews = product.reviews.length;

          // Recalculate the average rating
          if (product.numReviews > 0) {
            product.rating =
              product.reviews.reduce((a, c) => c.rating + a, 0) /
              product.numReviews;
          } else {
            product.rating = 0;
          }

          // Save the updated product
          const updatedProduct = await product.save();

          res.status(200).send({
            message: "Review deleted",
            numReviews: updatedProduct.numReviews,
            rating: updatedProduct.rating,
          });
        } else {
          res.status(401).send({
            message: "Unauthorized: Review does not belong to the user",
          });
        }
      } else {
        res.status(404).send({ message: "Review not found" });
      }
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  })
);

//ADMIN PRODUCT LIST
const ADMIN_PAGE_SIZE = 15;
productRouter.get(
  "/admin",
  // isAuth,
  // isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const seller = query.seller || "";
    const pageSize = query.pageSize || ADMIN_PAGE_SIZE;

    //const sellerFilter = seller ? { seller } : {};
    const sellerFilter = seller && seller !== "all" ? { seller } : {};
    const products = await Product.find({})
      .populate(
        "seller",
        "seller.name seller.logo seller.rating seller.numReviews"
      )
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .sort("-createdAt");

    const countProducts = await Product.countDocuments({
      ...sellerFilter,
    });

    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

//==============
//PRODUCT FILTER
//==============
const PAGE_SIZE = 6;
productRouter.get(
  "/store",
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const seller = query.seller || "";
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || "";
    const color = query.color || "";
    const size = query.size || "";
    const price = query.price || "";
    const numSales = query.numSales || "";
    const discount = query.discount || "";
    const rating = query.rating || "";
    const order = query.order || "";
    const brand = query.brand || "";
    const searchQuery = query.query || "";

    const sellerFilter = seller ? { seller } : {};
    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : {};
    const categoryFilter =
      category && category !== "all"
        ? { category: { $in: category.split(",") } }
        : {};

    const sizeFilter =
      size && size !== "all" ? { size: { $in: size.split(",") } } : {};
    const colorFilter =
      color && color !== "all" ? { color: { $in: color.split(",") } } : {};
    const brandFilter =
      brand && brand !== "all" ? { brand: { $in: brand.split(",") } } : {};
    const ratingFilter =
      rating && rating !== "all"
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const numSalesFilter =
      numSales && numSales !== "all"
        ? {
            numSales: {
              $gte: Number(numSales),
            },
          }
        : {};
    const discountFilter =
      discount && discount !== "all"
        ? {
            discount: {
              $gte: 50,
            },
          }
        : {};
    const priceFilter =
      price && price !== "all"
        ? {
            price: {
              $gte: Number(price.split("-")[0]),
              $lte: Number(price.split("-")[1]),
            },
          }
        : {};

    const sortOrder =
      order === "featured"
        ? { featured: -1 }
        : order === "lowest"
        ? { price: 1 }
        : order === "highest"
        ? { price: -1 }
        : order === "toprated"
        ? { rating: -1 }
        : order === "numsales"
        ? { numSales: -1 }
        : order === "discount"
        ? { discount: -1 }
        : order === "newest"
        ? { createdAt: -1 }
        : { _id: -1 };

    const filters = {
      ...queryFilter,
      ...categoryFilter,
      ...sellerFilter,
      ...colorFilter,
      ...sizeFilter,
      ...brandFilter,
      ...priceFilter,
      ...ratingFilter,
      ...numSalesFilter,
      ...discountFilter,
    };

    const products = await Product.find(filters)
      .populate("seller")
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments(filters);

    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
    console.log(discountFilter); // Check the discount filter object
  })
);

//=========================
//SHOPFINITY PRODUCT FILTER
//=========================
const PAGE_PRODUCT_SIZE = 8;
productRouter.get(
  "/shop",
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_PRODUCT_SIZE;
    const page = query.page || 1;
    const category = query.category || "";
    const color = query.color || "";
    const size = query.size || "";
    const price = query.price || "";
    const numSales = query.numSales || "";
    const discount = query.discount || "";
    const rating = query.rating || "";
    const order = query.order || "";
    const brand = query.brand || "";
    const searchQuery = query.query || "";

    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : {};
    const categoryFilter =
      category && category !== "all"
        ? { category: { $in: category.split(",") } }
        : {};

    const sizeFilter =
      size && size !== "all" ? { size: { $in: size.split(",") } } : {};
    const colorFilter =
      color && color !== "all" ? { color: { $in: color.split(",") } } : {};
    const brandFilter =
      brand && brand !== "all" ? { brand: { $in: brand.split(",") } } : {};
    const ratingFilter =
      rating && rating !== "all"
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const numSalesFilter =
      numSales && numSales !== "all"
        ? {
            numSales: {
              $gte: Number(numSales),
            },
          }
        : {};
    const discountFilter =
      discount && discount !== "all"
        ? {
            discount: {
              $gte: 50,
            },
          }
        : {};
    const priceFilter =
      price && price !== "all"
        ? {
            price: {
              $gte: Number(price.split("-")[0]),
              $lte: Number(price.split("-")[1]),
            },
          }
        : {};

    const sortOrder =
      order === "featured"
        ? { featured: -1 }
        : order === "lowest"
        ? { price: 1 }
        : order === "highest"
        ? { price: -1 }
        : order === "toprated"
        ? { rating: -1 }
        : order === "numsales"
        ? { numSales: -1 }
        : order === "discount"
        ? { discount: -1 }
        : order === "newest"
        ? { createdAt: -1 }
        : { _id: -1 };

    const filters = {
      ...queryFilter,
      ...categoryFilter,

      ...colorFilter,
      ...sizeFilter,
      ...brandFilter,
      ...priceFilter,
      ...ratingFilter,
      ...numSalesFilter,
      ...discountFilter,
    };

    const products = await Product.find(filters)
      .populate("seller wish")
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments(filters);

    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
    console.log(discountFilter); // Check the discount filter object
  })
);

//CATEGORIES
productRouter.get(
  "/categories",
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find(req.params.category);
    res.send(categories);
  })
);

// ===========================
// PRODUCT DETAILS BY SLUG
// ===========================
productRouter.get("/slug/:slug", async (req, res) => {
  const decodedSlug = decodeURIComponent(req.params.slug); // Decode the slug
  const product = await Product.findOne({ slug: decodedSlug }).populate(
    "seller wish"
  );

  if (!product) {
    return res.status(404).send({ message: "Product Not Found" });
  }

  if (req.query.affiliateCode) {
    // If the request contains an affiliateCode, provide the affiliate link
    const affiliateCode = req.query.affiliateCode;
    const affiliateLink = `${
      process.env.SUB_DOMAIN
    }/product/${encodeURIComponent(
      product.slug
    )}?affiliateCode=${affiliateCode}`;

    // Send the product details along with the affiliate link in the response
    res.send({ product, affiliateLink });
  } else {
    // If no affiliateCode is provided, send only the product details
    res.send(product);
  }
});

//===============
//RELATED PRODUCT
//===============
productRouter.get("/related/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const related = await Product.find({
      _id: { $ne: product._id }, // Use product._id instead of product
      category: product.category,
    })
      .limit(6)
      .populate("category", "name");

    console.log("RELATED PRODUCTS", related);
    res.json(related);
  } catch (err) {
    console.log(err);
  }
});

// ===========================
// AFFILIATE LINKS FOR PRODUCT
// ===========================
productRouter.get("/affiliate/:slug", async (req, res) => {
  try {
    const decodedSlug = decodeURIComponent(req.params.slug); // Decode the slug
    const product = await Product.findOne({ slug: decodedSlug }).populate(
      "seller"
    );

    if (!product) {
      return res.status(404).send({ message: "Product Not Found" });
    }

    const { affiliateCode } = req.query;
    const affiliateLink = `${
      process.env.SUB_DOMAIN
    }/product/slug/${encodeURIComponent(
      product.slug
    )}?affiliateCode=${affiliateCode}`;

    // Send the product details along with the affiliate link in the response
    res.send({ product, affiliateLink });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

//PRODUCT DETAILS BY ID
productRouter.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "seller order"
  );
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

//===========================
//ADMIN PRODUCT DETAILS BY ID
//===========================
productRouter.get("/admin/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(productId) } },
      {
        $addFields: {
          seller: { $ifNull: ["$seller", null] }, // Set a default value for seller if it's not present
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "orderItems.product",
          as: "orders",
        },
      },
      {
        $addFields: {
          sold: { $slice: ["$sold", -3] }, // Limit the 'sold' array to the last 3 entries
        },
      },
    ]);

    if (product.length === 0) {
      return res.status(404).send({ message: "Product Not Found" });
    }

    // Assuming there's only one product with the given ID
    res.send(product[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default productRouter;
