const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { User, Address } = require("../models");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/errorHandler");
const { getRedisClient } = require("../config/redis_config");
const { Op } = require("sequelize");

// const sendMail = require("../utils/sendMail");
const { sendToken, generateAccessToken } = require("../helpers/jwtToken");
const { where } = require("sequelize");
const { sendmail } = require("../helpers/mailSend");
// const client = getRedisClient();

// ✅ Register user
exports.registerUser = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });

    if (existing) {
      if (req.file) fs.unlinkSync(`uploads/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: "Record already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const avatar = req.file ? req.file.filename : null;
    const userData = { fullname, email, password: hashedPassword, avatar };

    const activationToken = jwt.sign(userData, process.env.ACTIVATION_SECRET, {
      expiresIn: "5m",
    });

    const activationUrl = `http://localhost:3000/activation/${activationToken}`;
    console.log(activationToken);
    // await sendMail({
    //   email,
    //   subject: "Activate your account",
    //   message: `Hello ${fullname}, click here: ${activationUrl}`,
    // });

    console.log("hererere=->");
    await sendmail(
      "email_verify.hbs",
      {
        fullname,
        activationUrl,
      },
      email,
      "Verify Your account"
    );

    res.status(201).json({
      success: true,
      message: `Check your email (${email}) to activate your account!`,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Activate user
exports.activateUser = async (req, res, next) => {
  try {
    const { activation_token } = req.body;
    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    let user = await User.findOne({
      where: { email: newUser.email },
      attributes: { exclude: ["password"] },
    });
    if (user) return next(new ErrorHandler("User already exists", 400));

    user = await User.create(newUser);
    sendToken(user, 201, res);
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Login
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Please provide all fields", 400));
    }

    // Fetch WITH password (needed for bcrypt check)
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Address,
          as: "addresses", // must match your association alias
        },
      ],
    });
    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    // Remove password before sending response
    const { password: pass, ...safeUser } = user.toJSON();
    console.log("here==>");
    sendToken(safeUser, 200, res);
  } catch (err) {
    console.log(err);
    next(new ErrorHandler(err.message, 500));
  }
};
// ✅ Get logged in user
exports.getUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Check Redis cache first
    // const cachedUser = await client.get(`user:${userId}`);
    // if (cachedUser) {
    //   console.log("Serving from cache");
    //   return res.json({ success: true, user: JSON.parse(cachedUser) });
    // }

    // 2. If not in cache, fetch from DB
    const user = await User.findByPk(userId, {
      include: [{ model: Address, as: "addresses" }],
    });
    if (!user) return next(new ErrorHandler("User not found", 400));

    // 3. Save in Redis with TTL (e.g., 1 hour)
    // await client.setEx(`user:${userId}`, 3600, JSON.stringify(user));

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ✅ Update info
exports.updateUserInfo = async (req, res, next) => {
  try {
    const { email, fullname, phoneNumber, password } = req.body;
    const user = await User.findByPk(req.user.id);

    await user.update({ fullname, email, phoneNumber });
    // await client.del(`user:${req.user.id}`);

    res.json({ success: true, user });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Update avatar
exports.updateAvatar = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user.avatar) fs.unlinkSync(`uploads/${user.avatar}`);
    await user.update({ avatar: req.file.filename });
    // await client.del(`user:${req.user.id}`);

    res.json({ success: true, user });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Add / Update address
exports.updateUserAddress = async (req, res, next) => {
  try {
    const { addressType } = req.body;
    const exists = await Address.findOne({
      where: { userId: req.user.id, addressType },
    });

    if (exists)
      return next(new ErrorHandler(`${addressType} already exists`, 400));

    const address = await Address.create({ ...req.body, userId: req.user.id });
    // await client.del(`user:${req.user.id}`);

    res.json({ success: true, address });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Delete address
exports.deleteUserAddress = async (req, res, next) => {
  try {
    await Address.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    const addresses = await Address.findAll({ where: { userId: req.user.id } });
    res.json({ success: true, addresses });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isValid = await user.comparePassword(oldPassword);
    if (!isValid) return next(new ErrorHandler("Old password wrong", 400));
    if (newPassword !== confirmPassword)
      return next(new ErrorHandler("Passwords do not match", 400));

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated!" });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Get user by id
exports.getUserById = async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Address, as: "addresses" }],
  });
  if (!user) return next(new ErrorHandler("User not found", 400));
  res.json({ success: true, user });
};

exports.getAllUsers = async (req, res, next) => {
  try {
    // ✅ Pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    // ✅ Filters
    const { search, role, status, startDate, endDate } = req.query;

    let where = {};

    // 🔍 Search by name or email
    if (search) {
      where[Op.or] = [
        { fullname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // 🎭 Filter by role
    if (role) {
      where.role = role;
    }

    // ⚡ Filter by status (active/inactive)
    // if (status) {
    //   where.status = status;
    // }

    // 📅 Filter by date range
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // ✅ Query with pagination & filters
    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [{ model: Address, as: "addresses" }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      totalUsers: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Admin delete user
exports.deleteUser = async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 400));
  await user.destroy();
  res.json({ success: true, message: "User deleted!" });
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    console.log("here==>");
    const token = req.cookies.refreshToken || req.body.refreshToken;
    console.log("-435", token);

    if (!token)
      return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    console.log("-441", user);
    if (!user)
      return res
        .status(403)
        .json({ message: "Invalid token - user not found" });

    const newAccessToken = generateAccessToken(user);
    console.log("-458", newAccessToken);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired" });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
