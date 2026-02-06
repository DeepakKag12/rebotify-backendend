import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// Initialize Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// ============================================
// ACTIVE: Checkout Session Functions (In Use)
// ============================================

/**
 * Create a Stripe Checkout Session for redirect-based payment
 * @param {Number} amount - Amount in rupees (will be converted to paise)
 * @param {String} productName - Product name for line item
 * @param {Object} metadata - Additional metadata
 * @param {String} successUrl - Success redirect URL
 * @param {String} cancelUrl - Cancel redirect URL
 * @returns {Promise<Object>} Stripe Checkout Session object
 */
export const createCheckoutSession = async (amount, productName, metadata = {}, successUrl, cancelUrl) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: productName,
            },
            unit_amount: Math.round(amount * 100), // Convert rupees to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata,
    });

    return session;
  } catch (error) {
    console.error("Error creating Stripe Checkout Session:", error);
    throw new Error("Failed to create checkout session");
  }
};

/**
 * Retrieve a Checkout Session
 * @param {String} sessionId - Stripe Checkout Session ID
 * @returns {Promise<Object>} Checkout Session details
 */
export const retrieveCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error("Error retrieving Checkout Session:", error);
    throw new Error("Failed to retrieve checkout session");
  }
};

// ============================================
// UTILITY: Refund & Webhook Functions
// ============================================

/**
 * Create a refund (can be used for payment intents)
 * @param {String} paymentIntentId - Stripe PaymentIntent ID
 * @param {Number} amount - Amount to refund in paise (optional)
 * @returns {Promise<Object>} Refund object
 */
export const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = { payment_intent: paymentIntentId };
    if (amount) refundData.amount = amount;

    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (error) {
    console.error("Error creating refund:", error);
    throw new Error("Failed to create refund");
  }
};

/**
 * Verify webhook signature (for webhook endpoints)
 * @param {String} payload - Request body
 * @param {String} signature - Stripe signature header
 * @returns {Object} Verified event
 */
export const verifyWebhookSignature = (payload, signature) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    throw new Error("Invalid webhook signature");
  }
};

