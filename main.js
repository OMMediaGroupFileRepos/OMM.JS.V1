const { Client, GatewayIntentBits, Collection, Routes, EmbedBuilder } = require("discord.js");
const { REST } = require("@discordjs/rest");
const path = require("node:path");
const fs = require("node:fs");
const pkg = require("./package.json");

const config = require("./src/data/config.json");
const clientData = require("../data/clients.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
const cmds = [];

let clientName = config.client;
var token = clientData[clientName];

var langConf = config.lang;
const l = require(`./src/lang/${langConf}.json`);

client.once("ready", () => {

    console.log(`-- ${pkg.LTSCodename} --`);
    console.log(`-- ${pkg.version} --`);
    console.log(`-=- ${client.user.tag} -=-`);

    let guild = config.guild;
    let id = config.id;

    const rest = new REST({ version: 10 }).setToken(token);
    rest.put(Routes.applicationGuildCommands(id, guild), { body: cmds })
        .then(() => console.log(`[DONE] registered slash commands`))
        .catch(console.error);

});

const cmdsPath = path.join(__dirname, "src/cmds");
const files = fs.readdirSync("./src/cmds/").filter(file => file.endsWith(".js"));

for (const file of files) {
    const filePath = path.join(cmdsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
    cmds.push(command.data.toJSON());

    console.log(`[LOADED] ${command.data.name}`);

}

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName)

    if (!command) return;

    try {
        await command.execute(client, interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "```" + l.defaultErrorMessage + "``", ephemeral: true });
    }
});

client.on("guildMemberAdd", member => {

    let welcomeEmbed = new EmbedBuilder()
    .setTitle(`${l.welcomeMsg_1}`)
            .setDescription(`${l.welcomeMsg_2} ${config.guildName} ${member}***!***\n${l.welcomeMsg_3}`)
            .setFooter({ text: config.footer })
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setTimestamp();
    var role = member.guild.roles.cache.get("1087804908880801912");

    if (!role) console.log(`Het id ${role} bestaat niet...`);

    member.roles.add(role);

    var channel = member.guild.channels.cache.get("1089130774009229342");

    if (!channel) console.log(`Het kanaalid ${channel} bestaat niet...`);

    channel.send({ embeds: [welcomeEmbed] })

});

client.login(token);