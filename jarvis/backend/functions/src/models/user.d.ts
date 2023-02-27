interface ClaudioUser {
  uid: string;
  phoneNumber: string;
  billingState: 'trial' | 'active' | 'inactive';
  trialMessagesRemaining: number;
  name?: string;
  stripeCustomerId?: string;
}
