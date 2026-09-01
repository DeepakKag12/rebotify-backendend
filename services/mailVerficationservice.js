//mail verification service
//we will use nodemailer to send verification emails to users
//we will send them otp to verify their email address
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to, otp) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Login OTP Verification - Rebot",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #22c55e;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .otp-box {
              background-color: #f3f4f6;
              border: 2px dashed #22c55e;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
              border-radius: 8px;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #22c55e;
              letter-spacing: 8px;
            }
            .warning {
              color: #dc2626;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Login Verification</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>You have requested to login to your Rebot account. Please use the following OTP to complete your login:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p><strong>This OTP is valid for 2 minutes only.</strong></p>
              
              <p>If you didn't request this OTP, please ignore this email and ensure your account is secure.</p>
              
              <div class="warning">
                ⚠️ Never share this OTP with anyone. Rebot staff will never ask for your OTP.
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Rebot. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your OTP for login verification is: ${otp}. It is valid for 2 minutes only. Never share this OTP with anyone.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Login OTP sent to ${to}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${to}:`, error);
    throw new Error("Could not send OTP email");
  }
};

export const sendCertificateApprovalEmail = async (
  to,
  userName,
  certificateType,
  certificateNumber
) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Certificate Approved - Rebot",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #22c55e;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .certificate-box {
              background-color: #f0fdf4;
              border-left: 4px solid #22c55e;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .certificate-details {
              margin: 10px 0;
            }
            .certificate-details strong {
              color: #15803d;
            }
            .success-icon {
              font-size: 48px;
              text-align: center;
              margin: 20px 0;
            }
            .cta-button {
              display: inline-block;
              background-color: #22c55e;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Certificate Approved</h1>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              <h2>Congratulations, ${userName}!</h2>
              <p>Your certificate has been <strong style="color: #22c55e;">approved</strong> by our admin team.</p>
              
              <div class="certificate-box">
                <div class="certificate-details">
                  <strong>Document Type:</strong> ${certificateType}
                </div>
                <div class="certificate-details">
                  <strong>Certificate Number:</strong> ${certificateNumber}
                </div>
                <div class="certificate-details">
                  <strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">APPROVED ✓</span>
                </div>
              </div>
              
              <p>You can now place bids on listings and participate fully in the Rebot recycling marketplace.</p>
              
              <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:5173"
                }/recycler/certificates" class="cta-button">
                  View My Certificates
                </a>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Rebot. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Congratulations ${userName}! Your certificate (${certificateType} - ${certificateNumber}) has been approved. You can now place bids on listings.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Certificate approval email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending certificate approval email to ${to}:`, error);
    throw new Error("Could not send certificate approval email");
  }
};

export const sendCertificateDisapprovalEmail = async (
  to,
  userName,
  certificateType,
  certificateNumber
) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Certificate Disapproved - Rebot",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #dc2626;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .certificate-box {
              background-color: #fef2f2;
              border-left: 4px solid #dc2626;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .certificate-details {
              margin: 10px 0;
            }
            .certificate-details strong {
              color: #991b1b;
            }
            .info-icon {
              font-size: 48px;
              text-align: center;
              margin: 20px 0;
            }
            .next-steps {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .cta-button {
              display: inline-block;
              background-color: #22c55e;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Certificate Disapproved</h1>
            </div>
            <div class="content">
              <div class="info-icon">📋</div>
              <h2>Hello ${userName},</h2>
              <p>We regret to inform you that your certificate has been <strong style="color: #dc2626;">disapproved</strong> by our admin team.</p>
              
              <div class="certificate-box">
                <div class="certificate-details">
                  <strong>Document Type:</strong> ${certificateType}
                </div>
                <div class="certificate-details">
                  <strong>Certificate Number:</strong> ${certificateNumber}
                </div>
                <div class="certificate-details">
                  <strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">DISAPPROVED ✗</span>
                </div>
              </div>
              
              <div class="next-steps">
                <h3 style="margin-top: 0; color: #92400e;">📌 Next Steps</h3>
                <ul style="margin: 10px 0;">
                  <li>Review your certificate details and ensure all information is accurate</li>
                  <li>Verify that the document is clear and legible</li>
                  <li>Check that the certificate is issued by a recognized authority</li>
                  <li>Ensure the validity period is current</li>
                  <li>Upload a new certificate with correct information</li>
                </ul>
              </div>
              
              <p>You can upload a new certificate or update the existing one with the correct information.</p>
              
              <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:5173"
                }/recycler/certificates" class="cta-button">
                  Upload New Certificate
                </a>
              </div>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                If you believe this is a mistake or need assistance, please contact our support team.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Rebot. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hello ${userName}, Your certificate (${certificateType} - ${certificateNumber}) has been disapproved. Please review and upload a new certificate with correct information.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Certificate disapproval email sent to ${to}`);
  } catch (error) {
    console.error(
      `Error sending certificate disapproval email to ${to}:`,
      error
    );
    throw new Error("Could not send certificate disapproval email");
  }
};

export const sendInvoiceEmail = async (email, invoiceData) => {
  const { invoiceNumber, listing, transaction, buyerName } = invoiceData;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `✅ Payment Confirmed - Invoice #${invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #22c55e;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .invoice-box {
              background-color: #f0fdf4;
              border-left: 4px solid #22c55e;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .invoice-details {
              margin: 10px 0;
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .invoice-details:last-child {
              border-bottom: none;
            }
            .invoice-details strong {
              color: #15803d;
            }
            .success-icon {
              font-size: 48px;
              text-align: center;
              margin: 20px 0;
            }
            .total-amount {
              background-color: #dcfce7;
              padding: 15px;
              text-align: center;
              margin: 20px 0;
              border-radius: 6px;
              font-size: 24px;
              font-weight: bold;
              color: #15803d;
            }
            .info-box {
              background-color: #dbeafe;
              border-left: 4px solid #3b82f6;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Payment Successful!</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2>Thank you, ${buyerName}!</h2>
              <p>Your payment has been confirmed and your invoice has been generated.</p>
              
              <div class="total-amount">
                ₹${transaction.amount.toFixed(2)}
              </div>
              
              <div class="invoice-box">
                <h3 style="margin-top: 0; color: #15803d;">📄 Invoice Details</h3>
                <div class="invoice-details">
                  <span><strong>Invoice Number:</strong></span>
                  <span>${invoiceNumber}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Product:</strong></span>
                  <span>${listing.product_category} - ${listing.brand} ${listing.model}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Condition:</strong></span>
                  <span>${listing.condition}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Amount Paid:</strong></span>
                  <span style="color: #22c55e; font-weight: bold;">₹${transaction.amount.toFixed(2)}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Payment Method:</strong></span>
                  <span>${transaction.paymentMethod ? transaction.paymentMethod.toUpperCase() : 'N/A'}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Receipt Number:</strong></span>
                  <span>${transaction.receiptNumber}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Date:</strong></span>
                  <span>${new Date().toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
              
              <div class="info-box">
                <p style="margin: 0; color: #1e40af;">
                  <strong>📦 Next Steps:</strong><br>
                  Your order will be assigned to a delivery partner soon. You can track your delivery status in your dashboard.
                </p>
              </div>
              
              <p style="margin-top: 20px;">
                If you have any questions or concerns, please don't hesitate to contact our support team.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Rebot. All rights reserved.</p>
              <p>Thank you for choosing Rebot! ♻️</p>
              <p style="margin-top: 10px;">
                For support: support@rebot.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Payment Successful! Invoice #${invoiceNumber}. Amount: ₹${transaction.amount}. Product: ${listing.product_category} - ${listing.brand} ${listing.model}. Your order will be processed soon.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Invoice email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending invoice email to ${email}:`, error);
    throw new Error("Could not send invoice email");
  }
};

// Send invoice to seller (user who listed the item)
export const sendSellerInvoiceEmail = async (email, invoiceData) => {
  const { invoiceNumber, listing, transaction, sellerName, buyerName } = invoiceData;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `✅ Item Sold - Invoice #${invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #22c55e;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .invoice-box {
              background-color: #f0fdf4;
              border-left: 4px solid #22c55e;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .invoice-details {
              margin: 10px 0;
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .invoice-details:last-child {
              border-bottom: none;
            }
            .invoice-details strong {
              color: #15803d;
            }
            .success-icon {
              font-size: 48px;
              text-align: center;
              margin: 20px 0;
            }
            .total-amount {
              background-color: #dcfce7;
              padding: 15px;
              text-align: center;
              margin: 20px 0;
              border-radius: 6px;
              font-size: 24px;
              font-weight: bold;
              color: #15803d;
            }
            .info-box {
              background-color: #dbeafe;
              border-left: 4px solid #3b82f6;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Item Sold Successfully!</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2>Congratulations, ${sellerName}!</h2>
              <p>Your item has been sold and payment has been received.</p>
              
              <div class="total-amount">
                ₹${transaction.amount.toFixed(2)}
              </div>
              
              <div class="invoice-box">
                <h3 style="margin-top: 0; color: #15803d;">📄 Sale Invoice Details</h3>
                <div class="invoice-details">
                  <span><strong>Invoice Number:</strong></span>
                  <span>${invoiceNumber}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Product:</strong></span>
                  <span>${listing.product_category} - ${listing.brand} ${listing.model}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Condition:</strong></span>
                  <span>${listing.condition}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Sale Amount:</strong></span>
                  <span style="color: #22c55e; font-weight: bold;">₹${transaction.amount.toFixed(2)}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Buyer:</strong></span>
                  <span>${buyerName}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Payment Method:</strong></span>
                  <span>${transaction.paymentMethod ? transaction.paymentMethod.toUpperCase() : 'N/A'}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Receipt Number:</strong></span>
                  <span>${transaction.receiptNumber}</span>
                </div>
                <div class="invoice-details">
                  <span><strong>Date:</strong></span>
                  <span>${new Date().toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
              
              <div class="info-box">
                <p style="margin: 0; color: #1e40af;">
                  <strong>📦 Next Steps:</strong><br>
                  A delivery partner will be assigned to pick up the item. Please ensure the item is ready for pickup. You can track the delivery status in your dashboard.
                </p>
              </div>
              
              <p style="margin-top: 20px;">
                The payment will be processed to your account according to our payment terms. If you have any questions, please contact our support team.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Rebot. All rights reserved.</p>
              <p>Thank you for using Rebot! ♻️</p>
              <p style="margin-top: 10px;">
                For support: support@rebot.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Item Sold! Invoice #${invoiceNumber}. Amount: ₹${transaction.amount}. Product: ${listing.product_category} - ${listing.brand} ${listing.model}. Buyer: ${buyerName}. A delivery partner will be assigned soon.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Seller invoice email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending seller invoice email to ${email}:`, error);
    throw new Error("Could not send seller invoice email");
  }
};
