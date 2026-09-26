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

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
        fs.unlinkSync(`uploads/${req.file.filename}`);
      }
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = req.file ? req.file.filename : null;
    const userData = {
      fullname,
      email,
      password: hashedPassword,
      avatar,
      role: "user",
    };

    const user = await User.create(userData);

    // Send welcome / activation email asynchronously (safely catch any smtp/network error)
    try {
      const activationToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.ACTIVATION_SECRET || "munchgud_activation_secret_key_2026",
        { expiresIn: "1d" }
      );
      const activationUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/activation/${activationToken}`;

      await sendmail(
        "email_verify.hbs",
        {
          fullname,
          activationUrl,
        },
        email,
        "Welcome to MunchGud - Account Created"
      );
    } catch (mailErr) {
      console.log("Email dispatch skipped/failed:", mailErr.message);
    }

    // Strip password and send tokens
    const { password: pass, ...safeUser } = user.toJSON();
    return sendToken(safeUser, 201, res);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    next(new ErrorHandler(err.message, 500));
  }
};
exports.updateUser = async (req, res, next) => {
  try {
    const { fullname, email, phoneNumber, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (req.file && user.avatar && fs.existsSync(`uploads/${user.avatar}`)) {
      fs.unlinkSync(`uploads/${user.avatar}`);
    }

    const avatar = req.file ? req.file.filename : user.avatar;

    await user.update({ fullname, email, phoneNumber, role, avatar });

    res.json({ success: true, user });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};
// ✅ Activate user
exports.activateUser = async (req, res, next) => {
  try {
    const { activation_token } = req.body;
    if (!activation_token) {
      return next(new ErrorHandler("Activation token is required", 400));
    }
    const decoded = jwt.verify(activation_token, process.env.ACTIVATION_SECRET || "munchgud_activation_secret_key_2026");

    const email = decoded.email;
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      const { password: pass, ...safeUser } = existing.toJSON();
      return sendToken(safeUser, 200, res);
    }

    const user = await User.create(decoded);
    const { password: pass, ...safeUser } = user.toJSON();
    return sendToken(safeUser, 201, res);
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

exports.registerUserByAdmin = async (req, res, next) => {
  try {
    const { fullname, email, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });

    if (existing) {
      if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
        fs.unlinkSync(`uploads/${req.file.filename}`);
      }
      return res.status(400).json({
        success: false,
        message: "Record already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const avatar = req.file ? req.file.filename : null;
    const userData = {
      fullname,
      email,
      password: hashedPassword,
      role,
      avatar,
    };

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: `User created successfully!`,
      user,
    });
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

    console.log(req.body)
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(user);
    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
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


// 🔐 FORGOT PASSWORD START

const crypto = require("crypto");

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // ❗ VALIDATION
    if (!email) {
      return next(new ErrorHandler("Email is required", 400));
    }

    // 🔍 FIND USER
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // 🔐 GENERATE TOKEN
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 💾 SAVE IN DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    // 🔗 RESET LINK
    const resetUrl = `${process.env.CLIENT_URL}/authentication/reset-password/${resetToken}`;

    console.log("\n🔐 PASSWORD RESET");
    console.log("📧 Email:", user.email);
    console.log("🔗 Link:", resetUrl);
    console.log("====================================\n");

    await sendmail(
      "reset_password.hbs",
      {
        fullname: user.fullname,
        resetUrl,
      },
      user.email,
      "Reset Your Password"
    );

    return res.status(200).json({
      success: true,
      message: "Reset link generated ",
    });

  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};


// 🔐 RESET PASSWORD START

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // 1️⃣ Validation
    if (!password || !confirmPassword) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    if (password !== confirmPassword) {
      return next(new ErrorHandler("Passwords do not match", 400));
    }

    // 2️⃣ Hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 3️⃣ Find user with VALID token
    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return next(new ErrorHandler("Token expired or invalid", 400));
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Update user
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    // 6️⃣ Optional: Auto login after reset
    // sendToken(user, 200, res);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (err) {
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
    const { email, fullname, phoneNumber, secondaryNumber } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Never allow mutating admin's primary email address through updateUserInfo
    if (user.role === "admin" && email && email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Admin email address cannot be changed through profile update",
      });
    }

    // Check if new email is already in use by another user
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
          success: false,
          message: "This email address is already in use by another account",
        });
      }
    }

    await user.update({
      fullname: fullname !== undefined ? fullname : user.fullname,
      email: (email && user.role !== "admin") ? email.toLowerCase() : user.email,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : user.phoneNumber,
      secondaryNumber: secondaryNumber !== undefined ? secondaryNumber : user.secondaryNumber,
    });

    res.json({ success: true, user });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Update avatar
exports.updateAvatar = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user.avatar && fs.existsSync(`uploads/${user.avatar}`)) {
      fs.unlinkSync(`uploads/${user.avatar}`);
    }
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

    user.password = await bcrypt.hash(newPassword, 10);
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
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpire"] },
      include: [{ model: Address, as: "addresses" }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
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
