const jwt = require("jsonwebtoken");

const sendToken = async (user, statusCode, res) => {
  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
    refreshToken,
    token: accessToken,
  });
};
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  }); // Short-lived
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  ); // Long-lived
};

module.exports = { sendToken, generateAccessToken, generateRefreshToken };
