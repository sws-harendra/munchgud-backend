const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { User, Address, OtpVerification } = require("../models");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/errorHandler");
const { getRedisClient } = require("../config/redis_config");
const { Op } = require("sequelize");
const smsService = require("../helpers/smsService");

// const sendMail = require("../utils/sendMail");
const { sendToken, generateAccessToken } = require("../helpers/jwtToken");
const { where } = require("sequelize");
const { sendmail } = require("../helpers/mailSend");
// const client = getRedisClient();

// ✅ Register user (direct/fallback)
exports.registerUser = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;
    const rawPhone = req.body.phoneNumber || req.body.phone;

    if (!fullname || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name and password are required",
      });
    }

    const cleanPhone = rawPhone ? smsService.normalizePhoneNumber(rawPhone) : null;
    if (cleanPhone) {
      const existingPhone = await User.findOne({
        where: {
          [Op.or]: [
            { phoneNumber: cleanPhone },
            { phoneNumber: Number(cleanPhone) || 0 },
          ],
        },
      });
      if (existingPhone) {
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.unlinkSync(`uploads/${req.file.filename}`);
        }
        return res.status(400).json({
          success: false,
          message: "An account with this mobile number already exists",
        });
      }
    }

    let trimmedEmail = email ? email.trim().toLowerCase() : null;
    if (trimmedEmail) {
      const existing = await User.findOne({ where: { email: trimmedEmail } });
      if (existing) {
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.unlinkSync(`uploads/${req.file.filename}`);
        }
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = req.file ? req.file.filename : null;
    const userData = {
      fullname,
      email: trimmedEmail || null,
      phoneNumber: cleanPhone,
      password: hashedPassword,
      avatar,
      role: "user",
    };

    const user = await User.create(userData);

    // Send welcome email if email provided
    if (trimmedEmail) {
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
          trimmedEmail,
          "Welcome to Flazo - Account Created"
        );
      } catch (mailErr) {
        console.log("Email dispatch skipped/failed:", mailErr.message);
      }
    }

    // Strip password and send tokens
    const { password: pass, ...safeUser } = user.toJSON();
    return sendToken(safeUser, 201, res);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "An account with this email or mobile number already exists",
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
    const { fullname, email, password, role = "user" } = req.body;
    const rawPhone = req.body.phoneNumber || req.body.phone;

    if (!fullname || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name and password are required",
      });
    }

    const cleanPhone = rawPhone ? smsService.normalizePhoneNumber(rawPhone) : null;
    if (cleanPhone) {
      const existingPhone = await User.findOne({
        where: {
          [Op.or]: [
            { phoneNumber: cleanPhone },
            { phoneNumber: Number(cleanPhone) || 0 },
          ],
        },
      });
      if (existingPhone) {
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.unlinkSync(`uploads/${req.file.filename}`);
        }
        return res.status(400).json({
          success: false,
          message: "An account with this mobile number already exists",
        });
      }
    }

    const trimmedEmail = email ? email.trim().toLowerCase() : null;
    if (trimmedEmail) {
      const existing = await User.findOne({ where: { email: trimmedEmail } });
      if (existing) {
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.unlinkSync(`uploads/${req.file.filename}`);
        }
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = req.file ? req.file.filename : null;
    const userData = {
      fullname,
      email: trimmedEmail || null,
      phoneNumber: cleanPhone,
      password: hashedPassword,
      role: role || "user",
      avatar,
    };

    const user = await User.create(userData);

    const { password: pass, ...safeUser } = user.toJSON();
    res.status(201).json({
      success: true,
      message: `User created successfully!`,
      user: safeUser,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "An account with this email or mobile number already exists",
      });
    }
    next(new ErrorHandler(err.message, 500));
  }
};
// ✅ Login (Supports Email OR Mobile Number + Password)
exports.loginUser = async (req, res, next) => {
  try {
    const rawIdentifier = (
      req.body.email ||
      req.body.phoneNumber ||
      req.body.phone ||
      req.body.identifier ||
      ""
    )
      .toString()
      .trim();
    const { password } = req.body;

    if (!rawIdentifier || !password) {
      return next(
        new ErrorHandler("Please provide email/mobile number and password", 400)
      );
    }

    const isEmail = rawIdentifier.includes("@");
    let whereCondition;

    if (isEmail) {
      whereCondition = { email: rawIdentifier.toLowerCase() };
    } else {
      const cleanPhone = smsService.normalizePhoneNumber(rawIdentifier);
      whereCondition = {
        [Op.or]: [
          { phoneNumber: cleanPhone },
          { phoneNumber: Number(cleanPhone) || 0 },
          { email: rawIdentifier },
        ],
      };
    }

    // Fetch WITH password (needed for bcrypt check)
    const user = await User.findOne({
      where: whereCondition,
      include: [
        {
          model: Address,
          as: "addresses",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please check your credentials.",
      });
    }

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
    sendToken(safeUser, 200, res);
  } catch (err) {
    console.log(err);
    next(new ErrorHandler(err.message, 500));
  }
};

// 📱 ✅ Send OTP to Mobile Number (for Registration or Login)
exports.sendPhoneOtp = async (req, res, next) => {
  try {
    const { fullname, email, password, purpose = "register" } = req.body;
    const rawPhone = req.body.phoneNumber || req.body.phone;

    if (!rawPhone) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const cleanPhone = smsService.normalizePhoneNumber(rawPhone);
    if (!smsService.isValidIndianPhoneNumber(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    let registrationData = null;

    if (purpose === "register") {
      // Validate mandatory fields for registration
      if (!fullname || !fullname.trim()) {
        return res.status(400).json({
          success: false,
          message: "Full name is required",
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      // Check if mobile number already exists in Users
      const existingUserByPhone = await User.findOne({
        where: {
          [Op.or]: [
            { phoneNumber: cleanPhone },
            { phoneNumber: Number(cleanPhone) || 0 },
          ],
        },
      });

      if (existingUserByPhone) {
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.unlinkSync(`uploads/${req.file.filename}`);
        }
        return res.status(400).json({
          success: false,
          message: "An account with this mobile number already exists. Please log in.",
        });
      }

      // If email is provided, validate format and uniqueness
      let trimmedEmail = email ? email.trim().toLowerCase() : null;
      if (trimmedEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          return res.status(400).json({
            success: false,
            message: "Please enter a valid email address",
          });
        }

        const existingUserByEmail = await User.findOne({
          where: { email: trimmedEmail },
        });

        if (existingUserByEmail) {
          if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
            fs.unlinkSync(`uploads/${req.file.filename}`);
          }
          return res.status(400).json({
            success: false,
            message: "An account with this email address already exists.",
          });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const avatar = req.file ? req.file.filename : null;

      registrationData = JSON.stringify({
        fullname: fullname.trim(),
        email: trimmedEmail,
        password: hashedPassword,
        avatar,
        role: "user",
      });
    } else if (purpose === "login" || purpose === "forgot_password" || purpose === "reset_password") {
      // For login and password reset, verify user exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { phoneNumber: cleanPhone },
            { phoneNumber: Number(cleanPhone) || 0 },
          ],
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "No account found with this mobile number. Please check the number or register.",
        });
      }
    }

    // Generate 6-digit OTP
    const otp = smsService.generateOtp(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes (matching FLAZO DLT template)

    // Invalidate prior unverified OTPs for this phone number
    await OtpVerification.destroy({
      where: {
        phoneNumber: cleanPhone,
        isVerified: false,
      },
    });

    // Save pending OTP record
    await OtpVerification.create({
      phoneNumber: cleanPhone,
      otp,
      otpExpiresAt: expiresAt,
      registrationData,
      purpose,
      isVerified: false,
      attempts: 0,
    });

    // Dispatch SMS via configured gateway or dev mock
    const smsResult = await smsService.sendOtpSms(cleanPhone, otp, purpose);

    if (smsResult && !smsResult.success) {
      const isCreditIssue = smsResult.error && smsResult.error.toLowerCase().includes("credit");
      const clientMessage = isCreditIssue
        ? "Unable to send SMS: SMS gateway balance is exhausted. Please check your SMS panel credits."
        : `Unable to send verification SMS: ${smsResult.error || "Please try again later"}`;

      return res.status(400).json({
        success: false,
        message: clientMessage,
        phoneNumber: cleanPhone,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Verification code sent to +91 ${cleanPhone}`,
      phoneNumber: cleanPhone,
      purpose,
    });
  } catch (err) {
    console.error("sendPhoneOtp Error:", err);
    next(new ErrorHandler(err.message, 500));
  }
};

// 📱 ✅ Verify Phone OTP & Complete Registration / Login
exports.verifyPhoneOtp = async (req, res, next) => {
  try {
    const rawPhone = req.body.phoneNumber || req.body.phone;
    const { otp } = req.body;

    if (!rawPhone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP code are required",
      });
    }

    const cleanPhone = smsService.normalizePhoneNumber(rawPhone);
    const enteredOtp = String(otp).trim();

    // Look for latest unverified OTP record
    const otpRecord = await OtpVerification.findOne({
      where: {
        phoneNumber: cleanPhone,
        isVerified: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No active verification code found. Please request a new OTP.",
      });
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.otpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new OTP.",
      });
    }

    // Check brute-force attempts
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Validate OTP using helper
    const isValid = smsService.isOtpValid(enteredOtp, otpRecord.otp);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please check and try again.",
      });
    }

    // Mark OTP verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    let user = null;

    // Handle Registration verification
    if (otpRecord.purpose === "register" && otpRecord.registrationData) {
      const reg = JSON.parse(otpRecord.registrationData);

      // Check if user already got created
      user = await User.findOne({
        where: {
          [Op.or]: [
            { phoneNumber: cleanPhone },
            { phoneNumber: Number(cleanPhone) || 0 },
          ],
        },
      });

      if (!user) {
        user = await User.create({
          fullname: reg.fullname,
          email: reg.email || null,
          password: reg.password,
          phoneNumber: cleanPhone,
          avatar: reg.avatar || null,
          role: reg.role || "user",
        });

        // Optionally send welcome email if email was provided
        if (reg.email) {
          try {
            await sendmail(
              "email_verify.hbs",
              {
                fullname: reg.fullname,
                activationUrl: `${process.env.CLIENT_URL || "http://localhost:3000"}`,
              },
              reg.email,
              "Welcome to Flazo - Account Created"
            );
          } catch (mailErr) {
            console.log("Welcome email notification skipped:", mailErr.message);
          }
        }
      }
    } else if (otpRecord.purpose === "forgot_password" || req.body.purpose === "forgot_password") {
      user = await User.findOne({
        where: {
          [Op.or]: [
            { phoneNumber: cleanPhone },
            { phoneNumber: Number(cleanPhone) || 0 },
          ],
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User account not found.",
        });
      }

      // Generate secure reset token for password update
      const crypto = require("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully. Please set your new password.",
        resetToken,
        phoneNumber: cleanPhone,
        purpose: "forgot_password",
      });
    } else {
      // Handle Login OTP verification
      user = await User.findOne({
        where: {
          [Op.or]: [
            { phoneNumber: cleanPhone },
            { phoneNumber: Number(cleanPhone) || 0 },
          ],
        },
        include: [{ model: Address, as: "addresses" }],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User account not found.",
        });
      }
    }

    // Send JWT token and cookie
    const { password: pass, ...safeUser } = user.toJSON();
    return sendToken(safeUser, 200, res);
  } catch (err) {
    console.error("verifyPhoneOtp Error:", err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "An account with this email or mobile number already exists.",
      });
    }
    next(new ErrorHandler(err.message, 500));
  }
};

// 📱 ✅ Resend Phone OTP
exports.resendPhoneOtp = async (req, res, next) => {
  try {
    const rawPhone = req.body.phoneNumber || req.body.phone;
    if (!rawPhone) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required to resend OTP",
      });
    }

    const cleanPhone = smsService.normalizePhoneNumber(rawPhone);
    if (!smsService.isValidIndianPhoneNumber(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    // Look for previous pending record
    const otpRecord = await OtpVerification.findOne({
      where: {
        phoneNumber: cleanPhone,
        isVerified: false,
      },
      order: [["createdAt", "DESC"]],
    });

    const newOtp = smsService.generateOtp(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes (matching FLAZO DLT template)

    if (otpRecord) {
      otpRecord.otp = newOtp;
      otpRecord.otpExpiresAt = expiresAt;
      otpRecord.attempts = 0;
      await otpRecord.save();
    } else {
      await OtpVerification.create({
        phoneNumber: cleanPhone,
        otp: newOtp,
        otpExpiresAt: expiresAt,
        purpose: "login",
        isVerified: false,
        attempts: 0,
      });
    }

    const smsResult = await smsService.sendOtpSms(cleanPhone, newOtp, otpRecord ? otpRecord.purpose : "login");

    if (smsResult && !smsResult.success) {
      const isCreditIssue = smsResult.error && smsResult.error.toLowerCase().includes("credit");
      const clientMessage = isCreditIssue
        ? "Unable to send SMS: SMS gateway balance is exhausted. Please check your SMS panel credits."
        : `Unable to send verification SMS: ${smsResult.error || "Please try again later"}`;

      return res.status(400).json({
        success: false,
        message: clientMessage,
        phoneNumber: cleanPhone,
      });
    }

    return res.status(200).json({
      success: true,
      message: `New verification code sent to +91 ${cleanPhone}`,
      phoneNumber: cleanPhone,
    });
  } catch (err) {
    console.error("resendPhoneOtp Error:", err);
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

// 📱 ✅ Verify Forgot Password OTP & Issue Reset Token
exports.verifyResetOtp = async (req, res, next) => {
  try {
    const rawPhone = req.body.phoneNumber || req.body.phone;
    const { otp } = req.body;

    if (!rawPhone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP code are required",
      });
    }

    const cleanPhone = smsService.normalizePhoneNumber(rawPhone);
    const enteredOtp = String(otp).trim();

    // Look for latest unverified OTP record
    const otpRecord = await OtpVerification.findOne({
      where: {
        phoneNumber: cleanPhone,
        isVerified: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No active verification code found. Please request a new OTP.",
      });
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.otpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new OTP.",
      });
    }

    // Check brute-force attempts
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Validate OTP using helper
    const isValid = smsService.isOtpValid(enteredOtp, otpRecord.otp);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please check and try again.",
      });
    }

    // Find user
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { phoneNumber: cleanPhone },
          { phoneNumber: Number(cleanPhone) || 0 },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this mobile number.",
      });
    }

    // Mark OTP verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    // Generate secure reset token
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now set your new password.",
      resetToken,
      phoneNumber: cleanPhone,
    });
  } catch (err) {
    console.error("verifyResetOtp Error:", err);
    next(new ErrorHandler(err.message, 500));
  }
};

// 📱 ✅ Reset Password with Verified Phone & Reset Token
exports.resetPasswordWithPhone = async (req, res, next) => {
  try {
    const rawPhone = req.body.phoneNumber || req.body.phone;
    const { resetToken, password, confirmPassword } = req.body;

    if (!rawPhone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Phone number, New password, and Confirm password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const cleanPhone = smsService.normalizePhoneNumber(rawPhone);

    let user = null;
    if (resetToken) {
      const crypto = require("crypto");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user = await User.findOne({
        where: {
          [Op.or]: [
            { phoneNumber: cleanPhone },
            { phoneNumber: Number(cleanPhone) || 0 },
          ],
          resetPasswordToken: hashedToken,
          resetPasswordExpire: {
            [Op.gt]: new Date(),
          },
        },
      });
    }

    if (!user) {
      // Fallback: check if OTP was verified within last 15 minutes for this phone
      const recentOtp = await OtpVerification.findOne({
        where: {
          phoneNumber: cleanPhone,
          isVerified: true,
          updatedAt: {
            [Op.gt]: new Date(Date.now() - 15 * 60 * 1000),
          },
        },
        order: [["updatedAt", "DESC"]],
      });

      if (recentOtp) {
        user = await User.findOne({
          where: {
            [Op.or]: [
              { phoneNumber: cleanPhone },
              { phoneNumber: Number(cleanPhone) || 0 },
            ],
          },
        });
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset session has expired or is invalid. Please request a new OTP.",
      });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    // Clean up OTP verifications for this phone
    await OtpVerification.destroy({
      where: { phoneNumber: cleanPhone },
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully! You can now login with your new password.",
    });
  } catch (err) {
    console.error("resetPasswordWithPhone Error:", err);
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
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("token", cookieOptions);

    res.clearCookie("accessToken", { ...cookieOptions, sameSite: "Strict" });
    res.clearCookie("refreshToken", { ...cookieOptions, sameSite: "Strict" });
    res.clearCookie("token", { ...cookieOptions, sameSite: "Strict" });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("token");

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(200).json({ success: true, message: "Logged out successfully" });
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
