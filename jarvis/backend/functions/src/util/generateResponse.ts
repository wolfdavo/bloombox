// OpenAI setup
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { messages as MESSAGES } from '../constants/messages';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
// eslint-disable-next-line @typescript-eslint/no-var-requires

export const generateResponse = async (phNum: string, message: string) => {
  const messages: ChatCompletionRequestMessage[] = [
    { role: 'system', content: MESSAGES.promtInjection.base },
  ];
  messages.push({ role: 'user', content: message });
  const completion = await openai
    .createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    })
    .catch((err) => {
      console.log('Error generating response:', err.data.error);
      return Promise.reject(new Error('error-generating-response'));
    });

  console.log(completion.statusText);

  const response = completion.data.choices[0].message;
  const responseMessage = response?.content;
  if (responseMessage !== undefined) {
    return responseMessage;
  } else {
    return MESSAGES.error;
  }
};
