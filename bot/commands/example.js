import Discord from 'discord.js';

export default {
    meta: new Discord.SlashCommandBuilder()
        .setName('example'),
    /**
     * @param {Discord.Interaction} interaction 
     * @param {Discord.Client} client
     */
    async command(interaction, client) {
        await interaction.reply('yay it works!');
    }
};