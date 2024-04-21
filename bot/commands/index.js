import Discord from 'discord.js';

import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

const __dirname = url.fileURLToPath(new URL('../', import.meta.url));

/**
 * @param {import('discord.js').Client} client
 */
const registerCommands = async (client) => {
    const files = fs.readdirSync(path.join(__dirname, 'commands')).filter((file) => file !== 'index.js');
    const commands = new Discord.Collection();
    const commandsMeta = [];

    for (let i = 0; i < files.length; i++) {
        const { default: command } = await import('./' + files[i]);

        commands.set(command.meta.name, command);

        console.log(command.meta);
        commandsMeta.push(command.meta.toJSON());
    }

    client.on('ready', async () => {
        await new Discord.REST()
            .setToken(process.env.DISCORD_TOKEN)
            .put(Discord.Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, '1187934890113642596'), {
                body: commandsMeta
            });
    });

    client.on(Discord.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;


    });
}

export {
    registerCommands as default
};