/* eslint-disable quotes */
import * as admin from 'firebase-admin';
import { memory, messages } from '../constants';

export const getConversation = async (phNum: string) => {
  const db = admin.database();
  // First, check if the last active was within our short term memory
  const lastActive = await db
    .ref(`conversations/${phNum}/lastActive`)
    .get()
    .catch((err) => {
      console.log('Error getting last active:', err);
      return Promise.reject(new Error('error-getting-last-active'));
    });
  if (lastActive.exists()) {
    const lastActiveTime = lastActive.val() as number;
    const now = Date.now();
    const diff = now - lastActiveTime;
    if (diff > memory.shortTermMemory) {
      return messages.promtInjection.base;
    }
  }

  // If we get here, the last active was not forgotten or not set. Either way, we can try and fetch the conversation
  const doc = await db
    .ref(`conversations/${phNum}/conversation`)
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
