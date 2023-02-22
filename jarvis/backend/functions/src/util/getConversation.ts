/* eslint-disable quotes */
import * as admin from 'firebase-admin';
import messages from '../constants/messages';

export const getConversation = async (phNum: string) => {
  const db = admin.database();
  const doc = await db
    .ref(`conversations/${phNum}`)
    .get()
    .catch((err) => {
      console.log('Error getting conversation:', err);
      return Promise.reject(new Error('error-getting-conversation'));
    });
  if (doc.exists()) {
    return doc.val() as string;
  } else {
    return messages.promtInjection.base;
  }
};
