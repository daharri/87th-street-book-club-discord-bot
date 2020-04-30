const fs = require('fs')
const relativeTime = require('dayjs/plugin/relativeTime')
const dayjs = require('dayjs').extend(relativeTime)
const { isISBN, embedMessage } = require('../utils/utils')
const { ADD_BOOK, SHOW_BOOKS, CURRENT_BOOK, HELP, COMMANDS } = require('../constants');

const bookClubInfoFileLocation = 'savedData/bookClubInfo.json'
const bookClubInfo = require(`../${bookClubInfoFileLocation}`)
const selectedBook = require('../savedData/selectedBook.json')

function addBook (message) {
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
      return console.error(err)
    }
  });

  const bookInfo = [
    {
      name: 'Message Received',
      value: message
    },
    {
      name: 'Title',
      value: bookTitle,
      inline: true
    },
    {
      name: 'Author',
      value: bookAuthor || 'N/A',
      inline: true
    },
    {
      name: 'ISBN',
      value: bookISBN || 'N/A',
      inline: true
    }
  ]

  return embedMessage({
    title: 'New Book Added!',
    description: 'Below is the information that was generated for your book',
    fields: [...bookInfo]
  });
}

function getCurrentBook () {
  const today = dayjs();
  const timeLeft = today.to(dayjs(selectedBook.endDate));
  const bookInfo = [
    {
      name: selectedBook.title,
      value: selectedBook.author || ''
    },
    {
      name: 'Time Remaining',
      value: `Time expires ${timeLeft}`
    },
    {
      name: 'Goodreads',
      value: 'info coming soon'
    },
    {
      name: 'Buy',
      value: selectedBook.purchaseLink
    }
  ]

  return embedMessage({
    title: 'Current Book',
    description: 'Information about the current book',
    thumbnail: selectedBook.goodreads.thumbnail,
    fields: [...bookInfo]
  });
}

function getBooks () {
  const bookInfo = bookClubInfo.suggestedBooks.map(book => {
    return {
      name: book.title,
      value: `${book.author || 'No Author'} \n ${book.ISBN || ''} `,
      inline: true
    }
  })
  
  return embedMessage({
    title: 'Suggested Books',
    description: 'Below is a list of suggested books provided by book club members',
    fields: [...bookInfo]
  });
}

function getCommandsMessage () {
  const commands = [
    {
      name: CURRENT_BOOK,
      value: 'This command will show details of the current book',
      inline: true
    },
    {
      name: SHOW_BOOKS,
      value: 'This command will list all books suggested by club members',
      inline: true
    },
    {
      name: ADD_BOOK,
      value: 'This command will add a book to the list of suggested books',
      inline: true
    },
    {
      name: COMMANDS,
      value: 'This command will list all available commands'
    },
    {
      name: HELP,
      value: 'This command provide you with useful information for interacting with the librarian'    },
  ];
  return embedMessage({
    title: 'Commands',
    description: 'Below you will find a list of useful commands',
    fields: [...commands]
  });
}

function getHelpMessage () {
  const helpInfo = [
    {
      name: 'Info',
      value: 'To find a list of commands, type `.commands`'
    },
    {
      name: 'Creators',
      value: 'Darius Harrison / Ben Shkalikov'
    },
    {
      name: 'Contribute',
      value: 'Code Repository: https://github.com/daharri/87th-street-book-club-discord-bot'
    },
    {
      name: 'Feedback',
      value: 'Issues: https://github.com/daharri/87th-street-book-club-discord-bot/issues/new'
    }
  ];

  return embedMessage({
    title: 'How To Use',
    description: 'Below you will find useful information for interacting with the librarian',
    fields: [...helpInfo]
  });
}

module.exports = {
  addBook,
  getBooks,
  getCurrentBook,
  getHelpMessage,
  getCommandsMessage
}