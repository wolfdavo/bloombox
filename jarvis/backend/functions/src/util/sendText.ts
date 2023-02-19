/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

// Twillio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

export const sendText = async (to: string, message: string) => {
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
};
