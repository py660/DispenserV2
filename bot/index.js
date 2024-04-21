import Discord from 'discord.js';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import registerCommands from './commands/index.js';

config();

// Define Discord Bot Client With All Intents
const client = new Discord.Client({
	intents: Object.keys(Discord.GatewayIntentBits).map(key => Discord.GatewayIntentBits[key])
});

registerCommands(client);

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, { dbName: 'NewDispenser',})
.then(() => console.log('Connected to MongoDB'))
.catch((e) => console.error('Failed to Connect to MongoDB', e));

// On Ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Start Bot
client.login(process.env.DISCORD_TOKEN);