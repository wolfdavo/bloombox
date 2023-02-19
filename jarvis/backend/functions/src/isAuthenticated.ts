import * as admin from 'firebase-admin';
const db = admin.database();

export const isAuthenticated = (phoneNumber: string) => {
  const ref = db.ref(`users/${phoneNumber}`);
  return ref.once('value').then((snapshot) => {
    const data = snapshot.val();
    return data && data.authenticated;
  });
};
