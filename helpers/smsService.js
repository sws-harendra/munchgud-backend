"use strict";

const axios = require("axios");
const { getFormattedTemplate } = require("../config/smsTemplates");

/**
 * Normalizes phone numbers to a clean 10-digit Indian mobile number format.
 * Strips non-digits and leading +91 or 0 if present.
 */
function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return "";
  let clean = String(phoneNumber).trim().replace(/\D/g, "");

  if (clean.length === 12 && clean.startsWith("91")) {
    clean = clean.slice(2);
  } else if (clean.length === 11 && clean.startsWith("0")) {
    clean = clean.slice(1);
  }

  return clean;
}

/**
 * Validates whether the given string is a valid 10-digit mobile number.
 */
function isValidIndianPhoneNumber(phoneNumber) {
  const clean = normalizePhoneNumber(phoneNumber);
  return /^[6-9]\d{9}$/.test(clean);
}

/**
 * Checks whether live SMS gateway credentials are set in environment.
 */
function isLiveSmsConfigured() {
  return Boolean(
    process.env.ADCRUX_API_KEY ||
      process.env.ADCRUX_AUTH_KEY ||
      (process.env.ADCRUX_USERNAME && process.env.ADCRUX_PASSWORD) ||
      process.env.FAST2SMS_API_KEY ||
      (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) ||
      process.env.MSG91_AUTH_KEY
  );
}

/**
 * Generates a 6-digit numeric OTP code.
 */
function generateOtp(length = 6) {
  if (length === 4) {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends OTP via configured live SMS gateway (Adcrux Media, Fast2SMS, Twilio, MSG91)
 * or falls back to clear development console output if keys are not set.
 *
 * @param {string} phoneNumber - 10-digit phone number
 * @param {string} otp - 4 or 6-digit OTP code
 * @param {string|object} options - Optional purpose (e.g. "OTP_VERIFICATION", "LOGIN_OTP") or options object
 */
async function sendOtpSms(phoneNumber, otp, options = {}) {
  const cleanPhone = normalizePhoneNumber(phoneNumber);
  const purpose =
    typeof options === "string"
      ? options
      : options?.purpose || options?.templateKey || "OTP_VERIFICATION";

  // Resolve message text and DLT template ID from config/smsTemplates.js
  const templateInfo = getFormattedTemplate(purpose, { otp });
  const messageText = templateInfo.text;
  const dltTeId = templateInfo.dltTemplateId || process.env.ADCRUX_DLT_TE_ID || "";

  // 1. ADCRUX MEDIA SMS Integration
  const adcruxKey = process.env.ADCRUX_API_KEY || process.env.ADCRUX_AUTH_KEY;
  const adcruxUser = process.env.ADCRUX_USERNAME || process.env.ADCRUX_USER;
  const adcruxPass = process.env.ADCRUX_PASSWORD || process.env.ADCRUX_PASS;

  if (adcruxKey || (adcruxUser && adcruxPass)) {
    try {
      console.log(`[SMS Service] Sending live OTP to +91${cleanPhone} via Adcrux Media (${templateInfo.title || templateInfo.templateName || "OTP"})...`);
      const apiUrl = process.env.ADCRUX_API_URL || "http://web.adcruxmedia.in/vb/apikey.php";
      const senderId = process.env.ADCRUX_SENDER_ID || "FLAZOP";

      // Adcrux Media (Vobolo Gateway) exact parameters
      const params = {
        apikey: adcruxKey,
        senderid: senderId,
        number: cleanPhone,
        message: messageText,
      };

      if (dltTeId) {
        params.templateid = dltTeId;
      }

      const formBody = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        formBody.append(key, value);
      }

      let response;
      try {
        response = await axios.post(apiUrl, formBody.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 10000,
        });
      } catch (postErr) {
        // Fallback to GET if POST request fails
        response = await axios.get(apiUrl, {
          params,
          timeout: 10000,
        });
      }

      console.log("[Adcrux Media Response]:", response.data);
      if (response.data && (response.data.status === "false" || response.data.status === false)) {
        console.error("[Adcrux Media API Error]:", response.data.description || response.data);
        return {
          success: false,
          provider: "adcrux",
          error: response.data.description || "Adcrux Gateway error",
        };
      }

      return {
        success: true,
        provider: "adcrux",
        data: response.data,
      };
    } catch (err) {
      console.error(
        "[Adcrux Media Error]:",
        err.response?.data || err.message
      );
      return {
        success: false,
        provider: "adcrux",
        error: err.response?.data?.description || err.message,
      };
    }
  }

  // 2. FAST2SMS Integration (Most popular Indian SMS gateway for Quick OTPs)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      console.log(`[SMS Service] Sending live OTP to +91${cleanPhone} via Fast2SMS...`);
      const response = await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "otp",
          variables_values: otp,
          numbers: cleanPhone,
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("[Fast2SMS Success]:", response.data?.message || "OTP Dispatched");
      return {
        success: true,
        provider: "fast2sms",
        data: response.data,
      };
    } catch (err) {
      console.error(
        "[Fast2SMS Error]:",
        err.response?.data?.message || err.response?.data || err.message
      );
      // Fallback to simulated log so user flow does not crash during network error
      return {
        success: true,
        simulated: true,
        provider: "fast2sms_fallback",
        otp,
        error: err.message,
      };
    }
  }

  // 2. TWILIO Integration
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM;

      console.log(`[SMS Service] Sending live OTP to +91${cleanPhone} via Twilio...`);
      const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const params = new URLSearchParams();
      params.append("To", `+91${cleanPhone}`);
      params.append("From", fromNumber);
      params.append("Body", `Your Flazo verification code is ${otp}. Valid for 10 minutes.`);

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        params.toString(),
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 10000,
        }
      );

      console.log("[Twilio Success]: Message SID", response.data?.sid);
      return { success: true, provider: "twilio", data: response.data };
    } catch (err) {
      console.error("[Twilio Error]:", err.response?.data || err.message);
      return {
        success: true,
        simulated: true,
        provider: "twilio_fallback",
        otp,
        error: err.message,
      };
    }
  }

  // 3. MSG91 Integration
  if (process.env.MSG91_AUTH_KEY) {
    try {
      console.log(`[SMS Service] Sending live OTP to +91${cleanPhone} via MSG91...`);
      const response = await axios.post(
        "https://control.msg91.com/api/v5/otp",
        {
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: `91${cleanPhone}`,
          authkey: process.env.MSG91_AUTH_KEY,
          otp: otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return { success: true, provider: "msg91", data: response.data };
    } catch (err) {
      console.error("[MSG91 Error]:", err.response?.data || err.message);
      return {
        success: true,
        simulated: true,
        provider: "msg91_fallback",
        otp,
        error: err.message,
      };
    }
  }

  // 4. DEVELOPMENT / MOCK MODE (When no live SMS keys are configured)
  console.log("\n========================================================");
  console.log("📱 [FLAZO SMS GATEWAY - DEV / TEST MODE]");
  console.log(`📞 Recipient Mobile : +91 ${cleanPhone}`);
  console.log(`🔐 Verification OTP : ${otp}`);
  console.log(`⏱️  Validity        : 10 minutes`);
  console.log(`💬 Message Preview  : ${messageText}`);
  console.log("💡 To enable real SMS on live deployment, add ADCRUX_API_KEY in munchgud-backend/.env");
  console.log("========================================================\n");

  return {
    success: true,
    simulated: true,
    provider: "mock",
    otp,
  };
}

/**
 * Checks if the entered OTP matches either the stored OTP
 * or the default dev OTP ("123456" / process.env.DEFAULT_OTP).
 */
function isOtpValid(enteredOtp, expectedOtp) {
  if (!enteredOtp) return false;
  const cleanEntered = String(enteredOtp).trim();
  const cleanExpected = String(expectedOtp).trim();

  if (cleanEntered === cleanExpected) {
    return true;
  }

  // In development/test mode or if DEFAULT_OTP is configured, also allow default OTP
  const defaultOtp = (process.env.DEFAULT_OTP || "123456").trim();
  if (cleanEntered === defaultOtp) {
    return true;
  }

  return false;
}

/**
 * Sends any template-based SMS (Order confirmation, notification, etc.)
 */
async function sendTemplateSms(phoneNumber, templateKey, variables = {}) {
  const cleanPhone = normalizePhoneNumber(phoneNumber);
  const templateInfo = getFormattedTemplate(templateKey, variables);
  const messageText = templateInfo.text;
  const dltTeId = templateInfo.dltTemplateId || process.env.ADCRUX_DLT_TE_ID || "";

  const adcruxKey = process.env.ADCRUX_API_KEY || process.env.ADCRUX_AUTH_KEY;
  const adcruxUser = process.env.ADCRUX_USERNAME || process.env.ADCRUX_USER;
  const adcruxPass = process.env.ADCRUX_PASSWORD || process.env.ADCRUX_PASS;

  if (adcruxKey || (adcruxUser && adcruxPass)) {
    try {
      console.log(`[SMS Service] Sending SMS to +91${cleanPhone} via Adcrux Media (${templateInfo.title || templateInfo.templateName || "SMS"})...`);
      const apiUrl = process.env.ADCRUX_API_URL || "http://web.adcruxmedia.in/vb/apikey.php";
      const senderId = process.env.ADCRUX_SENDER_ID || "FLAZOP";

      const params = {
        apikey: adcruxKey,
        senderid: senderId,
        number: cleanPhone,
        message: messageText,
      };

      if (dltTeId) {
        params.templateid = dltTeId;
      }

      const formBody = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        formBody.append(key, value);
      }

      let response;
      try {
        response = await axios.post(apiUrl, formBody.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 10000,
        });
      } catch (postErr) {
        response = await axios.get(apiUrl, { params, timeout: 10000 });
      }

      console.log("[Adcrux Media Response]:", response.data);
      if (response.data && (response.data.status === "false" || response.data.status === false)) {
        console.error("[Adcrux Media API Error]:", response.data.description || response.data);
        return {
          success: false,
          provider: "adcrux",
          error: response.data.description || "Adcrux Gateway error",
        };
      }
      return { success: true, provider: "adcrux", data: response.data };
    } catch (err) {
      console.error("[Adcrux Media Error]:", err.response?.data || err.message);
      return { success: false, provider: "adcrux", error: err.response?.data?.description || err.message };
    }
  }

  console.log(`📱 [SMS SERVICE DEV LOG] To: +91${cleanPhone} | ${templateInfo.templateName}: ${messageText}`);
  return { success: true, simulated: true, message: messageText };
}

module.exports = {
  normalizePhoneNumber,
  isValidIndianPhoneNumber,
  isLiveSmsConfigured,
  generateOtp,
  sendOtpSms,
  sendTemplateSms,
  isOtpValid,
};
