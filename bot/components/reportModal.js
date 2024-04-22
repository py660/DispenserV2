import Discord from 'discord.js';
import { config } from 'dotenv';
config();

const reportModal = {
    id: 'reportModal',
    async run(client, interaction) {
        try {
            interaction.reply({ content: "Link Reported!", ephemeral: true });
            const link = interaction.fields.getTextInputValue('Link');
            const error = interaction.fields.getTextInputValue('Error');
            const user = interaction.user;
            const footertext = `Reported by: ${user.tag}`;

            const reportEmbed = new Discord.EmbedBuilder()
                .setColor(15548997)
                .setTitle('Link Reported!')
                .setDescription('A link has been reported. Please try to fix this link ASAP or remove it from the dispenser.')
                .addFields(
                    { name: 'Link', value: link, inline: false },
                    { name: 'Error', value: error, inline: false }
                )
                .setFooter({
                    text: footertext,
                    iconURL: user.displayAvatarURL(),
                });

            const channelreport = await interaction.client.channels.fetch(`${process.env.REPORT_CHANNEL}`);
            channelreport.send({ embeds: [reportEmbed] });
        } catch (error) {
            console.error('Error handling "report" Modal:', error);
        }
    },
};

export default reportModal;