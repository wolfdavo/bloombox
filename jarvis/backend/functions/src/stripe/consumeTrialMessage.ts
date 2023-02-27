import * as admin from 'firebase-admin';
import { getClaudioUser } from '../authentication/getClaudioUser';

export const consumeTrialMessage = async (phNum: string) => {
  const user = await getClaudioUser(phNum);
  if (user.trialMessagesRemaining > 0) {
    await admin
      .database()
      .ref('users')
      .child(user.uid)
      .update({
        trialMessagesRemaining: admin.database.ServerValue.increment(-1),
      });
  }
};
