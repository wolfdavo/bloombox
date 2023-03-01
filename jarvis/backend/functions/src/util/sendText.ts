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
    // Use Twilio for SMS
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
    // Use Vonage for Messenger
    await vonage.messages
      .send(new Text(message, to, process.env.FB_SENDER_ID))
      .catch((err: unknown) => console.error(err));
  }
};
