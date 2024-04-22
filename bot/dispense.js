import fs from 'fs';
import path from 'path';
import Link from './models/linkSchema.js';
import Discord from 'discord.js';
import { config } from 'dotenv';
config();

const typesFile = new URL('./types.json', import.meta.url).pathname;
const cooldowns = new Map();

const dispense = async (client, interaction) => {
    const customId = interaction.customId;
    const userId = interaction.user.id;

    const formatCooldown = (cooldown) => {
        const hours = Math.floor(cooldown / (1000 * 60 * 60));
        const minutes = Math.floor((cooldown % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((cooldown % (1000 * 60)) / 1000);

        let formattedCooldown = '';
        if (hours > 0) {
            formattedCooldown += `${hours}h `;
        }
        if (minutes > 0) {
            formattedCooldown += `${minutes}m `;
        }
        if (seconds > 0) {
            formattedCooldown += `${seconds}s`;
        }

        return formattedCooldown.trim();
    };

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
    const DateforNext = Math.floor((Date.now() + timeLeft) / 1000);


    if (timeLeft > 0) {
        await interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("User Cooldown")
                    .setDescription("Please wait for: `" + formatCooldown(timeLeft) + "`\n Next Dispense is available at: " + `<t:${DateforNext}>`)
                    .setFooter({
                        text: "Shadow Dispenser",
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setColor("#ff0000"),
            ], ephemeral: true
        });
        return;
    }

    if (type.role && !interaction.member.roles.cache.has(type.role)) {
        await interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("I couldn't provide you with a link")
                    .setDescription(`The role <@&${type.role}> is required to dispense from this category.`)
                    .setFooter({
                        text: "Shadow Dispenser",
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setColor("#ff0000"),
            ], ephemeral: true
        });
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
        await interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("I couldn't provide you with a link")
                    .setDescription("No more links are available in the `" + type.name + "` category")
                    .setFooter({
                        text: "Shadow Dispenser",
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setColor("#ff0000"),
            ], ephemeral: true
        });
        return;
    }

    const random = Math.floor(Math.random() * links.length);
    const link = links[random];

    cooldowns.set(userId, Date.now());

    await Link.findByIdAndUpdate(link._id, { $push: { users: userId } });

    const dm = await interaction.user.createDM();
    const message = await dm.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle("Proxy Request")
                .setDescription("Enjoy your site!\n Link: `" + link.url + "`")
                .addFields(
                    { name: 'Cooldown', value: `${formatCooldown(type.cooldown * 1000)}` }
                )
                .setFooter({
                    text: "Shadow Dispenser",
                    iconURL: client.user.displayAvatarURL(),
                })
                .setColor("#0e011a"),
        ]
    });
    await interaction.reply({
        content: `Check your DMs. [[Jump to Message]](${message.url})`,
        ephemeral: true
    });

    const webhookUrl = process.env.LOG_WEBHOOK_URL;
    if (webhookUrl && webhookUrl.trim() !== '') {
        const webhookClient = new Discord.WebhookClient({ url: webhookUrl });
        webhookClient.send({
            username: 'Dispenser Logs',
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("Domain Dispensed!")
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                    .setColor("#0e011a")
                    .addFields(
                        { name: 'Link', value: "```" + `${link.url}` + "```" },
                        { name: 'Type', value: "```" + type.name + "```" }
                    )
            ],
        });
    }


};

export default dispense;