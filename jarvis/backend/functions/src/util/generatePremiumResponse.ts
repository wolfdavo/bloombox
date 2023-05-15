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

// Premium version has recursive memory for up to 10 mins
export const generatePremiumResponse = async (
  phNum: string,
  message: string
) => {
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
      model: 'gpt-4',
      messages,
    })
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
