const fs = require('fs')
const { ADD_BOOK, SHOW_BOOKS, CURRENT_BOOK } = require('../constants')
const { isISBN } = require('../utils/utils')

const bookClubInfoFileLocation = 'savedData/bookClubInfo.json'
const bookClubInfo = require(`../${bookClubInfoFileLocation}`)
const selectedBook = require('../savedData/selectedBook.json')

async function readMessage(msg) {
  const messageText = msg.content
  if (messageText === "ping") {

    msg.reply("Pong!")
  } else if (messageText.startsWith(ADD_BOOK)) {
      const message = messageText.replace(/^.addBook/i, '')
      let bookISBN = message.split(' ').filter(text => isISBN(text))[0]
      let bookAuthor = message.split(/(?<= |^)by(?= |$)/gi)[1]
      let bookTitle = message.split(/(?<= |^)by(?= |$)/gi)[0]

      if (bookISBN && bookAuthor) {
        bookAuthor = bookAuthor.replace(bookISBN, '')
      } else if (bookISBN && (bookTitle.trim() === bookISBN.trim())) {
        bookTitle = undefined
      }

      bookClubInfo.suggestedBooks.push({
        title: bookTitle ? bookTitle.trim() : bookTitle,
        author: bookAuthor ? bookAuthor.trim() : bookAuthor,
        ISBN: bookISBN ? bookISBN.trim() : bookISBN
      })
      fs.writeFile(bookClubInfoFileLocation, JSON.stringify(bookClubInfo), (err) => {
        if (err) {
          return console.log(err)
        }
      })
      msg.reply(`Added the book - ${message} `)
  } else if (messageText.startsWith(SHOW_BOOKS)) {
      const books = bookClubInfo.suggestedBooks
      msg.reply(`\n${books.map(book => JSON.stringify(book))}`)
  } else if (messageText.startsWith(CURRENT_BOOK)) { 
    msg.reply(`${selectedBook.title} by ${selectedBook.author}`)
  } else if (messageText.startsWith('.commands') || messageText.startsWith('.help')) {
      
      msg.reply(`\nHere is a list of useful commands: 
      \n\`${CURRENT_BOOK} - This command will show details of the current book\` 
      \n\`${SHOW_BOOKS} - This command will list all books suggested by club members\` 
      \n\`${ADD_BOOK} - This command will add a book to the list of suggested books\``)
  }
}

module.exports = {
  readMessage
}

