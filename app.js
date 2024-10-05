require("dotenv").config();
const { App, ExpressReceiver } = require("@slack/bolt");
const { WebClient } = require("@slack/web-api");
const chrono = require("chrono-node");

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.STATE_SECRET,
  scopes: ['commands', 'chat:write', 'chat:write.public'],
  installationStore: {
    storeInstallation: async (installation) => {
      // TODO: implement installation storage
      console.log('Installation stored:', installation);
    },
    fetchInstallation: async (installQuery) => {
      // TODO: implement installation retrieval
      console.log('Fetching installation:', installQuery);
    },
  },
});

const app = new App({
  receiver,
  token: process.env.SLACK_BOT_TOKEN,
});

const handlePriorityCommand = async ({ command, ack, client }) => {
  await ack();
  console.log("Received command:", JSON.stringify(command, null, 2));

  const { text, user_id, channel_id } = command;
  let priority = command.command.replace("/", "");

  // Parse date/time from the message
  const parsedDate = chrono.parse(text);
  let dueDate = "";
  let message = text;

  if (parsedDate.length > 0) {
    dueDate = parsedDate[0].start.date();
    message = text.replace(parsedDate[0].text, "").trim();
  }

  const formattedMessage = `*[${priority}]* <@${user_id}>: ${message}${
    dueDate ? `\nDue: ${dueDate.toLocaleString()}` : ""
  }`;

  try {
    const result = await client.chat.postMessage({
      channel: channel_id,
      text: formattedMessage,
    });
    console.log(
      `Message sent successfully. Channel: ${result.channel}, Timestamp: ${result.ts}`
    );
  } catch (error) {
    console.error("Error sending message:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    if (error.data && error.data.error === "channel_not_found") {
      try {
        await client.chat.postMessage({
          channel: user_id,
          text: "I'm sorry, but I couldn't send your priority message in the specified channel. This may be due to permissions limitations. Please make sure the app is installed in the workspace and has the necessary permissions.",
        });
      } catch (notificationError) {
        console.error("Error sending notification to user:", notificationError);
      }
    }
  }
};

// Command handlers
app.command("/urgent", handlePriorityCommand);
app.command("/semi-urgent", handlePriorityCommand);
app.command("/not-urgent", handlePriorityCommand);

// OAuth redirect handler
receiver.router.get('/slack/oauth_redirect', async (req, res) => {
  try {
    await app.receiver.handleCallback(req, res);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('OAuth Error');
  }
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ PrioriTime app is running!");
})();