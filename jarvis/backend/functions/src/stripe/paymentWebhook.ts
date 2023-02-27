import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { sendText } from '../util/sendText';
import { getCustomerId } from './getCustomerId';
import { updateSubscriptionStatus } from './updateSubscriptionStatus';

const {
  STRIPE_API_KEY,
  CLAUDIO_SUBSCRIPTION_PRICE_ID,
  MANAGING_SUBSCRIPTIONS_WEBHOOK_SIGNING_SECRET,
} = process.env;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const stripe = new Stripe(STRIPE_API_KEY!, {
  apiVersion: '2022-11-15',
});

exports.manageSubscription = functions.https.onRequest((req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const endpointSecret = MANAGING_SUBSCRIPTIONS_WEBHOOK_SIGNING_SECRET!;
  const sig = req.headers['stripe-signature'] || '';
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
  let subscription;
  let phNum;

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      subscription = event.data.object as Stripe.Checkout.Session;
      customer = subscription.customer as string;
      updateSubscriptionStatus(customer, 'active');
      break;
    case 'invoice.paid':
      subscription = event.data.object as Stripe.Invoice;
      customer = subscription.customer as string;
      updateSubscriptionStatus(customer, 'active');
      if (subscription.billing_reason === 'subscription_create') {
        phNum = subscription.customer_phone;
        if (phNum) {
          sendText(
            phNum,
            // eslint-disable-next-line quotes
            "Thanks for subscribing to Claudio! 🎉 You now have unlimited access. I'm here to help!"
          );
        }
      }
      break;
    case 'customer.subscription.created':
      subscription = event.data.object as Stripe.Invoice;
      customer = subscription.customer as string;
      updateSubscriptionStatus(customer, 'active');
      break;
    case 'invoice.payment_failed':
      subscription = event.data.object as Stripe.Invoice;
      customer = subscription.customer as string;
      updateSubscriptionStatus(customer, 'inactive'); // restrict access
      break;
    case 'customer.subscription.deleted':
      subscription = event.data.object as Stripe.Subscription;
      customer = subscription.customer as string;
      updateSubscriptionStatus(customer, 'inactive'); // restrict access
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.sendStatus(200);
});

export const createCustomerPortalSession = async (uid: string) => {
  const stripeCustomerId = await getCustomerId(uid);

  // Authenticate your user.
  const session = await stripe.billingPortal.sessions
    .create({
      customer: stripeCustomerId,
      return_url: 'https://meetclaudio.com',
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
  return session;
};

export const createCustomerSubscriptionSession = async (uid: string) => {
  const stripeCustomerId = await getCustomerId(uid);

  // Authenticate your user.
  const session = await stripe.checkout.sessions
    .create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price: CLAUDIO_SUBSCRIPTION_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: 'https://meetclaudio.com',
      cancel_url: 'https://meetclaudio.com',
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
  return session;
};
