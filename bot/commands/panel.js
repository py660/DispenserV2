import Discord from 'discord.js';
import fs from 'fs';

export default {
    meta: new Discord.SlashCommandBuilder()
        .setName('panel')
        .setDescription('Get Link Dispenser Panel'),
    async handler(interaction, client) {
        fs.readFile('./types.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            try {
                const types = JSON.parse(data);
                const rows = [];
                let buttons = [];

                types.forEach((type, index) => {
                    if (index % 5 === 0 && index !== 0) {
                        rows.push(new Discord.ActionRowBuilder().addComponents(...buttons));
                        buttons = [];
                    }
                    const button = new Discord.ButtonBuilder()
                        .setLabel(type.name)
                        .setStyle('PRIMARY')
                        .setCustomId(type.root);
                    buttons.push(button);
                });

                if (buttons.length > 0) {
                    rows.push(new Discord.ActionRowBuilder().addComponents(...buttons));
                }

                interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setTitle('Link Dispenser')
                            .setDescription('Get Access to Shadow Links! Please do not report links because they are blocked.')
                            .setColor("#272ef5"),
                    ],
                    components: rows,
                });
            } catch (error) {
                console.error('Error parsing JSON file:', error);
            }
        });
    }
};
