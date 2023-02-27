/* eslint-disable @typescript-eslint/no-var-requires */
// App setup
import admin = require('firebase-admin');
const serviceAccount = require('../bloombox-xyz-firebase-adminsdk-7te66-ec5b44ad86.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bloombox-xyz-default-rtdb.firebaseio.com',
});

import * as functions from 'firebase-functions';
require('dotenv').config();

// Logic for handling inbound messages
import { handleInbound } from './handleInbound';
import { generateResponse } from './util/generateResponse';

export const receiveJarvisMessage = functions.https.onRequest(
  async (request) => {
    console.log('request', request.body);
    const { Body, From } = request.body;
    await handleInbound(Body, From);
  }
);

export const testEndpoint = functions.https.onRequest(
  async (request, response) => {
    const { Body } = request.body;
    const res = await generateResponse('+15555555555', Body);
    response.send(res);
  }
);

exports.stripe = require('./stripe/paymentWebhook');
