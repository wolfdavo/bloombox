import * as admin from 'firebase-admin';
import { createCustomer } from '../stripe/createCustomer';
const db = admin.database();

export const createNewUser = async (phoneNumber: string) => {
  // Check if the user already exists
  return await admin
    .auth()
    .getUserByPhoneNumber(phoneNumber)
    .then(() => {
      // User already exists
      return Promise.reject(new Error('user-already-exists'));
    })
    .catch(async (error) => {
      if (error.code === 'auth/user-not-found') {
        // User does not exist
        // Create new user
        const user = await admin
          .auth()
          .createUser({ phoneNumber })
          .catch((error) => {
            console.log('Error creating new user:', error);
            return Promise.reject(new Error('error-creating-user'));
          });
        // Create user with stripe
        const stripeCustomerId = await createCustomer({
          phoneNumber,
          uid: user.uid,
        }).catch((error) => {
          console.log('Error creating stripe customer:', error);
          return Promise.reject(new Error('error-creating-stripe-customer'));
        });

        // Create user record in database
        const ref = db.ref(`users/${user.uid}`);
        const userRecord: ClaudioUser = {
          uid: user.uid,
          phoneNumber,
          billingState: 'trial',
          trialMessagesRemaining: 10,
          stripeCustomerId,
        };
        await ref.set(userRecord);
        return Promise.resolve(user);
      }
      return Promise.reject(error);
    });
};
