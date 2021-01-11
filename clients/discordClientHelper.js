const fs = require('fs')
const relativeTime = require('dayjs/plugin/relativeTime')
const dayjs = require('dayjs').extend(relativeTime)
const {
  isISBN,
  embedMessage,
  isEmpty
} = require('../utils/utils')
const {
  ADD_BOOK,
  SHOW_BOOKS,
  CURRENT_BOOK,
  HELP,
  BOOKCOMMANDS,
  DELETE_BOOK,
  random_book,
  roll,
  EXTEND_TIME,
  REFRESH_GOODREADS,
  PLAY,
  SKIP,
  STOP,
  RESUME,
  PAUSE,
  SHUFFLE,
  TOGGLE,
  MUSIC_COMMANDS,
  VOLUME
} = require('../constants');
const {
  saveCurrentBookAsPrevious,
  setSelectedBookData,
  updateGoodReadsData
} = require('./selectedBookClient')

const bookClubInfoFileLocation = 'savedData/bookClubInfo.json'
const bookClubInfo = require(`../${bookClubInfoFileLocation}`)
const selectedBook = require('../savedData/selectedBook.json')
const discordFileLocation = 'savedData/discord.json'
const discordInfo = require(`../${discordFileLocation}`)

const settings = {
  prefix: '.' || '!',
  token: process.env.DISCORD_TOKEN
};

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


  const bookInfo = [{
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

function updateCurrentBook(message) {
  const messageTitle = message.split(/(?<= |^)by(?= |$)/gi)[0];
  const {
    title,
    author
  } = bookClubInfo.suggestedBooks.find(book => book.title = messageTitle);
  saveCurrentBookAsPrevious();
  setSelectedBookData({
    title,
    author
  });
}

function randomize() {
  var listofbooks = bookClubInfo.suggestedBooks;
  var randomItem = listofbooks[Math.floor(Math.random() * listofbooks.length)];
  return ('The next book is ' + randomItem.title)
}

function refreshGoodReads() {
  updateGoodReadsData();
}

function getCurrentBook() {
  const today = dayjs();
  const timeLeft = today.to(dayjs(selectedBook.endDate));
  const goodreadsInfo = !isEmpty(selectedBook.goodreads) ? `
  - Title: ${selectedBook.goodreads.best_book.title}
  - Author: ${selectedBook.goodreads.best_book.author.name}
  - Rating: ${selectedBook.goodreads.average_rating} based on ${selectedBook.goodreads.ratings_count} ratings
  - Published: ${selectedBook.goodreads.original_publication_month}/${selectedBook.goodreads.original_publication_day}/${selectedBook.goodreads.original_publication_year}
  ` : ' Goodreads Info Not Found';

  const bookInfo = [{
      name: selectedBook.title,
      value: selectedBook.author || ''
    },
    {
      name: 'Time Remaining',
      value: `Time expires ${timeLeft}`
    },
    {
      name: 'Goodreads',
      value: goodreadsInfo
    },
    {
      name: 'Link',
      value: selectedBook.purchaseLink
    }
  ]

  let thumbnail;
  if (!isEmpty(selectedBook.goodreads)) {
    thumbnail = selectedBook.goodreads.best_book.image_url;
  }
  return embedMessage({
    title: 'Current Book',
    description: 'Information about the current book',
    thumbnail: thumbnail,
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
    fields: [{
      name: deletedBook.title,
      value: deletedBook.author
    }]
  }))
}

function getExtensionTime(messageText) {
  const extensionTime = messageText.split(' ').find(string => {
    return isNaN(string) === false;
  });
  const extensionTimeUnit = messageText.split(' ').find(string => {
    if (discordInfo.timeUnits.includes(string.toLowerCase())) {
      return true;
    }
  });

  return {
    extensionTime,
    extensionTimeUnit
  };
}

async function extendTime(msg) {
  const {
    extensionTime,
    extensionTimeUnit
  } = getExtensionTime(msg.content);
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
      const collector = message.createReactionCollector(() => true, {
        max: 3,
        time: 3600000
      });
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

function sendDeleteBookMessage(msg) {
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
    const collector = message.createReactionCollector(() => true, {
      time: 15000
    });
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
  const commands = [{
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
    {
      name: random_book,
      value: 'This command will choose the next book',
      inline: true
    },
    {
      name: roll,
      value: 'This command will roll a number between 1-100, Good Luck',
      inline: true
    },
    {
      name: EXTEND_TIME,
      value: 'This command will allow you to extend the time left for the current book',
      inline: true
    },
    {
      name: REFRESH_GOODREADS,
      value: 'This command will refresh the data pulled from good reads about the current book',
      inline: true
    },
    {
      name: BOOKCOMMANDS,
      value: 'This command will list all available commands'
    },
    {
      name: HELP,
      value: 'This command provide you with useful information for interacting with the librarian'
    },
  ];
  return embedMessage({
    title: 'Book commands',
    description: 'Below you will find a list of useful commands',
    fields: [...commands]
  });
}

function getHelpMessage() {
  const helpInfo = [{
      name: 'Info',
      value: 'This bot has Book Club commands and Music player commands'
    },
    {
      name: 'Book Commands',
      value: 'To find a list of book commands, type `.bookcommands`'
    },
    {
      name: 'Music Commands',
      value: 'To find a list of book commands, type `.musiccommands`'
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

function getMusicCommandsMessage() {
  const Mcommands = [{
      name: PLAY.join(' or '),
      value: 'This will play any song with the song name or URL after the command',
      inline: true
    },
    {
      name: SKIP.join(' or '),
      value: 'This command will skip current song',
      inline: true
    },
    {
      name: STOP.join(' or '),
      value: 'This command will stop playing music',
      inline: true
    },
    {
      name: PAUSE,
      value: 'This command will pause playing'
    },
    {
      name: RESUME,
      value: 'This command will resume playing',
      inline: true
    },
    {
      name: SHUFFLE,
      value: 'This command will shuffle the queue',
      inline: true
    },
    {
      name: TOGGLE,
      value: 'This command will repeat the current song for ever and ever and ever',
      inline: true
    },
    {
      name: VOLUME,
      value: 'This command will change the bot volume from 0-150',
      inline: true
    },
    {
      name: MUSIC_COMMANDS,
      value: 'This command will list all available Music Bot commands'
    }
  ];
  return embedMessage({
    title: 'Music commands',
    description: 'Below you will find a list of useful Music Bot commands',
    fields: [...Mcommands]
  });
}

function stop(msg, client) {
  const args = msg.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (STOP.find(commandd => `.${command}` === commandd || `!${command}` === commandd)) {
    client.player.stop(msg.guild.id);
    msg.channel.send('Music stopped, the Queue was cleared!');
  }
}

async function skip(msg, client) {
  const prefix = msg.content.split(settings.prefix.length)[0]
  const args = msg.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let isPlaying = client.player.isPlaying(msg.guild.id);
  let queue = await client.player.getQueue(msg.guild.id);

  if (queue && queue.songs.length >= 2) {

    if (prefix.startsWith('.') && SKIP.find(commandd => `.${command}` === commandd)) {
      let song = await client.player.skip(msg.guild.id);
      msg.channel.send(`${song.name} was skipped!`);
    } else if (prefix.startsWith('!') && SKIP.find(commandd => `!${command}` === commandd) && isPlaying) {
      let toggle = client.player.toggleLoop(msg.guild.id);
      if (toggle)
        msg.channel.send('I will now repeat the current playing song.');
      else msg.channel.send('I will not longer repeat the current playing song.');
    }
  } else if (!isPlaying) {
    msg.channel.send('Music bot is not playing anything')
  } else {
    client.player.stop(msg.guild.id);
    msg.channel.send('Music stopped!');
  }
}

async function queue(msg, client) {
  const args = msg.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let isPlaying = client.player.isPlaying(msg.guild.id);
  if (command === 'queue' && isPlaying) {
    let queue = await client.player.getQueue(msg.guild.id);
    msg.channel.send('Queue:\n' + (queue.songs.map((song, i) => {
      return `${i === 0 ? 'Now Playing' : `#${i+1}`} - ${song.name} | ${song.author}`
    }).join('\n')));
  } else if (!isPlaying) {
    msg.channel.send("Music bot is not playing anything.")
  }
}

async function play(msg, client) {
  const args = msg.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (args[0] === undefined && (command === 'play' || 'p')){msg.channel.send('Please add a song after command.')}
  else if (command === 'play' || 'p' ) {

    let isPlaying = client.player.isPlaying(msg.guild.id);
    let song
    if (args[0].includes("playlist")) {
      let playlist = await client.player.playlist(msg.guild.id, args.join(' '), msg.member.voice.channel, 10, msg.author.tag);
      song = playlist.song;
      playlist = playlist.playlist;
      msg.channel.send(`Added a Playlist to the queue with **${playlist.videoCount} songs**, that was **made by ${playlist.channel}**.`)
      if (!isPlaying) {
        msg.channel.send(`Started playing ${song.name}!`);
        song.queue.on('end', () => {
          msg.channel.send('The queue is empty, please add new songs!');
        });
        song.queue.on('songChanged', (oldSong, newSong, skipped, repeatMode) => {
          if (repeatMode) {
            msg.channel.send(`Playing ${newSong.name} again...`);
          } else {
            msg.channel.send(`Now playing ${newSong.name}...`);
          }
        });
      }
    } else {
      if (isPlaying) {
        let song = await client.player.addToQueue(msg.guild.id, args.join(' '));
        song = song.song;
        msg.channel.send(`Song ${song.name} was added to the queue!`);
      } else {
        let song = await client.player.play(msg.member.voice.channel, args.join(' '));
        song = song.song;
        msg.channel.send(`Started playing ${song.name}!`);
      }
    }
  }
}

async function pause(msg, client) {
  const args = msg.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let isPlaying = client.player.isPlaying(msg.guild.id);
  if (command === 'pause' && isPlaying) {
    let song = await client.player.pause(msg.guild.id);
    msg.channel.send(`${song.name} was paused!`);
  } else if (!isPlaying) {
    msg.channel.send("Music bot is not playing anything.")
  }
}

async function resume(msg, client) {
  const args = msg.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'resume') {
    let song = await client.player.resume(msg.guild.id);
    msg.channel.send(`${song.name} was resumed!`);
  }
}

function shuffle(msg, client) {
  const args = msg.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let isPlaying = client.player.isPlaying(msg.guild.id);
  if (command === 'shuffle' && isPlaying) {
    client.player.shuffle(msg.guild.id);
    msg.channel.send('Server Queue was shuffled.');
  } else if (!isPlaying) {
    msg.channel.send('There is nothing in the queue.');
  }
};

function toggle(msg, client) {
  const args = msg.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let isPlaying = client.player.isPlaying(msg.guild.id);
  if (command === 'toggle' && isPlaying) {
    let toggle = client.player.toggleLoop(msg.guild.id);
    if (toggle)
      msg.channel.send('I will now repeat the current playing song.');
    else msg.channel.send('I will not longer repeat the current playing song.');
  } else if (!isPlaying) {
    msg.channel.send('There is nothing playing.');
  }
}

function volume(msg, client) {
  const args = msg.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  console.log(parseInt(args))
  if (command === 'volume' && parseInt(args) >= 0 && parseInt(args) <= 200) {
    client.player.setVolume(msg.guild.id, parseInt(args[0]));
    msg.channel.send(`Volume set to ${args[0]} !`);
  } else {
    msg.channel.send('Please enter a number 0-150!')
  }
};


module.exports = {
  addBook,
  getBooks,
  updateCurrentBook,
  deleteBook,
  extendTime,
  sendDeleteBookMessage,
  getCurrentBook,
  getHelpMessage,
  randomize,
  getCommandsMessage,
  refreshGoodReads,
  play,
  stop,
  skip,
  pause,
  resume,
  shuffle,
  toggle,
  volume,
  getMusicCommandsMessage,
  queue
}