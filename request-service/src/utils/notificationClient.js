const axios = require("axios");

exports.notifyDonors = async (donors, requestData) => {
  const notificationUrl =
    process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5004";

  console.log(`Starting to notify ${donors.length} donors...`);

  const notifications = donors.map((donor) => {
    // Construct email content
    const subject = `Urgent Blood Request: ${requestData.bloodGroup} Needed!`;
    const message = `
      Hello ${donor.name},
      
      There is an urgent request for ${requestData.bloodGroup} blood at ${requestData.hospitalName}, ${requestData.location}.
      
      Patient: ${requestData.patientName}
      Units Needed: ${requestData.units}
      Request ID: ${requestData._id}
      
      Please login to the app to accept this request if you are available.
      
      Thank you,
      Blood Donor App Team
    `;

    // Return the promise (don't await here, we want parallel execution)
    return axios
      .post(`${notificationUrl}/api/v1/notifications/send`, {
        email: donor.email,
        subject,
        message,
      })
      .catch((err) => {
        // Catch individual errors so one failure doesn't stop the whole process
        console.error(`Failed to notify ${donor.email}:`, err.message);
      });
  });

  // Execute all notification requests in parallel
  // We don't await Promise.all here because we don't want to block the request creation
  // response time. We let it run in the background.
  Promise.all(notifications).then(() => {
    console.log("Notification process completed.");
  });
};
