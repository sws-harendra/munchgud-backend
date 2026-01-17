const { sendmail } = require("../helpers/mailSend");
const hbs = require("hbs");
const path = require("path");
const {
  Product,
  Address,
  Order,
  OrderAddress,
  OrderItem,
  Payment,
  sequelize,
  User,
  ProductVariant,
} = require("../models");
const { Op, Sequelize } = require("sequelize");

const createOrder = async (req, res) => {
  const { userId, addressId, items, paymentMethod, transactionId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items in the order." });
  }

  const paymentProvider = "razorpay";
  const t = await sequelize.transaction();

  try {
    // 1️⃣ Fetch user's address
    const address = await Address.findOne({
      where: { id: addressId },
      transaction: t,
    });
    if (!address) {
      await t.rollback();
      return res.status(400).json({ message: "Address not found" });
    }

    // 2️⃣ Calculate total amount and validate stock
    let totalAmount = 0;
    const productsToUpdate = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
      });

      if (!product || !product.isActive) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: `Product ${item.productId} not available.` });
      }

      let itemPrice = parseFloat(product.discountPrice);
      let availableStock = product.stock;
      let variant = null;

      if (item.variantId) {
        variant = await ProductVariant.findByPk(item.variantId, {
          transaction: t,
        });

        if (!variant || !variant.isActive) {
          await t.rollback();
          return res
            .status(400)
            .json({ message: `Variant ${item.variantId} not available.` });
        }

        if (item.quantity > variant.stock) {
          await t.rollback();
          return res
            .status(400)
            .json({ message: `Not enough stock for variant ${variant.sku}` });
        }

        itemPrice = parseFloat(variant.price); // Use variant price
        availableStock = variant.stock;
      } else {
        if (item.quantity > product.stock) {
          await t.rollback();
          return res
            .status(400)
            .json({ message: `Not enough stock for ${product.name}` });
        }
      }

      totalAmount += item.quantity * itemPrice;
      productsToUpdate.push({
        product,
        variant,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // 3️⃣ Create Order
    const order = await Order.create(
      {
        userId,
        addressId,
        totalAmount,
        paymentMethod,
        status: paymentMethod === "cod" ? "confirmed" : "pending",
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      },
      { transaction: t }
    );

    // 4️⃣ Create OrderAddress snapshot
    const orderAddress = await OrderAddress.create(
      {
        orderId: order.id,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        zipCode: address.zipCode,
        country: address.country,
        addressType: address.addressType,
      },
      { transaction: t }
    );

    // 5️⃣ Create OrderItems & reduce stock
    const orderItems = [];
    for (const item of items) {
      const record = productsToUpdate.find(
        (p) =>
          p.product.id === item.productId &&
          (p.variant?.id === item.variantId || !item.variantId)
      );

      const orderItem = await OrderItem.create(
        {
          orderId: order.id,
          productId: record.product.id,
          variantId: record.variant ? record.variant.id : null,
          variantname: item.variantName || null,
          quantity: item.quantity,
          price: record.price,
          subtotal: record.price * item.quantity,
        },
        { transaction: t }
      );

      orderItems.push(orderItem);

      // Reduce stock
      if (record.variant) {
        await record.variant.update(
          { stock: record.variant.stock - item.quantity },
          { transaction: t }
        );
      } else {
        await record.product.update(
          { stock: record.product.stock - item.quantity },
          { transaction: t }
        );
      }
    }

    // 6️⃣ Optional: Record Payment if online
    let payment = null;
    if (paymentMethod !== "cod") {
      payment = await Payment.create(
        {
          orderId: order.id,
          userId,
          provider: paymentProvider,
          transactionId,
          amount: totalAmount,
          paymentMethod,
          status: "initiated",
        },
        { transaction: t }
      );
    }

    await t.commit();

    // Fetch user info
    const user = await User.findByPk(userId);

    // 7️⃣ Prepare email data
    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

    const emailData = {
      order: order.toJSON(),
      user: user ? user.toJSON() : {},
      orderAddress: orderAddress.toJSON(),
      orderItems: await Promise.all(
        orderItems.map(async (item) => {
          const prod = await Product.findByPk(item.productId);
          return { ...item.toJSON(), Product: prod ? prod.toJSON() : null };
        })
      ),
      payment: payment ? payment.toJSON() : null,
      formatDate,
    };

    // 8️⃣ Send email
    const userEmail = user?.email || req.user?.email;
    try {
      await sendmail(
        "order_invoice.hbs",
        emailData,
        userEmail,
        `Your Order #${order.id} Invoice`
      );
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order.id,
      emailSent: true,
    });
  } catch (err) {
    await t.rollback();
    console.log(err);
    res
      .status(500)
      .json({ message: "Failed to place order", error: err.message });
  }
};

// Get orders of logged-in user
const getMyOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
            },
            {
              model: ProductVariant,
              as: "variant", // Make sure this matches your association alias
            },
          ],
        },
        { model: OrderAddress },
        { model: Payment },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
};


const getDriverOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await Order.findAll({
      where: { driverId:userId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
            },
            {
              model: ProductVariant,
              as: "variant", // Make sure this matches your association alias
            },
          ],
        },
        { model: OrderAddress },
        { model: Payment },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
};



// Get order details by orderId
// controllers/orderController.js

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("Fetching order with ID:", orderId); // Debug log

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
            },
            {
              model: ProductVariant,
              as: "variant", // Make sure this matches your association alias
            },
          ],
        },
        { model: OrderAddress },
        { model: Payment },
      ],
    });

    console.log("Found order:", order); // Debug log

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({
      message: "Failed to fetch order",
      error: err.message,
    });
  }
};
// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      startDate,
      endDate,
      search,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build where clause for filtering
    const whereClause = {};

    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = end;
      }
    }

    // Search filter (by order ID)
    if (search) {
      whereClause.id = {
        [Op.like]: `%${search}%`,
      };
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
            },
            {
              model: ProductVariant,
              as: "variant",
            },
          ],
        },
        { model: OrderAddress },
        { model: Payment },
      ],

      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: offset,
    });

    res.status(200).json({
      orders,
      totalCount: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
};
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await order.destroy();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to delete order", error: err.message });
  }
};
// controllers/orderController.js
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, paymentMethod, totalAmount, driverId } = req.body;

    // Validate input
    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];
    const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];
    const allowedPaymentMethods = ["cod", "card", "paypal", "bank_transfer"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
        allowedStatuses,
      });
    }

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status value",
        allowedPaymentStatuses,
      });
    }

    if (paymentMethod && !allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method value",
        allowedPaymentMethods,
      });
    }

    // Find the order
    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, include: [Product] },
        { model: OrderAddress },
        { model: Payment },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order fields
    const updatedFields = {};
    if (status) updatedFields.status = status;
    if (paymentStatus) updatedFields.paymentStatus = paymentStatus;
    if (paymentMethod) updatedFields.paymentMethod = paymentMethod;
    if (totalAmount) updatedFields.totalAmount = totalAmount;
if (driverId !== undefined) updatedFields.driverId = driverId;

    // Update order
    await order.update(updatedFields);

    // If order is being marked as delivered, update product stock
    if (status === "delivered" && order.status !== "delivered") {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          // Reduce stock by the quantity ordered
          await product.update({
            stock: product.stock - item.quantity,
            sold_out: product.sold_out + item.quantity,
          });
        }
      }
    }

    // Fetch the updated order with all associations
    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: OrderItem, include: [Product] },
        { model: OrderAddress },
        { model: Payment },
      ],
    });

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to update order",
      error: err.message,
    });
  }
};
module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  deleteOrder,
  updateOrder,getDriverOrders
};
