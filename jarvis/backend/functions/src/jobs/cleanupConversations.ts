import * as functions from 'firebase-functions';

// Run every minute
export const cleanupConversations = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    console.log('Cleaning up conversations');
    // Order the database by last updated
    // Delete all conversations that haven't been updated in 10 minutes
    return null;
  });
