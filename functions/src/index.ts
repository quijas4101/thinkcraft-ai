import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.setCustomUserClaims = functions.https.onCall(async (data, context) => {
  // Verify the request is from an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid, claims } = data;

  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    return { success: true };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new functions.https.HttpsError('internal', 'Error setting custom claims');
  }
}); 