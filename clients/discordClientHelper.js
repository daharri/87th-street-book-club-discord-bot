const fs = require('fs')
const relativeTime = require('dayjs/plugin/relativeTime')
const dayjs = require('dayjs').extend(relativeTime)
const { isISBN, embedMessage } = require('../utils/utils')
const { ADD_BOOK, SHOW_BOOKS, CURRENT_BOOK, HELP, COMMANDS, DELETE_BOOK, random_book, roll } = require('../constants');

const bookClubInfoFileLocation = 'savedData/bookClubInfo.json'
const bookClubInfo = require(`../${bookClubInfoFileLocation}`)
const selectedBook = require('../savedData/selectedBook.json')
const discordFileLocation = 'savedData/discord.json'
const discordInfo = require(`../${discordFileLocation}`)

function addBook(message) {
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

function randomize() {
  var listofbooks = bookClubInfo.suggestedBooks;
  var randomItem = listofbooks[Math.floor(Math.random() * listofbooks.length)];
  return ('The next book is ' + randomItem.title)
}


function getCurrentBook() {
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

function getBooks() {
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

async function deleteBook(bookIndex, deleteMessage) {
  const updatedList = [];
  let deletedBook;
  bookClubInfo.suggestedBooks.forEach((book, index) => {
    if (index === bookIndex) {
      deletedBook = book;
    } else {
      updatedList.push(book);
    }
  }, []);
  bookClubInfo.suggestedBooks = updatedList;

  await fs.writeFileSync(bookClubInfoFileLocation, JSON.stringify(bookClubInfo), err => {
    if (err) {
      console.error(err);
    }
  })

  deleteMessage.edit(embedMessage({
    title: 'Book Deleted!',
    description: 'The selected book has been removed',
    fields: [{ name: deletedBook.title, value: deletedBook.author }]
  }))
}

function getExtensionTime (messageText) {
  const extensionTime = messageText.split(' ').find(string => {
    return isNaN(string) === false;
  });
  const extensionTimeUnit = messageText.split(' ').find(string => {
    if (discordInfo.timeUnits.includes(string.toLowerCase())) {
      return true;
    }
  });

  return { extensionTime, extensionTimeUnit };
}

async function extendTime (msg) {
  const { extensionTime, extensionTimeUnit } = getExtensionTime(msg.content);
  if (!extensionTime || !extensionTimeUnit) {
    msg.reply(`\n Error: Please specify a number and a time unit (days, month, years, etc) \n ex: .extendTime 30 days`);
  } else {
    msg.channel.send(embedMessage({
      title: 'Time Extension Request',
      description: `You have requested to extend the time by ${extensionTime} ${extensionTimeUnit} `,
      fields: {
        name: `To extend the time, you must receive 3 votes. To vote, react with an emoji of your choice.`,
        value: `Voting will expire after 3 votes or 1 hour.\n Voting more than once will invalidate the extension request`,
      }
    })).then(async message => {
      const collector = message.createReactionCollector(() => true, { max: 3, time: 3600000 });
      let users = [];
      let shouldUpdate = true;
      collector.on('collect', (reaction, user) => {
          if (users.includes(user.id)) {
            shouldUpdate = false;
            msg.channel.send('Stop trying to cheat!');
          } else {
            users.push(user.id);
          }
      });
      collector.on('end', (collected) => {
        if ((collected.size === 3) && shouldUpdate) {
          const expirationDate = selectedBookClient.updateExpirationTime(extensionTime, extensionTimeUnit);
          msg.channel.send(`New Expiration date is ${expirationDate}`);
        } else if (collected.size < 3) {
          msg.channel.send('Expiration time not updated. Not Enough Votes!');
        } else {
          msg.channel.send('Expiration time not updated. Double voting is not allowed!')
        }
      });
    });
  }
}

function sendDeleteBookMessage (msg) {
  const bookInfo = bookClubInfo.suggestedBooks.map((book, index) => {
    return {
      name: `${book.title} ${discordInfo.emojis[index]}`,
      value: `${book.author || 'No Author'} \n ${book.ISBN || ''} `,
      inline: true
    }
  })

  msg.channel.send(embedMessage({
    title: 'Choose a book to delete',
    description: 'To delete a book, react with the appropriate reaction',
    fields: [...bookInfo]
  })).then(async message => {
    const collector = message.createReactionCollector(() => true, { time: 15000 });
    collector.on('collect', reaction => {
      const matchingEmoji = discordInfo.emojis.find(emoji => emoji === reaction.emoji.name)
      if (matchingEmoji !== -1) {
        deleteBook(discordInfo.emojis.indexOf(matchingEmoji), message)
      }
    });
    collector.on('end', () => console.log("times up"));
  });
}

function getCommandsMessage() {
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
      name: DELETE_BOOK,
      value: 'This command will allow you delete a book from the list of suggested books'
    },
    { name: random_book,
      value: 'This command will choose the next book',
      inline: true
    },
    { name: roll,
      value: 'This command will roll a number between 1-100, Good Luck',
      inline: true
    },
    {
      name: COMMANDS,
      value: 'This command will list all available commands'
    },
    {
      name: HELP,
      value: 'This command provide you with useful information for interacting with the librarian'
    },
  ];
  return embedMessage({
    title: 'Commands',
    description: 'Below you will find a list of useful commands',
    fields: [...commands]
  });
}

function getHelpMessage() {
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
  deleteBook,
  extendTime,
  sendDeleteBookMessage,
  getCurrentBook,
  getHelpMessage,
  randomize,
  getCommandsMessage
}