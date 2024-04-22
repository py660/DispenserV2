import Discord from 'discord.js';
import fs from 'fs';

export default {
    meta: new Discord.SlashCommandBuilder()
        .setName('panel')
        .setDescription('Get Link Dispenser Panel'),
    async handler(interaction, client) {
        fs.readFile('./bot/types.json', 'utf8', (err, data) => {
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
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setCustomId(type.root);
                    buttons.push(button);
                });

                if (buttons.length > 0) {
                    rows.push(new Discord.ActionRowBuilder().addComponents(...buttons));
                    rows.push(new Discord.ActionRowBuilder().addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('report')
                            .setLabel("⚠️ Report Link")
                            .setStyle(Discord.ButtonStyle.Danger)
                    ));
                }
                interaction.reply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setTitle('Dispenser')
                            .setDescription('Click the buttons below to dispense items.')
                            .setFooter({
                                text: "Shadow Dispenser",
                                iconURL: client.user.displayAvatarURL(),
                            })
                            .setColor("#0e011a"),
                    ],
                    components: rows,
                });
            } catch (error) {
                console.error('Error parsing JSON file:', error);
            }
        });
    }
};
