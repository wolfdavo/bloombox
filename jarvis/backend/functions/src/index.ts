/* eslint-disable @typescript-eslint/no-var-requires */
// App setup
import admin = require('firebase-admin');
const serviceAccount = require('../bloombox-xyz-firebase-adminsdk-7te66-ec5b44ad86.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bloombox-xyz.firebaseio.com',
});

import * as functions from 'firebase-functions';
require('dotenv').config();

// Twillio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Logic for handling inbound messages
import { handleInbound } from './handleInbound';
import { generateResponse } from './util/generateResponse';

export const receiveJarvisMessage = functions.https.onRequest(
  async (request) => {
    console.log('request', request.body);
    const { Body, From } = request.body;
    const response = await handleInbound(Body, From);
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
    const res = await generateResponse('+15555555555', Body);
    response.send(res);
  }
);

export * from './jobs';
