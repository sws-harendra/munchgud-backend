require("dotenv").config();
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
var logger = require("morgan");
const path = require("path");
const express = require("express");
const cors = require("cors");
require("./config/db");
const { connectRedis } = require("./config/redis_config");

const app = express();
const allowedOrigins = [
  // "http://localhost:3000",
  process.env.CLIENT_URL,
  "http://168.231.126.20:3002",
];

app.use(
  cors({
    origin: allowedOrigins, // or your frontend URL
    credentials: true, // allow sending cookies/headers
  })
);
app.use(express.json());
app.use(cookieParser());
// (async () => {
//   await connectRedis(); // Initialize Redis connection
// })();

app.use(morgan("dev")); // Shows :method :url :status :response-time ms

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use("/api", routes); // All routes prefixed with /api
app.use("/user", require("./routes/user.route")); // /api/user/login
app.use("/products", require("./routes/product.route"));
app.use("/category", require("./routes/category.route"));
app.use("/cart", require("./routes/cart.route"));
app.use("/banners", require("./routes/banner.route"));
app.use("/order", require("./routes/order.route"));
app.use("/dashboard", require("./routes/dashboard.route"));
app.use("/section", require("./routes/section.route"));
app.use("/razorpay", require("./routes/razorpay.route"));
app.use("/static-pages", require("./routes/staticpage.route"));
app.use("/videos", require("./routes/video.route"));
app.use("/artist", require("./routes/artist.route"));
app.use("/upload-media", require("./routes/uploadMedia.route"));
app.use("/admin/blogs", require("./routes/blog.routes"));
app.use("/media-coverage", require("./routes/mediaCoverage.routes"));
app.use("/testimonials", require("./routes/testimonial.route"));
app.use("/variants", require("./routes/variant.route"));
app.use("/driver", require("./routes/driver.route"));
app.use("/review-rating", require("./routes/reviewRating.route"));
app.use("/pincode",require("./routes/pincode.route"));

app.get("/", (req, res) => {
  res.json("hello from backend");
});

let port = process.env.PORT || 8008;
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

module.exports = app;
