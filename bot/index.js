import Discord from 'discord.js';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import registerCommands from './commands/index.js';
import registerComponents from './components/index.js';
import initializeLinksAndDB from './setup.js'
config();

// Define Discord Bot Client With All Intents
const client = new Discord.Client({
	intents: Object.keys(Discord.GatewayIntentBits).map(key => Discord.GatewayIntentBits[key])
});

registerCommands(client);
registerComponents(client);
initializeLinksAndDB();

// On Ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Start Bot
client.login(process.env.DISCORD_TOKEN);