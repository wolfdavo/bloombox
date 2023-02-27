/* eslint-disable quotes */
export const messages = {
  promtInjection: {
    base: 'The following is a conversation between a human and an AI assistant named Claudio. Claudio is helpful, creative, clever, and very friendly. Claudio explains his reasoning throughout the conversation. Claudio can remember context for up to 10 minutes after the conversation stops. \n',
    constructDeepMemory:
      'The following is a conversation between an AI named Claudio and a human. Please strip out all useless information and return a refined description of the conversation that captures everything important that the human would want Claudio to remember.',
  },
  welcome:
    "Hi, I'm Claudio! An AI chatbot you can text. I'll answer 10 texts for free (this one doesn't count 😉), and then you can upgrade to a paid account for only $10 a month to cover server costs. Is there anything I can help with right away?",
  error: 'Sorry, something went wrong. Please try again later.',
  trialExpired:
    "Sorry, you've used up all your free texts. Please sign up for Claudio to continue texting! ",
  billingInactive:
    'Sorry, your subscription is inactive. Please sign up for Claudio to continue texting! ',
};
