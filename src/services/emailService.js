/**
 * RizerSpace Email Service
 * Uses Nodemailer when EMAIL_HOST is configured in .env
 * Falls back gracefully to console.log in development
 */
const nodemailer = require("nodemailer");

let transporter = null;

const initTransporter = () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log("📧 Email transporter connected via SMTP");
  } else {
    console.log("📧 EMAIL_HOST not set — email service running in console-log mode");
  }

  return transporter;
};

const sendMail = async ({ to, subject, html }) => {
  const t = initTransporter();

  if (!t) {
    // Dev console fallback — always succeeds
    console.log(`\n📧 ═══════════════════════════════════════`);
    console.log(`   TO:      ${to}`);
    console.log(`   SUBJECT: ${subject}`);
    console.log(`   BODY:\n${html.replace(/<[^>]+>/g, "").trim()}`);
    console.log(`═══════════════════════════════════════\n`);
    return;
  }

  await t.sendMail({
    from: `"RizerSpace" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

// ── Templated emails ─────────────────────────────────────────────────────────

const sendVerification = async (email, name, verificationUrl) => {
  await sendMail({
    to: email,
    subject: "Verify Your RizerSpace Account",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0d0916;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
        <div style="background:linear-gradient(135deg,#dc2626,#111827);padding:32px;text-align:center">
          <h1 style="margin:0;font-size:28px;font-weight:900;letter-spacing:-1px">RIZER<span style="opacity:0.8">SPACE</span></h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#dc2626;margin-top:0">Welcome to RizerSpace, ${name}!</h2>
          <p style="color:rgba(255,255,255,0.7);line-height:1.6">You’re moments away from browsing premium anime figures and completing your first order.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${verificationUrl}" style="background:linear-gradient(135deg,#dc2626,#8b0000);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:800;font-size:14px;letter-spacing:1px;display:inline-block">VERIFY EMAIL →</a>
          </div>
          <p style="color:rgba(255,255,255,0.3);font-size:12px">This link expires in 24 hours. If you didn't create a RizerSpace account, you can ignore this email.</p>
        </div>
      </div>
    `
  });
};

const sendPasswordReset = async (email, name, resetUrl) => {
  await sendMail({
    to: email,
    subject: "🔐 Reset Your RizerSpace Password",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0d0916;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
        <div style="background:linear-gradient(135deg,#b833ff,#1e90ff);padding:32px;text-align:center">
          <h1 style="margin:0;font-size:28px;font-weight:900;letter-spacing:-1px">RIZERSPACE</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#b833ff;margin-top:0">Password Reset Request</h2>
          <p style="color:rgba(255,255,255,0.7)">Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}" style="background:linear-gradient(135deg,#b833ff,#1e90ff);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:800;font-size:14px;letter-spacing:1px;display:inline-block">RESET MY PASSWORD →</a>
          </div>
          <p style="color:rgba(255,255,255,0.3);font-size:12px">This link expires in 10 minutes. If you didn't request a password reset, please secure your account immediately.</p>
        </div>
      </div>
    `
  });
};

const sendOrderConfirmation = async (email, name, orderId, items, total, paymentStatus) => {
  const itemRows = items.map(i =>
    `<tr><td style="padding:8px;color:rgba(255,255,255,0.8)">${i.name}</td><td style="padding:8px;text-align:right;color:#dc2626">${i.price.toFixed(2)}</td></tr>`
  ).join("");

  await sendMail({
    to: email,
    subject: `✅ Order Confirmed — RizerSpace #${orderId}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0d0916;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
        <div style="background:linear-gradient(135deg,#dc2626,#111827);padding:32px;text-align:center">
          <h1 style="margin:0;font-size:28px;font-weight:900">RIZERSPACE</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#dc2626;margin-top:0">Order Confirmed, ${name}!</h2>
          <p style="color:rgba(255,255,255,0.6);font-size:13px">Order ID: <strong style="color:#f97316">#${orderId}</strong></p>
          <p style="color:rgba(255,255,255,0.65);font-size:13px">Payment status: <strong>${paymentStatus}</strong></p>
          <table width="100%" style="border-collapse:collapse;margin:16px 0;background:rgba(255,255,255,0.03);border-radius:8px">${itemRows}
            <tr style="border-top:1px solid rgba(255,255,255,0.08)">
              <td style="padding:12px;font-weight:800">Total</td>
              <td style="padding:12px;text-align:right;color:#dc2626;font-weight:800;font-size:18px">${total.toFixed(2)}</td>
            </tr>
          </table>
          <p style="color:rgba(255,255,255,0.4);font-size:12px">Your order is being processed. We will notify you when your items have shipped.</p>
        </div>
      </div>
    `
  });
};

const sendOrderStatusUpdate = async (email, name, orderId, status) => {
  await sendMail({
    to: email,
    subject: `📦 Order Update — RizerSpace #${orderId}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0d0916;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
        <div style="background:linear-gradient(135deg,#dc2626,#111827);padding:32px;text-align:center">
          <h1 style="margin:0;font-size:28px;font-weight:900">RIZERSPACE</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#dc2626;margin-top:0">Order Status Updated</h2>
          <p style="color:rgba(255,255,255,0.7);line-height:1.6">Hi ${name}, your order <strong>#${orderId}</strong> is now <strong>${status}</strong>.</p>
          <p style="color:rgba(255,255,255,0.4);font-size:12px">We’ll keep you updated with shipping and tracking information as soon as it’s available.</p>
        </div>
      </div>
    `
  });
};

module.exports = {
  sendVerification,
  sendPasswordReset,
  sendOrderConfirmation,
  sendOrderStatusUpdate
};
