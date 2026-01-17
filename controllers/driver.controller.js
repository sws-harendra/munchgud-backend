
const { where } = require("sequelize");
const { User, Address } = require("../models");
const { Op } = require("sequelize");

exports.getAllDrivers = async (req, res, next) => {
  try {
    // ✅ Pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    // ✅ Filters
    const { search } = req.query;
    let role = "driver";
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
      where.role = "driver";
    }

    // ⚡ Filter by status (active/inactive)
    // if (status) {
    //   where.status = status;
    // }

 
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