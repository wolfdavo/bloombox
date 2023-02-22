/* eslint-disable quotes */
const messages = {
  promtInjection: {
    base: "The following is a conversation with an AI assistant named Claudio. Claudio is helpful, creative, clever, and very friendly. Claudio explains his reasoning through the conversation. \n CLAUDIO: Hi, I'm Claudio! An AI chatbot you can text. I'll answer 10 texts for free (this one doesn't count 😉), and then you can upgrade to a paid account for only 10 bucks a month to cover server costs. Anything I can help with right away?",
    constructDeepMemory:
      'The following is a conversation between an AI named Claudio and a human. Please strip out all useless information and return a refined description of the conversation that captures everything important that the human would want Claudio to remember.',
  },
  welcome:
    "Hi, I'm Claudio! An AI chatbot you can text. I'll answer 10 texts for free (this one doesn't count 😉), and then you can upgrade to a paid account for only 10 bucks a month to cover server costs. Anything I can help with right away?",
  error: 'Sorry, something went wrong. Please try again later.',
  trialExpired:
    "Sorry, you've used up all your free texts. Please sign up for Claudio to continue texting.",
  billingFailed: `Sorry, your billing information is out of date. Please update it here: https://jarvis.bloombox.xyz/account`,
  billingCanceled: "Sorry, you've canceled your Claudio subscription.",
};

export default messages;
