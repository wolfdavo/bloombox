import Stripe from 'stripe';

const { STRIPE_API_KEY } = process.env;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const stripe = new Stripe(STRIPE_API_KEY!, {
  apiVersion: '2022-11-15',
});

export const getCustomer = async (customerId: string) => {
  return await stripe.customers.retrieve(customerId);
};
