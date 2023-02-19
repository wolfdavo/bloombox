import * as admin from 'firebase-admin';

export const getFirebaseUser = async (phoneNumber: string) => {
  return await admin
    .auth()
    .getUserByPhoneNumber(phoneNumber)
    .catch((error) => {
      console.log('Error getting user:', error);
      return Promise.reject(new Error('error-getting-firebase-user'));
    });
};
