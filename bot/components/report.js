import Discord from 'discord.js';

const report = {
    id: 'report',
    async run(client, interaction) {
        try {
            const modal = new Discord.ModalBuilder()
                .setCustomId('reportModal')
                .setTitle('Report A Link');
            const Link = new Discord.TextInputBuilder()
                .setCustomId('Link')
                .setLabel("Link")
                .setStyle(Discord.TextInputStyle.Short);

            const Error = new Discord.TextInputBuilder()
                .setCustomId('Error')
                .setLabel("Error")
                .setStyle(Discord.TextInputStyle.Short);

            const firstActionRow = new Discord.ActionRowBuilder().addComponents(Link);
            const secondActionRow = new Discord.ActionRowBuilder().addComponents(Error);

            modal.addComponents(firstActionRow, secondActionRow);
            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error handling "report" button:', error);
        }
    }
};

export default report;

