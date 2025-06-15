import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { AssistanceType } from './enums/assistance-type.enum';
import { UserType } from './enums/user-type.enum';
import { ConnectionRequestStatus } from './enums/connection-request-status.enum';

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

/**
 * A scheduled Cloud Function that runs once every 24 hours to aggregate
 * platform statistics and save them to a single document in Firestore.
 */
export const aggregateStatistics = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const logger = functions.logger;
    logger.info('Starting scheduled statistics aggregation.');

    const db = admin.firestore();

    try {
      let totalVerifiedAssistants = 0;
      let totalResearchers = 0;
      let totalConnectionsMade = 0;
      const categoryCounts: { [key: string]: number } = {};
      const categoryRateData: {
        [key: string]: { totalRate: number; count: number };
      } = {};

      // --- Admin Stats Initialization ---
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const assistantSignupsLast30Days: { [date: string]: number } = {};
      const researcherSignupsLast30Days: { [date: string]: number } = {};
      const verificationStatusCounts = { verified: 0, unverified: 0 };
      const categoryVerificationBreakdown: {
        [key: string]: { verified: number; unverified: number };
      } = {};

      Object.values(AssistanceType).forEach((type) => {
        categoryCounts[type] = 0;
        categoryRateData[type] = { totalRate: 0, count: 0 };
        categoryVerificationBreakdown[type] = { verified: 0, unverified: 0 };
      });

      // --- Fetch and process all users ---
      const usersSnapshot = await db.collection('users').get();
      logger.info(`Processing ${usersSnapshot.size} total user documents.`);

      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        const createdAt = user.createdAt?.toDate
          ? user.createdAt.toDate()
          : new Date(0);
        const dateString = createdAt.toISOString().split('T')[0];

        // Researchers
        if (user.userType === UserType.Researcher) {
          totalResearchers++;
          if (createdAt > thirtyDaysAgo) {
            researcherSignupsLast30Days[dateString] =
              (researcherSignupsLast30Days[dateString] || 0) + 1;
          }
        }

        // Care Assistants
        if (user.userType === UserType.CareAssistant) {
          if (createdAt > thirtyDaysAgo) {
            assistantSignupsLast30Days[dateString] =
              (assistantSignupsLast30Days[dateString] || 0) + 1;
          }
          if (user.isVerified === true) {
            verificationStatusCounts.verified++;
          } else {
            verificationStatusCounts.unverified++;
          }
          if (
            user.assistanceType &&
            categoryVerificationBreakdown[user.assistanceType]
          ) {
            if (user.isVerified === true) {
              categoryVerificationBreakdown[user.assistanceType].verified++;
            } else {
              categoryVerificationBreakdown[user.assistanceType].unverified++;
            }
          }

          if (user.isVerified === true) {
            totalVerifiedAssistants++;
            if (
              user.assistanceType &&
              categoryCounts.hasOwnProperty(user.assistanceType)
            ) {
              categoryCounts[user.assistanceType]++;
            }
            if (user.assistanceType && user.hourlyRate > 0) {
              if (categoryRateData.hasOwnProperty(user.assistanceType)) {
                categoryRateData[user.assistanceType].totalRate +=
                  user.hourlyRate;
                categoryRateData[user.assistanceType].count++;
              }
            }
          }
        }
      });

      // --- Fetch and count accepted requests ---
      const requestsSnapshot = await db
        .collection('requests')
        .where('status', '==', ConnectionRequestStatus.Accepted)
        .get();
      totalConnectionsMade = requestsSnapshot.size;

      // --- Calculate average rates ---
      const averageRates: { [key: string]: number } = {};
      for (const type in categoryRateData) {
        if (categoryRateData[type].count > 0) {
          averageRates[type] = parseFloat(
            (
              categoryRateData[type].totalRate / categoryRateData[type].count
            ).toFixed(2)
          );
        } else {
          averageRates[type] = 0;
        }
      }

      const finalStats = {
        totalVerifiedAssistants,
        totalResearchers,
        totalConnectionsMade,
        categoryCounts,
        averageRates,
        assistantSignupsLast30Days,
        researcherSignupsLast30Days,
        verificationStatusCounts,
        categoryVerificationBreakdown,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      };

      logger.info('Final calculated stats:', finalStats);

      const statsDocRef = db.collection('statistics').doc('live_stats');
      await statsDocRef.set(finalStats, { merge: true });

      logger.info('Successfully updated statistics/live_stats document.');
      return null;
    } catch (error) {
      logger.error('Error during statistics aggregation:', error);
      return null;
    }
  });
