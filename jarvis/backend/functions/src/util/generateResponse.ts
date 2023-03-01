// OpenAI setup
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { messages as MESSAGES } from '../constants/messages';
import { getConversation } from './getConversation';
import { saveConversation } from './saveConversation';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
// eslint-disable-next-line @typescript-eslint/no-var-requires

export const generateResponse = async (phNum: string, message: string) => {
  // Check if conversation history already exists
  const messages: ChatCompletionRequestMessage[] = await getConversation(
    phNum
  ).catch((err) => {
    console.log('Error getting conversation:', err);
    return Promise.reject(new Error('error-getting-conversation'));
  });
  messages.push({ role: 'user', content: message });
  const completion = await openai
    .createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    })
    // Old davinci config
    // .createCompletion({
    //   model: 'text-davinci-003',
    //   prompt: msg,
    //   temperature: 0.9,
    //   max_tokens: 2000,
    //   top_p: 1,
    //   frequency_penalty: 0,
    //   presence_penalty: 0.6,
    //   stop: [' HUMAN:', ' CLAUDIO:'],
    // })
    .catch((err) => {
      console.log('Error generating response:', err.data.error);
      return Promise.reject(new Error('error-generating-response'));
    });

  console.log(completion.statusText);

  const response = completion.data.choices[0].message;
  const responseMessage = response?.content;
  // Update conversation history
  const newConversationHistory = responseMessage
    ? [...messages, response]
    : messages;
  await saveConversation(phNum, newConversationHistory).catch((err) => {
    console.log('Error saving conversation:', err);
    return Promise.reject(new Error('error-saving-conversation'));
  });
  if (responseMessage !== undefined) {
    return responseMessage;
  } else {
    return MESSAGES.error;
  }
};
