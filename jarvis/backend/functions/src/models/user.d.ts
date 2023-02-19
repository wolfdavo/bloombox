interface JarvisUser {
  uid: string;
  phoneNumber: string;
  billingState: 'trial' | 'active' | 'failed' | 'canceled';
  trialMessagesRemaining: number;
  name?: string;
}
