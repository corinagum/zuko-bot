const restify = require('restify'); // WHYYY can't I do import???
const path = require('path');

const { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } = require('botbuilder');

const { DialogBot } = require('./bots/dialogBot');
const { UserProfileDialog } = require('./dialogs/userProfileDialog');

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const adapter = new BotFrameworkAdapter({
    appId: ENV_FILE.MicrosoftAppId,
    appPassword: ENV_FILE.MicrosoftAppPassword
});

// Catch-all for errors

adapter.onTurnError = async (context, error) => {
    console.error(`/n [onTurnError]: ${ error }`);

    await context.sendActivity('Something went wrong');

    // Clear state
    await conversationState.delete();
};

// Define the state store for your bot.
// See https://aka.ms/about-bot-state to learn more about using MemoryStorage
// A bot requires a state storage system to persist the dialog and user state between messages
const memoryStorage = new MemoryStorage();

// Create conversation state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Pass in a logger to the bot. logger is the console, but App Insights and Event Hub exist

const logger = console;

// Create the main dialog
const dialog = new UserProfileDialog(userState, logger);
const bot = new DialogBot(conversationState, userState, dialog, logger);

// Create HTTP server
let server = restify.createServer();
server.listen(ENV_FILE.port || process.env.PORT || 3978, function() {
    console.log(`/n${ server.name } listening to ${ server.url }.`);
});

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route message to the bot's main handler.
        await bot.run(context);
    });
});
