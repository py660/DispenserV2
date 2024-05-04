import Discord from 'discord.js';
import Link from '../models/linkSchema.js';
import { config } from 'dotenv';
import fs from 'fs/promises';

config();

const getChoices = async () => {
    try {
        const typesData = await fs.readFile('./bot/types.json', 'utf8');
        const types = JSON.parse(typesData);
        return types.map(type => ({
            name: type.name,
            value: type.root
        }));
    } catch (error) {
        console.error('Error reading types.json:', error);
        return [];
    }
};

const choices = await getChoices();

export default {
    meta: new Discord.SlashCommandBuilder()
        .setName('getlinks')
        .setDescription('Get links from the database')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of links to retrieve (1-10)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Select the type of the link')
                .setRequired(false)
                .addChoices(...choices)),
    async handler(interaction, client) {
        if (!interaction.isCommand()) return;

        await interaction.deferReply({ ephemeral: true });

        const count = interaction.options.getInteger('count');
        let type = interaction.options.getString('type');
        
        if (!type) {
            type = 'all';
        }

        try {
            let query = {};

            if (type !== 'all') {
                query = { type };
            }

            const links = await Link.aggregate([
                { $match: query },
                { $sample: { size: count } }
            ]);

            if (links.length === 0) {
                await interaction.editReply('No links found matching the criteria.');
                return;
            }

            const linkText = links.map(link => `${link.url}`).join('\n');
            const attachment = new Discord.AttachmentBuilder(Buffer.from(linkText), { name: 'links.txt' });
            await interaction.editReply({
                content: `**Success:** Retrieved ${links.length} link(s) with type ${type}.`,
                files: [attachment],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error processing request:', error);
            await interaction.editReply('An error occurred while processing your request.');
        }
    }
};
