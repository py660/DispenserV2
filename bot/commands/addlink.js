import Discord from 'discord.js';
import fs from 'fs';
import Link from '../models/linkSchema.js';
import { config } from 'dotenv';
config();

const getChoices = async () => {
    try {
        const typesData = await fs.promises.readFile('./bot/types.json', 'utf8');
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
        .setName('addlink')
        .setDescription('Add a link to the database')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL to be added')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Select the type of the link')
                .setRequired(true)
                .addChoices(...choices)),
    async handler(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        let url = interaction.options.getString('url');
        let type = interaction.options.getString('type');

        url = url.replace(/^https?:\/\//i, '');
        url = url.replace(/\/$/, '');

        try {
            const typesData = await fs.promises.readFile('./bot/types.json', 'utf8');
            const types = JSON.parse(typesData);

            type = types.find(t => t.root === type);

            const findExistingLink = await Link.findOne({ url, type: type.root });
            if (findExistingLink) {
                await interaction.editReply('This link already exists in the database');
                return;
            }

            await Link.create({ url, type: type.root });

            await interaction.editReply(`Link has been successfully added!\n**Link:** \`${url}\` \n**Type:** \`${type.name}\``);

        } catch (error) {
            console.error('Error processing request:', error);
            await interaction.editReply('An error occurred while processing your request.');
        }
    }
};
