const admin = require("firebase-admin");
const fs = require("fs").promises;
const path = require("path");

const NOTIFICATION_CONFIG = {
  title: "Test Notification",
  body: "This is a test notification message",
};

const SERVICE_ACCOUNT_PATH = "./serviceAccountKey.json";
const DEVICE_IDS_PATH = "./deviceIds.txt";

async function initializeFirebase() {
  try {
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
    console.error("Please ensure serviceAccountKey.json exists and is valid");
    process.exit(1);
  }
}

async function readDeviceIds() {
  try {
    const data = await fs.readFile(DEVICE_IDS_PATH, "utf8");
    const deviceIds = data
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    if (deviceIds.length === 0) {
      console.warn("No device IDs found in deviceIds.txt");
      return [];
    }

    console.log(`Found ${deviceIds.length} device ID(s)`);
    return deviceIds;
  } catch (error) {
    console.error("Failed to read device IDs:", error.message);
    console.error(
      "Please ensure deviceIds.txt exists and contains device tokens"
    );
    process.exit(1);
  }
}

async function sendNotification(deviceToken) {
  const message = {
    token: deviceToken,
    notification: NOTIFICATION_CONFIG,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(
      `✅ Successfully sent notification to device: ${deviceToken.substring(
        0,
        20
      )}...`
    );
    console.log(`   Message ID: ${response}`);
    return { success: true, token: deviceToken, messageId: response };
  } catch (error) {
    console.error(
      `❌ Failed to send notification to device: ${deviceToken.substring(
        0,
        20
      )}...`
    );
    console.error(`   Error: ${error.message}`);
    return { success: false, token: deviceToken, error: error.message };
  }
}

async function sendBatchNotifications(deviceTokens) {
  console.log(
    `\nStarting batch notification send to ${deviceTokens.length} device(s)...\n`
  );

  const results = await Promise.all(
    deviceTokens.map((token) => sendNotification(token))
  );

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log("\n========================================");
  console.log(`Notification Send Summary:`);
  console.log(`  Total devices: ${deviceTokens.length}`);
  console.log(`  ✅ Successful: ${successful}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log("========================================\n");

  if (failed > 0) {
    console.log("Failed devices:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.token.substring(0, 20)}... : ${r.error}`);
      });
  }

  return results;
}

async function main() {
  console.log("Firebase Notification Sender");
  console.log("============================\n");

  await initializeFirebase();

  const deviceIds = await readDeviceIds();

  if (deviceIds.length === 0) {
    console.log("No devices to send notifications to. Exiting.");
    return;
  }

  await sendBatchNotifications(deviceIds);

  console.log("Notification sending complete.");
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
