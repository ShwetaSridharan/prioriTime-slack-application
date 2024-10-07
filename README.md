# PrioriTime Slack App

![PrioriTime](https://github.com/user-attachments/assets/0dead324-e199-41f3-89d7-36f12e62f371)


PrioriTime is a Slack app designed to help teams prioritize their messages effectively. It allows users to tag messages as urgent, semi-urgent, or not urgent, helping to manage communication priorities within a workspace.

## Features

- Slash commands for tagging messages:
  - `/urgent`: Tag a message as urgent
  - `/semi-urgent`: Tag a message as semi-urgent
  - `/not-urgent`: Tag a message as not urgent
- Automatic date/time parsing for setting due dates
- Works in public channels, private channels, and direct messages
- OAuth implementation for workspace-wide usage

## Installation

1. Visit [Add to Slack](#) (replace with your actual Slack App installation link)
2. Authorize the app for your workspace
3. Once installed, you can use the slash commands in any channel or DM where the app is added

## Usage

To use PrioriTime, simply type one of the slash commands followed by your message:

```
/urgent Submit the quarterly report by EOD
/semi-urgent Review the new marketing materials
/not-urgent Plan team lunch for next month
```

The app will automatically parse any date or time mentioned in your message and set it as the due date.

## Development

### Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn
- A Slack workspace for testing

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/prioritime-slack-app.git
   cd prioritime-slack-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   SLACK_SIGNING_SECRET=your_signing_secret
   SLACK_BOT_TOKEN=your_bot_token
   SLACK_APP_TOKEN=your_app_token
   SLACK_CLIENT_ID=your_client_id
   SLACK_CLIENT_SECRET=your_client_secret
   STATE_SECRET=your_state_secret
   ```

4. Run the app locally:
   ```
   npm start
   ```

### Deployment

This app is configured for deployment on Vercel. To deploy:

1. Push your changes to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in your Vercel project settings
4. Deploy the app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
