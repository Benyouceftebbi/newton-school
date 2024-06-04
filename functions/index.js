const {onCall,HttpsError,onRequest} = require("firebase-functions/v2/https");
const {getDatabase} = require("firebase-admin/database");
const {logger} = require("firebase-functions/v2");
const admin=require('firebase-admin')
const { createEvent } = require('./googlemeet');
const functions = require('firebase-functions');
var generator = require('generate-password');
admin.initializeApp();

exports.createGoogleMeetLink =onCall(async (request) => {
  const { emails, startTime, endTime } = request.data;

  if (!emails || !startTime || !endTime) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters: emails, startTime, endTime, timeZone'
    );
  }

  try {
    const meetLink = await createEvent(emails, startTime, endTime);
    return { meetLink };
  } catch (error) {
    logger.error("Error creating Google Meet link:", error);
    throw new HttpsError(
 error
    );
  }
});


exports.createUserAndAssignRole = onCall(async (request) => {
  try {
    if (!request.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new HttpsError("failed-precondition", "The function must be " +
              "called while authenticated.");
    }
    const { data } = request;
    var password = generator.generate({
      length: 10,
      numbers: true
    });

    const userRecord =  await admin.auth().createUser({
      email: data.email,
      password: password,
    });
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "parent" });
    const parentData = {
      ...data,
      id: userRecord.uid,
    };
    await admin.firestore().collection('Parents').doc(userRecord.uid).set(parentData);

    logger.info("User created and assigned role");

    return { success: true, uid: userRecord.uid, data: data, password:password};
  } catch (error) {
    // Log error message
    logger.error("Error creating user and assigning role:", error);

    // Throw HttpsError
    throw new HttpsError("internal", "Error creating user and assigning role");
  }
});
