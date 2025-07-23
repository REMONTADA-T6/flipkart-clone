const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// Cart Schema
const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

// Add item to cart
router.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity = 1, userId } = req.body;

    if (!productId || !userId) {
      return res
        .status(400)
        .json({ message: "PRODUCT ID AND USER ID IS REQUIRED" });
    }

    let cart = await Cart.findOne({ userId, status: "active" });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({ productId, quantity: Number(quantity) });
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
