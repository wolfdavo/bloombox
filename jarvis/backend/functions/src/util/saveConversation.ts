import * as admin from 'firebase-admin';

export const saveConversation = async (phNum: string, conversation: string) => {
  const db = admin.database();
  await db.ref(`conversations/${phNum}`).set(conversation).catch((err) => {
    console.log('Error saving conversation:', err);
    return Promise.reject(new Error('error-saving-conversation'));
  });
};
