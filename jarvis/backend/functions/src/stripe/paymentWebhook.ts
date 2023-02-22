import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { getStripeCustomerId, updateSubscriptionStatus } from './firebase';
import { config } from './index';

const {
  api_key,
  claudio_subscription_price_id,
  managing_subscriptions_webhook_signing_secret,
} = config.stripe;

const stripe = new Stripe(api_key, {
  apiVersion: '2022-11-15',
});

export const getStripeCustomer = async (customerId: string) => {
  return await stripe.customers.retrieve(customerId);
};

export const createStripeCustomer = async ({
  email,
  displayName,
  phoneNumber,
  uid,
}: {
  email: string | undefined;
  displayName: string | undefined;
  phoneNumber: string | undefined;
  uid: string;
}) => {
  // Create new stripe customer and record the customer id in the database
  const { id } = await stripe.customers.create({
    email: email,
    name: displayName,
    phone: phoneNumber,
    metadata: {
      firebaseId: uid,
    },
  });
  return id;
};

const priceId = claudio_subscription_price_id;

exports.createNewSubscription = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) return;

    const uid = context.auth.uid;
    const stripeCustomerId = await getStripeCustomerId(uid);

    const session = await stripe.checkout.sessions
      .create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        cancel_url: 'https://meetclaudio.com/',
        success_url: 'https://meetclaudio.com/dashboard',
        customer: stripeCustomerId,
      })
      .catch((err) => {
        console.log(err);
      });
    return session;
  }
);

exports.manageSubscription = functions.https.onRequest((req, res) => {
  const endpointSecret = managing_subscriptions_webhook_signing_secret;
  const sig = req.headers['stripe-signature'] ?? '';
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody.toString(),
      sig,
      endpointSecret
    );
  } catch (err) {
    console.log('Managing Subscription Webhook Error');
    res.sendStatus(400);
    return;
  }

  let customer: string;

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      customer = session.customer as string;
      updateSubscriptionStatus(customer, 'active');
      break;
    case 'invoice.paid':
      const invoicePaid = event.data.object as Stripe.Invoice;
      customer = invoicePaid.customer as string;
      updateSubscriptionStatus(customer, 'active');
      break;
    case 'invoice.payment_failed':
      const invoicePaymentFailed = event.data.object as Stripe.Invoice;
      customer = invoicePaymentFailed.customer as string;
      updateSubscriptionStatus(customer, 'inactive'); // restrict access
      break;
    case 'customer.subscription.deleted':
      const customerSubscriptionDeleted = event.data
        .object as Stripe.Subscription;
      customer = customerSubscriptionDeleted.customer as string;
      updateSubscriptionStatus(customer, 'inactive'); // restrict access
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.sendStatus(200);
});

exports.createCustomerPortalSession = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) return;

    const uid = context.auth.uid;
    const stripeCustomerId = await getStripeCustomerId(uid);

    // Authenticate your user.
    const session = await stripe.billingPortal.sessions
      .create({
        customer: stripeCustomerId,
        return_url: 'http://meetclaudio.com/dashboard',
      })
      .catch((err) => {
        console.log(err);
      });
    return session;
  }
);
