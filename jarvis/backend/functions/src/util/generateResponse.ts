// OpenAI setup
import { Configuration, OpenAIApi } from 'openai';
import messages from '../constants/messages';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const generateResponse = async (message: string) => {
  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: message,
    temperature: 0.6,
    max_tokens: 4000,
  });
  const response = completion.data.choices[0].text;
  if (response !== undefined) {
    return response;
  } else {
    return messages.error;
  }
};
