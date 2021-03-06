const { ADD_BOOK, SHOW_BOOKS, CURRENT_BOOK, HELP, COMMANDS, DELETE_BOOK, EXTEND_TIME, random_book, roll, REVIEW_BOOK, REFRESH_GOODREADS, UPDATE_CURRENT_BOOK} = require('../constants');
const DCH = require('./discordClientHelper');

async function readMessage(msg) {
  const messageText = msg.content
  const messageCommand = messageText.split(' ')[0];

  if (messageCommand.startsWith('.')) {
    switch(messageCommand) {
      case ADD_BOOK : 
      const message = messageText.replace(/^.addBook/i, '');
      const response = DCH.addBook(message);
        msg.reply(response);
        break;
      case SHOW_BOOKS :
        const books = DCH.getBooks(messageText);
        msg.reply(books);
        break;
      case CURRENT_BOOK :
        const currentBook = DCH.getCurrentBook();
        msg.reply(currentBook);
        break;
      case DELETE_BOOK : 
        DCH.sendDeleteBookMessage(msg)
        break;
      case HELP :
        const helpMessage = DCH.getHelpMessage();
        msg.reply(helpMessage);
        break;
      case roll :
        var throwdice = Math.floor(Math.random() * (100 - 1) ) + 1
        msg.reply('Your number is ' + throwdice)
        break;
      case random_book :
        const randomB = DCH.randomize()
        msg.reply(randomB)
        break;
      case COMMANDS :
        const commandsMessage = DCH.getCommandsMessage();
        msg.reply(commandsMessage);
        break;
      case EXTEND_TIME :
        DCH.extendTime(msg);
        break;
      case REVIEW_BOOK : 
        // DCH.reviewBook(msg);
        msg.reply('Not Implemented');
      case REFRESH_GOODREADS : 
        DCH.refreshGoodReads();
        msg.channel.send(`.currentBook`);
        break;
      case UPDATE_CURRENT_BOOK: 
        const text = messageText.replace(/^.updateCurrentBook/i, '');
        DCH.updateCurrentBook(text);
        msg.reply('Book Updated!');
        break;
      default :
        const badCommand = messageText.split(' ')[0];
        msg.reply(`${badCommand} is not a valid command. Try typing .help for more info`)
    }
  }
}

module.exports = {
  readMessage
}

