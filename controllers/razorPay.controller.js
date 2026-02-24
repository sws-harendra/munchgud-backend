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
        error: "Invalid amount. Amount must be greater than 0",
      });
    }

    // Get Razorpay credentials from environment
    const cred = await RazorpayCredential.findOne({
      where: { status: "active" },
    });
    console.log("Active credential:", cred);

    if (!cred) {
      return res.status(404).json({ error: "No active credentials found" });
    }
    if (!cred.keyId || !cred.keySecret) {
      return res.status(500).json({
        error: "Razorpay credentials not configured",
      });
    }
    console.log(cred);
    // Create base64 encoded credentials
    const credentials = Buffer.from(`${cred.keyId}:${cred.keySecret}`).toString(
      "base64"
    );

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
    console.log(data);
    if (!response.ok) {
      throw new Error(data.error?.description || "Failed to create order");
    }

    console.log("Order created successfully:", data.id);

    res.status(200).json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      razorPayKey: cred.keyId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json("some error occred");
  }
};
