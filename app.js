require("dotenv").config();
const { App } = require("@slack/bolt");
const { WebClient } = require("@slack/web-api");
const chrono = require("chrono-node");

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: process.env.STATE_SECRET, // Make sure to add this to your .env file
    scopes: ['chat:write', 'commands', 'users:read'],
    installationStore: {
      storeInstallation: async (installation) => {
        // TODO: store installation in database
        console.log('Installation stored for team', installation.team.id);
        // Return true to indicate success
        return true;
      },
      fetchInstallation: async (installQuery) => {
        // TODO: fetch installation from database
        console.log('Installation fetched for team', installQuery.teamId);
        // Return the installation data
        // For now, we'll return null, which will cause the app to fallback to the built-in memory store
        return null;
      },
    },
  });

// In-memory store for user tokens (replace with database in production)
const userTokens = new Map();

app.event('app_home_opened', async ({ event, client }) => {
  await client.views.publish({
    user_id: event.user,
    view: {
      type: 'home',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Welcome to PrioriTime! Click the button below to authorize the app.',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Authorize App',
              },
              url: `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=chat:write,commands&user_scope=chat:write`,
              action_id: 'authorize_app',
            },
          ],
        },
      ],
    },
  });
});

app.action('authorize_app', async ({ ack, body, client }) => {
  await ack();
  // The authorization URL is already in the button, so we don't need to do anything here
});

app.event('tokens_revoked', async ({ event, context }) => {
  // Remove revoked tokens from our store
  if (event.tokens.oauth) {
    event.tokens.oauth.forEach(revokedId => {
      userTokens.delete(revokedId);
    });
  }
});

app.event('app_uninstalled', async ({ event, context }) => {
  // TODO: Clean up any data for the uninstalled workspace
  console.log('App uninstalled from workspace', context.teamId);
});

const handlePriorityCommand = async ({ command, ack, respond, client }) => {
  await ack();
  console.log('Received command:', JSON.stringify(command, null, 2));

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
    const userToken = userTokens.get(user_id);
    if (!userToken) {
      await respond({
        text: "Please authorize the app to send messages on your behalf. Visit the app's home tab to authorize.",
        response_type: 'ephemeral',
      });
      return;
    }

    const userClient = new WebClient(userToken);
    const result = await userClient.chat.postMessage({
      channel: channel_id,
      text: formattedMessage,
    });

    console.log(`Message sent successfully. Channel: ${result.channel}, Timestamp: ${result.ts}`);
  } catch (error) {
    console.error("Error sending message:", error);
    await respond({
      text: "There was an error sending your message. Please try again or re-authorize the app.",
      response_type: 'ephemeral',
    });
  }
};

// Command handlers
app.command("/urgent", handlePriorityCommand);
app.command("/semi-urgent", handlePriorityCommand);
app.command("/not-urgent", handlePriorityCommand);

// Handle the OAuth callback
app.oauth.success(async ({ token, userId }) => {
  console.log('Successfully completed OAuth flow');
  userTokens.set(userId, token.access_token);
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ PrioriTime app is running!");
})();