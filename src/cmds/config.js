const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, UserSelectMenuBuilder } = require("discord.js");
const config = require("../data/config.json");
const { exec } = require('child_process');
const fs = require("fs").promises;
const path = require("path");

var langConf = config.lang;
const l = require(`../lang/${langConf}.json`);
const embeds = require(`../data/embedSettings.json`);

module.exports = {
    category: "general",
    data: new SlashCommandBuilder()
        .setName("config")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDescription("change settings in the bot")
        .addStringOption(option =>
            option.setName("language")
                .addChoices(
                    { name: "English", value: "en" },
                    { name: "German/Deutsch (DE)", value: "de" },
                    { name: "Dutch/Nederlands (NL)", value: "nl" },
                    { name: "Limburgs (NL-LI)", value: "nl_li" },
                    { name: "Brabants (NL-BR)", value: "nl_br" },
                    { name: "Flemish/Vlaams (BE-VL)", value: "be_vl" },
                    { name: "Ukrainian/Українська (UKR)", value: "ukr" },
                    { name: "French/Français (FR)", value: "fr" },
                    { name: "Polish/Polski (PL)", value: "pl" }
                )
                .setDescription("set the language of the bot (selection)")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("settings")
                .addChoices(
                    { name: "View", value: "view" },
                    { name: "Kernelupdate", value: "update" },
                    { name: "Healthcheck", value: "check" },
                    { name: "Reload", value: "reload" },
                )
                .setDescription("set the repository of the bot (selection)")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("repository")
                .addChoices(
                    { name: "[OMM19] Extra (MFM exclusive)", value: "19ext" },
                    { name: "[OMM18] Stable", value: "stable" },
                    { name: "[OMM18] Beta", value: "beta" },
                    { name: "[OMM18] Extra", value: "ext" },
                )
                .setDescription("set the repository of the bot (selection)")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("repository-key")
                .setDescription("enter the key that is required to active exclusive repositories. (text)")
                .setRequired(false))
        .addChannelOption(option =>
            option.setName(`suggestions`)
                .setDescription(`set the suggestionschannel (id)`)
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText))
        .addChannelOption(option =>
            option.setName(`reviews`)
                .setDescription(`set the reviewchannel (id)`)
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText))
        .addChannelOption(option =>
            option.setName(`logs`)
                .setDescription(`set the logging channel (name)`)
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText))
        .addChannelOption(option =>
            option.setName(`supportcategory`)
                .setDescription(`support-ticket category (id)`)
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildCategory))
        .addRoleOption(option =>
            option.setName(`supportrole`)
                .setDescription(`default support role that will be used for the tickets (id)`)
                .setRequired(false))
        .addRoleOption(option =>
            option.setName(`joinrole`)
                .setDescription(`role that has been given at join (id)`)
                .setRequired(false))
        .addChannelOption(option =>
            option.setName(`welcomechannel`)
                .setDescription(`channel that the welcome message gets send to (id)`)
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText))
        .addStringOption(option =>
            option.setName(`guildname`)
                .setDescription(`guildname (name)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor-unknownerror`)
                .setDescription(`'Unknown Error' colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor-success`)
                .setDescription(`'Success' colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor-suggestion`)
                .setDescription(`'suggestion' colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor-fivestar`)
                .setDescription(`'5 star review' colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor-fourstar`)
                .setDescription(`'4 star review' colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor-threestar`)
                .setDescription(`'3 star review' colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor-twostar`)
                .setDescription(`'2 star review' colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor-onestar`)
                .setDescription(`'1 star review' colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor-nostar`)
                .setDescription(`'No star review' colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor-updatelogs`)
                .setDescription(`'Updatelogs' colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`embedcolor`)
                .setDescription(`Default colorcode (hex)`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`joinmessage`)
                .setDescription(`Message under the welcome to message at welcoming (text)`)
                .setRequired(false)),

    async execute(client, interaction) {

        const selectedVersion = interaction.options.getString(l.repository);
        const key = interaction.options.getString("repository-key")
        const usrSelectInfo = interaction.options.getString("settings")
        langName = "";

        if (config.lang == "en") langName = "English (EN)";
        if (config.lang == "nl") langName = "Nederlands (Dutch/NL)";
        if (config.lang == "nl_li") langName = "Limburgs\n (Dialect of Limburg, Dutch/NL-LI)";
        if (config.lang == "de") langName = "Deutsch (German/DE)";
        if (config.lang == "be_vl") langName = "Vlaams (Belgium/BE-VL)";
        if (config.lang == "nl_br") langName = "Brabants\n (Dialect of Noord-Brabant, Dutch/NL-BR)";
        if (config.lang == "ukr") langName = "Українська (Ukraine/UKR)";
        if (config.lang == "fr") langName = "Français (French/FR)";
        if (config.lang == "pl") langName = "Polish (Poland/PL)";

        let infoEmbed = new EmbedBuilder()
            .setTitle("Information of `" + client.user.username + "` in ***" + config.guildName + "***")
            .addFields(
                { name: `Language`, value: langName, inline: true },
                { name: `Suggestions are being sent to`, value: `<#${config.suggestChannel}>`, inline: true },
                { name: `Reviews are being sent to`, value: `<#${config.reviewChannel}>`, inline: true },
                { name: `Logs are being sent to`, value: `<#${config.logging}>`, inline: true },
                { name: `Tickets will be made at the category`, value: `<#${config.ticketCat}>`, inline: true },
                { name: `Permissions in tickets will be granted to`, value: `@${config.supportRole}`, inline: true },
                { name: `New members will get the role`, value: `@${config.joinRole}`, inline: true },
                { name: `New members will be welcomed with an message in`, value: `<#${config.welcomeChannel}>`, inline: true },
                { name: `The bot will know this server as`, value: config.guildName, inline: true },
                { name: config.guildName + `'s serverid is`, value: config.guild, inline: true },
                { name: client.user.username + `'s id is`, value: config.id, inline: true },
            )
            .setFooter({ text: config.footer })
            .setColor(embeds.color.default)
            .setTimestamp()

        //if (usrSelectInfo == "view") interaction.reply({embeds: [infoEmbed], ephemeral: true});
        //if (usrSelectInfo == "reload") exec('bash reboot.sh');

        let repositoryUrl = "";
        let versionName = "";
        if (selectedVersion === "stable") {
            repositoryUrl = "https://github.com/OMMediaGroupFileRepos/OMM18";
            versionName = l.stable;
        } else if (selectedVersion === "beta") {
            repositoryUrl = "https://github.com/OMMediaGroupFileRepos/OMM18BETA";
            versionName = l.beta;
        } else if (selectedVersion === "extra") {
            repositoryUrl = "https://github.com/OMMediaGroupFileRepos/OMM18BETA";
            versionName = l.extra;
        } else if (selectedVersion === "ext19a" && !key ) {
            return interaction.reply({ content: "```Sorry, but this repository requires key verification.```", ephemeral: true })
        } else if (selectedVersion === "ext19a" && key !== "!" ) {
            return interaction.reply({ content: "```Sorry, but the key you entered is invalid, this repository requires an valid key to grant access to updates.```", ephemeral: true })
        } else if (selectedVersion === "ext19a" && key === "!") {
            repositoryUrl = "https://github.com/OMMediaGroupFileRepos/OMM19EXTRA-MFM24";
            versionName = "OMM19 EXTRA (Exclusive version for MikaFM)";
            return interaction.reply({ content: "```Sorry, but it seems like the connection to the updateserver is not available, maybe it's overloaded or offline?```", ephemeral: true })
        }

        let embed = new EmbedBuilder()
            .setTitle(l.repoChanged + versionName)
            .setDescription(l.updateBotRepo)
            .addFields(
                { name: l.completeMigration, value: "```/update```" }
            )
            .setFooter({ text: config.footer })
            .setColor(embeds.color.success)
            .setTimestamp();

        let channel = client.channels.cache.get(config.suggestChannel);
        //var ticketChannel = interaction.member.guild.channels.cache.find(channel => channel.name == config.logging);

        if (!channel) interaction.reply("```diff\n- " + l.logsDoNotExist + "\n```");

        if (selectedVersion) channel.send({ embeds: [embed] })

        // send repo changed embed to logs

        const prevLang = config.lang;
        const prevSug = config.suggestChannel;
        const prevRev = config.reviewChannel;
        const prevLog = config.logging;
        const prevTicket = config.ticketCat;
        const prevSupportRole = config.supportRole;
        const prevJoinRole = config.joinRole;
        const prevWelChannel = config.welcomeChannel;
        const prevGuildName = config.guildName;
        const prevJoinMsg = config.joinMsg;

        const newLang = interaction.options.getString("language") || prevLang;
        const newSug = interaction.options.getChannel("suggestions")?.id || prevSug;
        const newRev = interaction.options.getChannel("reviews")?.id || prevRev;
        const newLog = interaction.options.getChannel("logs")?.id || prevLog;
        const newTicket = interaction.options.getChannel("supportcategory")?.id || prevTicket;
        const newSupportRole = interaction.options.getRole("supportrole")?.name || prevSupportRole;
        const newJoinRole = interaction.options.getRole("joinrole")?.id || prevJoinRole;
        const newWelChannel = interaction.options.getChannel("welcomechannel")?.id || prevWelChannel;
        const newGuildName = interaction.options.getString("guildname") || prevGuildName;
        const newJoinMsg = interaction.options.getString("joinmessage") || prevJoinMsg;

        config.lang = newLang;
        config.suggestChannel = newSug;
        config.reviewChannel = newRev;
        config.logging = newLog;
        config.ticketCat = newTicket;
        config.supportRole = newSupportRole;
        config.joinRole = newJoinRole;
        config.welcomeChannel = newWelChannel;
        config.guildName = newGuildName;
        config.joinMsg = newJoinMsg;

        const configPath = path.join(__dirname, '../data/config.json');
        try {
            await fs.writeFile(configPath, JSON.stringify(config, null, 4), 'utf8');
        } catch (error) {
            console.error('Fout bij het bijwerken van configuratie:', error);
        }

        const prevUnknownErr = embeds.color.unknownError;
        const prevSuccess = embeds.color.success;
        const prevSuggest = embeds.color.suggestion;
        const prevRevA = embeds.color.revA;
        const prevRevB = embeds.color.revB;
        const prevRevC = embeds.color.revC;
        const prevRevD = embeds.color.revD;
        const prevRevE = embeds.color.revE;
        const prevDefaultColor = embeds.color.default;

        const newUnknownErr = interaction.options.getString("embedcolor-unknownerror") || prevUnknownErr;
        const newSuccess = interaction.options.getChannel("embedcolor-success")?.id || prevSuccess;
        const newSuggest = interaction.options.getChannel("embedcolor-suggestion")?.id || prevSuggest;
        const newRevA = interaction.options.getChannel("embedcolor-fivestar")?.id || prevRevA;
        const newRevB = interaction.options.getChannel("embedcolor-fourstar")?.id || prevRevB;
        const newRevC = interaction.options.getRole("embedcolor-threestar")?.name || prevRevC;
        const newRevD = interaction.options.getRole("embedcolor-twostar")?.name || prevRevD;
        const newRevE = interaction.options.getChannel("embedcolor-onestar")?.id || prevRevE;
        const newDefaultColor = interaction.options.getString("embedcolor") || prevDefaultColor;

        embeds.color.unknownError = newUnknownErr;
        embeds.color.success = newSuccess;
        embeds.color.suggestion = newSuggest;
        embeds.color.revA = newRevA;
        embeds.color.revB = newRevB;
        embeds.color.revC = newRevC;
        embeds.color.revD = newRevD;
        embeds.color.revE = newRevE;
        embeds.color.default = newDefaultColor;

        const embedColorPath = path.join(__dirname, '../data/embedSettings.json');
        try {
            await fs.writeFile(embedColorPath, JSON.stringify(embeds, null, 4), 'utf8');
        } catch (error) {
            console.error('Fout bij het bijwerken van configuratie:', error);
        }

        let updateEmbed = new EmbedBuilder()
            .setTitle("**Updating the bot...**\n** **\n")
            .setDescription("**`Execute the command below to see what's new!`**\n```/updatelogs update:Latest```\n** **\n*NOTE!*\n**The bot will check for changes and restarts, it might not change anything if there are no changes, we recommend you to follow our updates we announce them.\n\n**Note! if you run the beta version of OMM18, you might not see any new updatelogs until a new stable release**\n** **\n")
            .setFooter({ text: config.footer })
            .setColor(embeds.color.success)
            .setTimestamp()

        const { exec } = require('child_process');

        // Kleuremoji's voor statusberichten
        const emojis = {
            upToDate: '🟩',      // Groen
            updatesAvailable: '🟨', // Geel
            updatesUrgent: '🟧',    // Oranje
            endOfLifeSoon: '🟥',   // Rood
            endOfLife: '⬛'        // Zwart
        };

        // Voer het Git-commando uit om het aantal commits op de main-branch op te halen
        exec('git fetch origin && git rev-list --count origin', (error, stdout, stderr) => {
            if (error) {
                console.error('Error:', error);
                return;
            }

            // Parse de uitvoer naar een integer
            const commitCount = parseInt(stdout.trim(), 10);

            // Simuleer de end-of-life-status
            const soonEndOfLife = false;
            const endOfLife = false;

            // Variabelen voor emoji en beschrijving
            let emoji = '';
            let description = '';

            // Controleer end-of-life-status en stel bijbehorende emoji en beschrijving in
            if (endOfLife) {
                // ... (vervolg van je code)
            } else if (soonEndOfLife) {
                // ... (vervolg van je code)
            } else {
                if (commitCount === 0) {
                    emoji = emojis.upToDate;
                    description = 'Bot is up-to-date.';
                } else if (commitCount === 1) {
                    emoji = emojis.updatesAvailable;
                    description = 'There is 1 update available.';
                } else if (commitCount > 1 && commitCount <= 30) {
                    emoji = emojis.updatesAvailable;
                    description = `There are ${commitCount} updates available.`;
                } else if (commitCount > 30 && commitCount < 40) {
                    emoji = emojis.updatesUrgent;
                    description = `There are ${commitCount} updates available.`;
                } else if (commitCount >= 40) {
                    emoji = emojis.updatesUrgent;
                    description = `There are ${commitCount} updates available. We recommend updating as soon as possible.`;
                }
            }

            // Hier kun je de emoji en description variabelen gebruiken om het Embed-object te maken
            const healthCheckEmbed = new EmbedBuilder()
                .setTitle(`${client.user.username}'s status`)
                .setDescription(`# ${emoji} ${description}`)
                .setFooter({ text: config.footer })
                .setColor(embeds.color.default)
                .setTimestamp();

            //if (usrSelectInfo == "check") interaction.reply({ embeds: [healthCheckEmbed], ephemeral: true });



            if (usrSelectInfo == "check") interaction.reply({ embeds: [healthCheckEmbed], ephemeral: true });
        });
        if (usrSelectInfo == "view") interaction.reply({ embeds: [infoEmbed], ephemeral: true });
        if (usrSelectInfo == "update") interaction.reply({ embeds: [updateEmbed], ephemeral: true }).then(
            exec('bash update.sh')
        )
        if (usrSelectInfo == "reload") interaction.reply({ content: `\`\`\`Restarting...\`\`\``, ephemeral: true }).then(
            exec('bash reboot.sh')
        )
        if (!usrSelectInfo) interaction.reply({ content: `\`\`\`diff\n+ Done!\`\`\``, ephemeral: true });
    },
};
