const { RazorpayCredential } = require("../models");

exports.addCredential = async (req, res) => {
  try {
    const { keyId, keySecret, webhookSecret } = req.body;

    if (!keyId || !keySecret) {
      return res
        .status(400)
        .json({ error: "keyId and keySecret are required" });
    }

    // Deactivate old active credentials
    await RazorpayCredential.update(
      { status: "inactive" },
      { where: { status: "active" } }
    );

    const cred = await RazorpayCredential.create({
      keyId,
      keySecret,
      webhookSecret,
      status: "active",
    });

    res.status(201).json({ success: true, credential: cred });
  } catch (err) {
    console.error("Add Razorpay credential error:", err);
    res.status(500).json({ error: "Failed to add credentials" });
  }
};

// Get active credential

exports.getActiveCredential = async (req, res) => {
  try {
    const cred = await RazorpayCredential.findOne({
      where: { status: "active" },
    });

    if (!cred) {
      if (process.env.RAZORPAY_KEY_ID) {
        return res.json({
          success: true,
          credential: {
            keyId: process.env.RAZORPAY_KEY_ID,
            status: "active",
            source: "environment",
          },
        });
      }
      return res.status(404).json({ error: "No active credentials found" });
    }

    res.json({ success: true, credential: cred });
  } catch (err) {
    console.error("Get Razorpay credential error:", err);
    res.status(500).json({ error: "Failed to fetch credentials" });
  }
};

// Activate a specific credential

exports.activateCredential = async (req, res) => {
  try {
    const { id } = req.params;

    // Deactivate old active
    await RazorpayCredential.update(
      { status: "inactive" },
      { where: { status: "active" } }
    );

    // Activate new one
    const [count] = await RazorpayCredential.update(
      { status: "active" },
      { where: { id } }
    );

    if (count === 0) {
      return res.status(404).json({ error: "Credential not found" });
    }

    res.json({ success: true, message: "Credential activated" });
  } catch (err) {
    console.error("Activate Razorpay credential error:", err);
    res.status(500).json({ error: "Failed to activate credential" });
  }
};

exports.create_order = async (req, res) => {
  const { amount, currency = "INR", receipt } = req.body;
  try {
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount. Amount must be greater than 0",
      });
    }

    // 1. Check DB first, fallback to environment variables (.env)
    const cred = await RazorpayCredential.findOne({
      where: { status: "active" },
    });

    const keyId = cred?.keyId || process.env.RAZORPAY_KEY_ID;
    const keySecret = cred?.keySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(400).json({
        success: false,
        error: "Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env or via Admin dashboard.",
      });
    }

    // Create base64 encoded credentials
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    // Call Razorpay API to create order
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount), // amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          created_at: new Date().toISOString(),
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Razorpay API error:", data);
      return res.status(response.status || 400).json({
        success: false,
        error: data.error?.description || "Razorpay rejected the order creation",
      });
    }

    console.log("Razorpay Order created successfully:", data.id);

    return res.status(200).json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      razorPayKey: keyId,
    });
  } catch (err) {
    console.error("Razorpay create_order error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to create order on payment gateway",
    });
  }
};
