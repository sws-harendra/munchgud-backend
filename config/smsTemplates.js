"use strict";

/**
 * ==============================================================================
 * FLAZO (ADCRUX MEDIA) DLT APPROVED SMS TEMPLATES
 * ==============================================================================
 * User: Flazoindia
 * Brand: FLAZO / Team FLAZO
 * 
 * Variable Placeholders (DLT Standard):
 *   {#num#} -> Numeric digits (e.g. OTP code, Amount, Numeric tracking ID)
 *   {#alp#} -> Alphanumeric string (e.g. Order ID, Expected delivery date)
 */

const SMS_TEMPLATES = {
  // ----------------------------------------------------------------------------
  // 1. OTP FOR MOBILE NUMBER VERIFICATION
  // ----------------------------------------------------------------------------
  // DLT Approved Title: Dear User, your FLAZO OTP for mobile number verification
  OTP_VERIFICATION: {
    title: "OTP for mobile number verification",
    dltTemplateId: "1777179119341548052",
    template:
      "Dear User, your FLAZO OTP for mobile number verification is {#num#}. This OTP is valid for 5 minutes. Please do not share it with anyone. Team FLAZO",
    format(params = {}) {
      const otp = String(params.otp || params.code || "").trim();
      return this.template
        .replace(/{#num#}/gi, otp)
        .replace(/{#var#}/gi, otp)
        .replace(/{otp}/gi, otp);
    },
  },

  // ----------------------------------------------------------------------------
  // 2. ORDER PLACED NOTIFICATION
  // ----------------------------------------------------------------------------
  // DLT Approved Title: Thank you for shopping with FLAZO Your order
  ORDER_PLACED: {
    title: "Thank you for shopping with FLAZO",
    dltTemplateId: "1777179118738513385",
    template:
      "Thank you for shopping with FLAZO Your order {#alp#} has been placed successfully. Order Amount: Rs. {#num#} Expected Delivery: {#alp#} Track your order: {#num#} Team FLAZO",
    format(params = {}) {
      const orderId = String(params.orderId || params.orderNumber || "FLZ1001").trim();
      const amount = String(params.amount || params.totalAmount || "0").trim();
      const expectedDelivery = String(params.expectedDelivery || "3-5 business days").trim();
      
      // Tracking must be digits for {#num#}
      const rawTrack = params.trackingNumber || params.trackId || orderId;
      const cleanTrack = String(rawTrack).replace(/\D/g, "") || "101";

      let text = this.template;
      // 1. {#alp#} -> Order ID
      text = text.replace("{#alp#}", orderId);
      // 2. {#num#} -> Order Amount
      text = text.replace("{#num#}", amount);
      // 3. {#alp#} -> Expected Delivery
      text = text.replace("{#alp#}", expectedDelivery);
      // 4. {#num#} -> Track order
      text = text.replace("{#num#}", cleanTrack);

      return text;
    },
  },

  // ----------------------------------------------------------------------------
  // 3. PAYMENT SUCCESSFUL NOTIFICATION
  // ----------------------------------------------------------------------------
  // DLT Approved Title: Payment Successful Dear Customer
  PAYMENT_SUCCESS: {
    title: "Payment Successful",
    dltTemplateId: "1777179118557257930",
    template:
      "Payment Successful Dear Customer, we have received your payment of Rs. {#num#} for FLAZO Order {#alp#}. Your order is being processed. Thank you for choosing FLAZO",
    format(params = {}) {
      const amount = String(params.amount || params.paidAmount || "0").trim();
      const orderId = String(params.orderId || params.orderNumber || "FLZ1001").trim();

      let text = this.template;
      // 1. {#num#} -> Payment Amount
      text = text.replace("{#num#}", amount);
      // 2. {#alp#} -> Order ID
      text = text.replace("{#alp#}", orderId);

      return text;
    },
  },
};

/**
 * Resolves and formats a template with dynamic variables.
 *
 * @param {string} templateKey - e.g. "OTP_VERIFICATION", "ORDER_PLACED", "PAYMENT_SUCCESS", or purpose ("login", "checkout")
 * @param {object} variables - e.g. { otp: "423325" } or { orderId: "FLZ892", amount: "1499" }
 * @returns {{ text: string, dltTemplateId: string, title: string }}
 */
function getFormattedTemplate(templateKey = "OTP_VERIFICATION", variables = {}) {
  const key = String(templateKey || "OTP_VERIFICATION").toUpperCase().trim();
  let selected = SMS_TEMPLATES[key];

  // Context-aware automatic mapping
  if (!selected) {
    if (key.includes("PAY") || key.includes("PAID") || key.includes("SUCCESS")) {
      selected = SMS_TEMPLATES.PAYMENT_SUCCESS;
    } else if (key.includes("ORDER") || key.includes("CHECKOUT") || key.includes("CART")) {
      selected = SMS_TEMPLATES.ORDER_PLACED;
    } else {
      // Default to OTP Verification (Login, Register, Phone Verification, etc.)
      selected = SMS_TEMPLATES.OTP_VERIFICATION;
    }
  }

  const text = typeof selected.format === "function"
    ? selected.format(variables)
    : selected.template;

  const dltTemplateId =
    selected.dltTemplateId ||
    process.env.ADCRUX_DLT_TE_ID ||
    "";

  return {
    text,
    dltTemplateId,
    title: selected.title,
  };
}

module.exports = {
  SMS_TEMPLATES,
  getFormattedTemplate,
};
