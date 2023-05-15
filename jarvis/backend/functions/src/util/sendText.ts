import { getUID } from '../authentication/getUID';
import { getBillingSession } from '../stripe/getBillingSession';
import { getCustomerId } from '../stripe/getCustomerId';

/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

// Twillio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Vonage setup
const { Vonage } = require('@vonage/server-sdk');
const { Text } = require('@vonage/messages/dist/classes/Messenger/Text');

const vonage = new Vonage(
  {
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    applicationId: process.env.VONAGE_APPLICATION_ID,
    privateKey: process.env.VONAGE_APPLICATION_PRIVATE_KEY_PATH,
  },
  {
    apiHost: process.env.BASE_URL,
  }
);

export const sendText = async (to: string, message: string) => {
  const isSMS = to.startsWith('+'); // Phone number, FB Messenger ID's start with 'fbm-'
  if (isSMS) {
    // If there is a billing portal link in the message
    if (message.includes('{billingPortal}')) {
      // We need to generate a billing link and replace all
      // occurrences of {billingPortal} in the message with the link
      const uid = await getUID(to);
      const stripeCustomerId = await getCustomerId(uid);
      const billingSession = await getBillingSession(stripeCustomerId);
      const billingLink = billingSession.url;
      message = message.split('{billingPortal}').join(billingLink);
    }
    // Use Twilio for SMS
    const maxMMSLength = 1600;
    if (message.length < maxMMSLength) {
      await client.messages
        .create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to,
        })
        .catch((error: unknown) => {
          console.log('Error sending text:', error);
          return Promise.reject(new Error('error-sending-text'));
        });
    } else {
      for (let i = 0; i < message.length; i += maxMMSLength) {
        const remainingCharacters = message.length - i;
        await client.messages
          .create({
            body: message.substring(
              i,
              i + Math.min(maxMMSLength, remainingCharacters)
            ),
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
          })
          .catch((error: unknown) => {
            console.log('Error sending text:', error);
            return Promise.reject(new Error('error-sending-text'));
          });
      }
    }
  } else {
    // Use Vonage for Messenger
    await vonage.messages
      .send(new Text(message, to, process.env.FB_SENDER_ID))
      .catch((err: unknown) => console.error(err));
  }
};
