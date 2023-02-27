import * as admin from 'firebase-admin';
import { getCustomer } from './getCustomer';

type SubscriptionStatus = 'active' | 'inactive';

export const updateSubscriptionStatus = async (
  customerId: string,
  status: SubscriptionStatus
) => {
  const customer = await getCustomer(customerId);
  if (customer.deleted) {
    return;
  }
  const uid = customer.metadata['firebaseId'];
  // Update user in database
  await admin.database().ref(`users/${uid}`).update({ billingState: status });
};
