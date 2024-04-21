import fs from 'fs';
import path from 'path';
import Link from './models/linkSchema.js';

const typesFile = new URL('./types.json', import.meta.url).pathname;
const cooldowns = new Map();

const dispense = async (interaction) => {
    const customId = interaction.customId;
    const userId = interaction.user.id;

    const typesData = fs.readFileSync(typesFile, 'utf8');
    const types = JSON.parse(typesData);

    const type = types.find(type => type.root === customId);
    if (!type) {
        await interaction.reply(`Type with root ${customId} not found.`);
        return;
    }

    const lastDispense = cooldowns.get(userId) || 0;
    const cooldownTime = type.cooldown * 1000;

    const cooldownPassed = Date.now() - lastDispense;
    const timeLeft = Math.max(0, cooldownTime - cooldownPassed);

    if (timeLeft > 0) {
        const minutesLeft = Math.ceil(timeLeft / (1000 * 60));
        await interaction.reply(`User is on cooldown for type ${type.name}. Time left: ${minutesLeft} minutes.`);
        return;
    }

    if (type.role && !interaction.member.roles.cache.has(type.role)) {
        await interaction.reply(`You don't have the required role (${type.role}) to use this button.`);
        return;
    }

    let links;
    try {
        links = await Link.find({
            type: type.root,
            users: {
                $ne: userId
            }
        });
    } catch (error) {
        console.error('Error finding links:', error);
        await interaction.reply('An error occurred while finding links.');
        return;
    }

    if (!links || links.length === 0) {
        await interaction.reply(`No available links found for type ${type.name}.`);
        return;
    }

    const random = Math.floor(Math.random() * links.length);
    const link = links[random];

    cooldowns.set(userId, Date.now());

    await Link.findByIdAndUpdate(link._id, { $push: { users: userId } });

    await interaction.reply({
        content: `Here is the ${type.name} link: ${link.url}`,
        ephemeral: true
    });
};

export default dispense;