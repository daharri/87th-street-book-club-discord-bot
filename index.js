const Discord = require('discord.js')
const client = new Discord.Client()
const { readMessage } = require('./clients/discordClient')
const { authorizedChannels, authorizedDevChannels } = require('./savedData/settings.json')
// Bens a bitch sd,jasdjhksahdlsadb,cmnb,ZBc.d

require('dotenv').config()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  require('./crons/scheduledTasks').start(client)
})

client.on("message", async msg => {
  const environment = process.env.NODE_ENV
  if ((environment === 'production' && authorizedChannels.includes(msg.channel.id)) || (environment === 'development' && authorizedDevChannels.includes(msg.channel.id))) {
    await readMessage(msg)
  }
})

client.login(process.env.DISCORD_TOKEN)