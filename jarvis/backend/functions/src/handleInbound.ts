/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { auth } from 'firebase-admin';
// OpenAI setup
import { Configuration, OpenAIApi } from 'openai';
import { createNewUser } from './authentication/createNewUser';
import { getJarvisUser } from './authentication/getJarvisUser';
import messages from './constants/messages';
import { generateResponse } from './util/generateResponse';
import { sendText } from './util/sendText';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const handleInbound = async (message: string, phoneNumber: string) => {
  // Check if user is new
  const userIsNew = await auth()
    .getUserByPhoneNumber(phoneNumber)
    .then(() => false)
    .catch((err) => {
      if (err.code === 'auth/user-not-found') {
        return true;
      }
      return false;
    });

  // If new, create new user and send welcome text
  if (userIsNew) {
    // Create new user
    await createNewUser(phoneNumber);
    // Send welcome text
    await sendText(phoneNumber, messages.welcome);
    return;
  }

  // If not new, get Jarvis user
  const user = await getJarvisUser(phoneNumber).catch((err) => {
    console.log('Error getting user:', err);
    return Promise.reject(new Error('error-getting-user'));
  });

  // If user is active, generate response and send it
  if (user.billingState === 'active') {
    const response = await generateResponse(message);
    await sendText(phoneNumber, response);
    return;
  }

  // Check if user is in trial
  if (user.billingState === 'trial') {
    // If they have messages remaining, generate response and send it
    if (user.trialMessagesRemaining > 0) {
      const response = await generateResponse(message);
      await sendText(phoneNumber, response);
    } else {
      // If they don't have messages remaining, send them a message saying they need to upgrade
      await sendText(phoneNumber, messages.trialExpired);
    }
    return;
  }

  // If user has failed billing, let them know and send Stripe link to fix it
  if (user.billingState === 'failed') {
    await sendText(phoneNumber, messages.billingFailed);
    return;
  }

  // If user has canceled billing, let them know and send Stripe link to fix it
  if (user.billingState === 'canceled') {
    await sendText(phoneNumber, messages.billingCanceled);
    return;
  }
};
