// OpenAI setup
import { Configuration, OpenAIApi } from 'openai';
import { messages } from '../constants/messages';
import { getConversation } from './getConversation';
import { saveConversation } from './saveConversation';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
// eslint-disable-next-line @typescript-eslint/no-var-requires

export const generateResponse = async (phNum: string, message: string) => {
  // Check if conversation history already exists
  const conversationHistory = await getConversation(phNum).catch((err) => {
    console.log('Error getting conversation:', err);
    return Promise.reject(new Error('error-getting-conversation'));
  });
  const msg = `${conversationHistory}
  HUMAN: ${message}
  CLAUDIO: `;
  const completion = await openai
    .createCompletion({
      model: 'text-davinci-003',
      prompt: msg,
      temperature: 0.9,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [' HUMAN:', ' CLAUDIO:'],
    })
    .catch((err) => {
      console.log('Error generating response:', err);
      return Promise.reject(new Error('error-generating-response'));
    });

  console.log(completion.statusText);

  const response = completion.data.choices[0].text;
  // Update conversation history
  const newConversationHistory = `${conversationHistory}
  HUMAN: ${message}
  CLAUDIO: ${response}`;
  await saveConversation(phNum, newConversationHistory).catch((err) => {
    console.log('Error saving conversation:', err);
    return Promise.reject(new Error('error-saving-conversation'));
  });
  if (response !== undefined) {
    return response;
  } else {
    return messages.error;
  }
};
