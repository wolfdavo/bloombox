/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from 'firebase-functions';
require('dotenv').config();

// Twillio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Logic for handling inbound messages
import { handleInbound } from './handleInbound';

export const receiveJarvisMessage = functions.https.onRequest(
  async (request) => {
    console.log('request', request.body);
    const { Body, From } = request.body;
    const response = await handleInbound(Body);
    await client.messages.create({
      body: response,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: From,
    });
  }
);

export const testEndpoint = functions.https.onRequest(
  async (request, response) => {
    const { Body } = request.body;
    const res = await handleInbound(Body);
    response.send(res);
  }
);
