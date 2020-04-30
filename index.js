const Discord = require('discord.js')
const client = new Discord.Client()
const { readMessage } = require('./clients/discordClient')

require('dotenv').config()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  require('./crons/scheduledTasks').start(client)
})

client.on("message", async msg => {
  const environment = process.env.NODE_ENV
  if (environment === 'production' || (environment === 'development' && msg.channel.id === '696569704415887373')) {
    await readMessage(msg)
  }
})

client.login(process.env.DISCORD_TOKEN)