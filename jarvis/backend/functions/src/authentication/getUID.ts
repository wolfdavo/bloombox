import * as admin from 'firebase-admin';

export const getUID = async (phNum: string) => {
  const user = await admin
    .auth()
    .getUserByPhoneNumber(phNum)
    .catch((error) => {
      console.log('Error getting user by phone number:', error);
      return Promise.reject(new Error('error-getting-user-by-phone-number'));
    });
  return user.uid;
};
