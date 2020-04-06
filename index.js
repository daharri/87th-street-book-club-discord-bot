const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs')

require('dotenv').config()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", async msg => {
  const messageText = msg.content
  if (messageText === "ping") {
    msg.reply("Pong!")
  } else if (messageText.includes('__addBook')) {
      // This removes the __add command from the message
      const bookTitle = messageText.replace(/^__addBook/i, '')
      fs.appendFile('books.txt', bookTitle  + ',', (err) => {
        if (err) {
          console.log(err)
          throw err
        }
      })
      msg.reply(`Added the book - ${bookTitle} `)
  } else if (messageText.includes('__showBooks')) {
      const books = await fs.readFileSync('books.txt').toString().split(',')
      msg.reply(`All Books ${books.map(book => book).slice(0, books.length - 1)}`)
  } else if (messageText.includes('__commands')) {
      msg.reply('__addBook, __showBooks')
  }
})

client.login(process.env.DISCORD_TOKEN)