import * as admin from 'firebase-admin';
import { getFirebaseUser } from './getFirebaseUser';

export const getJarvisUser = async (phoneNumber: string) => {
  const fbUser = await getFirebaseUser(phoneNumber).catch((error) => {
    return Promise.reject(error);
  });
  const ref = admin.database().ref(`users/${fbUser.uid}`);
  return ref
    .once('value')
    .then((snapshot) => {
      if (!snapshot.exists()) {
        return Promise.reject(new Error('user-not-found'));
      }
      const data = snapshot.val() as JarvisUser;
      return data;
    })
    .catch((error) => {
      console.log('Error getting user:', error);
      return Promise.reject(new Error('error-reading-user-path'));
    });
};
