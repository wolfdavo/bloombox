/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

// OpenAI setup
import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const handleInbound = async (message: string) => {
  console.log('message', message);
  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: message,
    temperature: 0.6,
    max_tokens: 4000,
  });
  return completion.data.choices[0].text;
};
