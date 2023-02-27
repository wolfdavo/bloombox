/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { auth } from 'firebase-admin';
import { createNewUser } from './authentication/createNewUser';
import { getClaudioUser } from './authentication/getClaudioUser';
import { messages } from './constants/messages';
import {
  createCustomerPortalSession,
  createCustomerSubscriptionSession,
} from './stripe/paymentWebhook';
import { generateResponse } from './util/generateResponse';
import { sendText } from './util/sendText';

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
  const user = await getClaudioUser(phoneNumber).catch((err) => {
    console.log('Error getting user:', err);
    return Promise.reject(new Error('error-getting-user'));
  });

  // If user is active, generate response and send it
  if (user.billingState === 'active') {
    const response = await generateResponse(phoneNumber, message);
    await sendText(phoneNumber, response);
    return;
  }

  // Check if user is in trial
  if (user.billingState === 'trial') {
    // If they have messages remaining, generate response and send it
    if (user.trialMessagesRemaining > 0) {
      const response = await generateResponse(phoneNumber, message);
      await sendText(phoneNumber, response);
    } else {
      // If they don't have messages remaining, send them a message saying they need to upgrade
      const checkoutSession = await createCustomerSubscriptionSession(user.uid);
      if (checkoutSession === null) {
        await sendText(phoneNumber, messages.error);
        return;
      }
      await sendText(phoneNumber, messages.trialExpired + checkoutSession.url);
    }
    return;
  }

  // If user has failed billing, let them know and send Stripe link to fix it
  if (user.billingState === 'inactive') {
    const billingPortal = await createCustomerPortalSession(user.uid);
    if (billingPortal === null) {
      await sendText(phoneNumber, messages.error);
      return;
    }
    await sendText(phoneNumber, messages.billingInactive + billingPortal.url);
    return;
  }
};
