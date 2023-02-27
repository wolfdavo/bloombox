import Stripe from 'stripe';

const {
  STRIPE_API_KEY,
  CLAUDIO_SUBSCRIPTION_PRICE_ID,
  MANAGING_SUBSCRIPTIONS_WEBHOOK_SIGNING_SECRET,
} = process.env;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const stripe = new Stripe(STRIPE_API_KEY!, {
  apiVersion: '2022-11-15',
});

export const createCustomer = async ({
  phoneNumber,
  uid,
}: {
  phoneNumber: string | undefined;
  uid: string;
}) => {
  // Create new stripe customer and record the customer id in the database
  const { id } = await stripe.customers.create({
    phone: phoneNumber,
    metadata: {
      firebaseId: uid,
    },
  });
  return id;
};
