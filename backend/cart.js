const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Product = require("./models/Product"); // adjust path as needed

// Cart Schema
// const cartSchema = new mongoose.Schema(
//   {
//     userId: { type: String, required: true },
//     items: [
//       {
//         productId: { type: String, required: true },
//         quantity: { type: Number, default: 1 },
//       },
//     ],
//     status: { type: String, default: "active" },
//   },
//   { timestamps: true }
// );
/**
 * Paste one or more documents here
 */
// {
//   "title": "Huawei P30",
//   "description": "Huawei’s re-badged P30 Pro New Edition was officially unveiled yesterday in Germany and now the device has made its way to the UK.",
//   "price": 499,
//   "discountPercentage": 10.58,
//   "rating": 4.09,
//   "stock": 32,
//   "brand": "Huawei",
//   "category": "smartphones",
//   "thumbnail": "https://i.dummyjson.com/data/products/5/thumbnail.jpg",
//   "images": [
//     "https://i.dummyjson.com/data/products/5/1.jpg",
//     "https://i.dummyjson.com/data/products/5/2.jpg",
//     "https://i.dummyjson.com/data/products/5/3.jpg"
//   ],
//   "productId": 5,
//   "quantity": 1,
//   "user": 2,
//   "id": 1
// }

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        title: String,
        description: String,
        price: Number,
        discountPercentage: Number,
        rating: Number,
        stock: Number,
        brand: String,
        category: String,
        thumbnail: String,
        images: [String],
        quantity: { type: Number, default: 1 },
      },
    ],
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

// // Add item to cart
// Add item to cart
router.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity = 1, userId } = req.body;

    if (!productId || !userId) {
      return res
        .status(400)
        .json({ message: "PRODUCT ID AND USER ID IS REQUIRED" });
    }

    // Find the product details from products collection
    const product = await Product.findOne({ id: productId });
    // const product = await Product.findOne({ productId: productId });
    if (!product) {
      const allProducts = await Product.find({}, { id: 1, title: 1 });
      return res.status(404).json({
        message: "Product not found",
        availableProducts: allProducts,
      });
    }

    let cart = await Cart.findOne({ userId, status: "active" });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === String(productId)
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        productId: String(productId),
        title: product.title,
        description: product.description,
        price: product.price,
        discountPercentage: product.discountPercentage,
        rating: product.rating,
        stock: product.stock,
        brand: product.brand,
        category: product.category,
        thumbnail: product.thumbnail,
        images: product.images,
        quantity: Number(quantity),
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res
      .status(500)
      .json({ error: "INTERNAL SERVER ERROR, ITEM HAS NOT BEEN ADDED" });
  }
});

router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json({ success: true, count: carts.length, data: carts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch carts" });
  }
});

// router.post("/cart/add", async (req, res) => {
//   try {
//     const { productId, quantity = 1, userId } = req.body;

//     if (!productId || !userId) {
//       return res
//         .status(400)
//         .json({ message: "PRODUCT ID AND USER ID IS REQUIRED" });
//     }

//     let cart = await Cart.findOne({ userId, status: "active" });

//     if (!cart) {
//       cart = new Cart({ userId, items: [] });
//     }

//     const existingItemIndex = cart.items.findIndex(
//       (item) => item.productId === productId
//     );

//     if (existingItemIndex > -1) {
//       cart.items[existingItemIndex].quantity += Number(quantity);
//     } else {
//       cart.items.push({ productId, quantity: Number(quantity) });
//     }

//     await cart.save();

//     res.status(200).json({
//       success: true,
//       message: "Item added to cart",
//       cart,
//     });
//   } catch (err) {
//     console.error("Add to cart error:", err);
//     res
//       .status(500)
//       .json({ error: "INTERNAL SERVER ERROR, ITEM HAS NOT BEEN ADDED" });
//   }
// });

// Fetch all cart items
router.get("/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId, status: "active" });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("ERROR IN FETCHING THE CART DATA", error);
    res.status(500).json({
      success: false,
      message: "Failed to Fetch data",
      error: error.message,
    });
  }
});


// 3. Test Deleting an Item
// bash
// Copy
// Edit
// DELETE http://localhost:8080/cart/2/5
// This should remove productId: 5 from the cart.

// 4. Test Clearing Entire Cart
// bash
// Copy
// Edit
// DELETE http://localhost:8080/cart/clear/2
// This should empty the cart's items array.





// DELETE a single product from cart
router.delete("/cart/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const cart = await Cart.findOne({ userId, status: "active" });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    if (cart.items.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Item removed from cart", cart });
  } catch (err) {
    console.error("Delete cart item error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// CLEAR entire cart
router.delete("/cart/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId, status: "active" });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ success: true, message: "Cart cleared", cart });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
