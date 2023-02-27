import * as admin from 'firebase-admin';
import { ServerValue } from 'firebase-admin/database';

export const saveConversation = async (phNum: string, conversation: string) => {
  const db = admin.database();
  await db
    .ref(`conversations/${phNum}`)
    .set({
      lastActive: ServerValue.TIMESTAMP,
      conversation,
    })
    .catch((err) => {
      console.log('Error saving conversation:', err);
      return Promise.reject(new Error('error-saving-conversation'));
    });
};
