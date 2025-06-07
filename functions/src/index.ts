/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Listens for writes to /users/{userId} in Firestore and sets a
 * corresponding 'isAdmin' custom claim on the Firebase Auth user.
 */
export const setAdminClaimFromFirestore = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const logger = functions.logger;
    const newData = change.after.data();

    logger.info(`User document written for UID: ${userId}`);

    const isFirestoreAdmin = newData?.isAdmin === true;

    try {
      const userRecord = await admin.auth().getUser(userId);
      const currentClaims = userRecord.customClaims || {};

      if (currentClaims.isAdmin !== isFirestoreAdmin) {
        logger.info(
          `Updating 'isAdmin' custom claim for ${userId} to: ${isFirestoreAdmin}`
        );
        await admin.auth().setCustomUserClaims(userId, {
          ...currentClaims,
          isAdmin: isFirestoreAdmin,
        });
        logger.info('Successfully set custom claim.');
      } else {
        logger.info("Custom claim 'isAdmin' is already up to date.");
      }
      return null;
    } catch (error) {
      logger.error(`Error setting custom claim for user ${userId}:`, error);
      return null;
    }
  });

/**
 * HTTPS Callable Cloud Function to permanently delete a user and their data.
 * This must be called by an authenticated admin user.
 */
export const deleteUser = functions.https.onCall(async (data, context) => {
  const logger = functions.logger;
  const callingUid = context.auth?.uid;
  const targetUid = data.uid;

  logger.info(
    `Delete request received from UID: ${callingUid} for target UID: ${targetUid}`
  );

  if (!callingUid) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const callingUser = await admin.auth().getUser(callingUid);
  if (callingUser.customClaims?.isAdmin !== true) {
    logger.error(
      `User ${callingUid} is not an admin and tried to delete user ${targetUid}.`
    );
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can delete users.'
    );
  }

  if (!targetUid || typeof targetUid !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      "The function must be called with a 'uid' argument."
    );
  }

  try {
    logger.info(`Deleting user from Authentication: ${targetUid}`);
    await admin.auth().deleteUser(targetUid);
    logger.info(`Successfully deleted Auth user: ${targetUid}`);

    logger.info(`Deleting user document from Firestore: users/${targetUid}`);
    const firestoreDocRef = admin
      .firestore()
      .collection('users')
      .doc(targetUid);
    await firestoreDocRef.delete();
    logger.info(`Successfully deleted Firestore document: users/${targetUid}`);

    const bucket = admin.storage().bucket();
    const folderPath = `profile_pictures/${targetUid}/`;
    logger.info(`Deleting files from Storage folder: ${folderPath}`);
    await bucket.deleteFiles({ prefix: folderPath });
    logger.info(`Successfully deleted Storage folder: ${folderPath}`);

    return { success: true, message: `Successfully deleted user ${targetUid}` };
  } catch (error) {
    logger.error(`Failed to delete user ${targetUid}:`, error);
    if ((error as any).code === 'auth/user-not-found') {
      throw new functions.https.HttpsError(
        'not-found',
        'The user to be deleted does not exist in Firebase Authentication.'
      );
    }
    throw new functions.https.HttpsError(
      'internal',
      'An unexpected error occurred while deleting the user.'
    );
  }
});
