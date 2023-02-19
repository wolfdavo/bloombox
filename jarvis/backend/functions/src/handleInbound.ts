/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { auth } from 'firebase-admin';
// OpenAI setup
import { Configuration, OpenAIApi } from 'openai';
import { createNewUser } from './authentication/createNewUser';
import messages from './constants/messages';
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
  }
  // If not new, get Jarvis user

  // If user is active, generate response and send it

  // Check if user is in trial
  // If in trial, check if they have messages remaining
  // If they don't have messages remaining, send them a message saying they need to upgrade
  // If they have messages remaining, generate response and send it

  // If user has failed billing, let them know and send Stripe link to fix it

  // If user has canceled billing, let them know and send Stripe link to fix it

  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: message,
    temperature: 0.6,
    max_tokens: 4000,
  });
  return completion.data.choices[0].text;
};
