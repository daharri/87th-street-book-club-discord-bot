const Discord = require('discord.js')
const client = new Discord.Client()
const { Player } = require("discord-music-player");
const player = new Player(client, {
  leaveOnEmpty: true,
  leaveOnStop: true,
  leaveOnEnd: false,
  timeout: 15000,
  quality: 'high',
});
client.player = player;

client.on("ready", () => {
    console.log("I am ready to Play with DMP 🎶");
});
const { readMessage } = require('./clients/discordClient')
const { authorizedChannels, authorizedDevChannels } = require('./savedData/settings.json')

require('dotenv').config()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  require('./crons/scheduledTasks').start(client)
})

client.on("message", async msg => {
  const environment = process.env.NODE_ENV
  if ((environment === 'production' && authorizedChannels.includes(msg.channel.id)) || (environment === 'development' && authorizedDevChannels.includes(msg.channel.id))) {
    await readMessage(msg, client)
  }

})

client.login(process.env.DISCORD_TOKEN)