const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const { router: authRoutes, authenticateJWT } = require("./auth");
const cartRoutes = require("./cart");

app.use(authRoutes);
app.use(cartRoutes);

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://tl22btcs0185:flipkart@cluster0.ry7r4r8.mongodb.net/ecommerce",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));


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








// Define Product Model
// const productSchema = new mongoose.Schema({
//   name: String,
//   price: Number,
//   description: String,
//   image: String
// });
// const Product = mongoose.model("Product", productSchema);


// Define Product Model
// const productSchema = new mongoose.Schema(
//   {
//     id: { type: Number, required: true, unique: true }, // Custom ID from data.json
//     title: { type: String, required: true },
//     description: String,
//     price: { type: Number, required: true },
//     discountPercentage: { type: Number, default: 0 },
//     rating: { type: Number, default: 0 },
//     stock: { type: Number, default: 0 },
//     brand: String,
//     category: String,
//     thumbnail: String,
//     images: [String],
//     deleted: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

const Product = require("./models/Product");




// Fetch all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "There is internal server error" });
  }
});

// Fetch product by ID
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "The items that you were searching for does not exist" });
    } else {
      res.json(product);
    }
  } catch (error) {
    res.status(500).json({ error: "SERVER ERROR" });
  }
});

app.listen(8080, () => {
  console.log("SERVER IS RUNNING ON PORT 8080");
});
