import * as admin from 'firebase-admin';

export const getCustomerId = async (uid: string): Promise<string> => {
  const ref = admin.database().ref('users/' + uid + '/stripeCustomerId');

  let stripeId = '';

  await ref.once(
    'value',
    (snapshot) => {
      stripeId = snapshot.val();
    },
    (err) => {
      console.log('getStripeCustomerId failed: ' + err.name);
    }
  );

  return stripeId;
};
