// controllers/dashboardController.js
const {
  User,
  Product,
  Order,
  OrderItem,
  Payment,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

exports.getDashboardData = async (req, res) => {
  try {
    const currentDate = new Date();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(currentDate.getDate() - 60);

    // Run queries in parallel
    const [
      totalEarnings,
      totalOrders,
      totalCustomers,
      totalProducts,
      orderStats,
      salesData,
      prevSalesData,
      topProducts,
      topCustomers,
      recentOrders,
    ] = await Promise.all([
      // Total Earnings (sum of successful payments)
      // Payment.sum("amount", { where: { status: "success" } }),
      Order.sum("totalAmount", { where: { paymentStatus: "paid" } }),

      // Total Orders
      Order.count(),

      // Total Customers / Users
      User.count(),

      // Total Products
      Product.count({ where: { isActive: true } }),

      // Order Status Stats
      Order.findAll({
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["status"],
        raw: true,
      }),

      // Sales (last 30 days)
      Order.findOne({
        attributes: [
          [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalSales"],
          [sequelize.fn("AVG", sequelize.col("totalAmount")), "avgSalesPerDay"],
        ],
        where: {
          status: "delivered",
          createdAt: { [Op.between]: [thirtyDaysAgo, currentDate] },
        },
        raw: true,
      }),

      // Sales (previous 30 days for trend calc)
      Order.findOne({
        attributes: [
          [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalSales"],
        ],
        where: {
          status: "delivered",
          createdAt: { [Op.between]: [sixtyDaysAgo, thirtyDaysAgo] },
        },
        raw: true,
      }),

      // Top Products
      OrderItem.findAll({
        attributes: [
          "productId",
          [sequelize.fn("SUM", sequelize.col("quantity")), "totalSales"],
          [
            sequelize.fn("SUM", sequelize.literal("quantity * price")),
            "totalRevenue",
          ],
        ],
        include: [{ model: Product, attributes: ["name"] }],
        group: ["productId", "Product.id"],
        order: [[sequelize.literal("totalRevenue"), "DESC"]],
        limit: 5,
      }),

      // Top Customers
      Order.findAll({
        attributes: [
          "userId",
          [sequelize.fn("COUNT", sequelize.col("Order.id")), "orderCount"],
          [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalSpent"],
        ],
        include: [
          { model: User, attributes: ["fullname"], where: { role: "user" } },
        ],
        where: { status: "delivered" },
        group: ["userId", "User.id"],
        order: [[sequelize.literal("totalSpent"), "DESC"]],
        limit: 5,
      }),

      // Recent Orders
      Order.findAll({
        attributes: ["id", "totalAmount", "status", "createdAt"],
        include: [{ model: User, attributes: ["fullname"] }],
        order: [["createdAt", "DESC"]],
        limit: 10,
      }),
    ]);

    // Format Order Stats
    const formattedOrderStats = {
      total: totalOrders,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      rejected: 0,
    };
    orderStats.forEach((s) => {
      const status = s.status?.toLowerCase();
      if (formattedOrderStats[status] !== undefined) {
        formattedOrderStats[status] = parseInt(s.count);
      }
    });

    // Sales Data
    const formattedSalesData = {
      totalSales: parseFloat(salesData?.totalSales) || 0,
      avgSalesPerDay: parseFloat(salesData?.avgSalesPerDay) || 0,
    };

    // Top Products
    const formattedTopProducts = topProducts.map((p) => ({
      id: p.productId,
      name: p.Product.name,
      sales: parseInt(p.dataValues.totalSales) || 0,
      revenue: parseFloat(p.dataValues.totalRevenue) || 0,
    }));

    // Top Customers
    const formattedTopCustomers = topCustomers.map((c) => ({
      id: c.userId,
      name: c.User.fullname,
      orders: parseInt(c.dataValues.orderCount) || 0,
      spent: parseFloat(c.dataValues.totalSpent) || 0,
    }));

    // Recent Orders
    const formattedRecentOrders = recentOrders.map((o) => ({
      id: `#ORD${o.id.toString().padStart(3, "0")}`,
      customer: o.User.fullname,
      amount: parseFloat(o.totalAmount) || 0,
      status: o.status,
      date: o.createdAt.toISOString().split("T")[0],
    }));

    // Trends calculation (compare this 30d vs last 30d)
    const prevSales = parseFloat(prevSalesData?.totalSales) || 0;
    const currSales = formattedSalesData.totalSales;
    const earningsGrowth =
      prevSales > 0
        ? (((currSales - prevSales) / prevSales) * 100).toFixed(1)
        : "0";

    const trends = {
      earnings: earningsGrowth >= 0 ? "up" : "down",
      earningsValue: `${earningsGrowth}%`,
    };

    // Final Response
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEarnings: parseFloat(totalEarnings) || 0,
          totalOrders,
          totalCustomers,
          totalProducts,
        },
        orderStats: formattedOrderStats,
        salesData: formattedSalesData,
        topProducts: formattedTopProducts,
        topCustomers: formattedTopCustomers,
        recentOrders: formattedRecentOrders,
        trends,
      },
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};
