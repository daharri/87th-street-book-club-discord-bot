const BOT_SETTINGS = 'settings.json';
const SELECTED_BOOK_INFO = 'selectedBook.json';
const BOOK_CLUB_INFO = 'bookClubInfo.json';

// Commands
const ADD_BOOK = '.addbook';
const SHOW_BOOKS = '.allbooks';
const CURRENT_BOOK = '.currentbook';
const UPDATE_CURRENT_BOOK = '.updatecurrentbook';
const DELETE_BOOK = '.deletebook';
const HELP = '.help';
const random_book = '.randomize';
const roll = '.roll'
const BOOKCOMMANDS = '.bookcommands';
const EXTEND_TIME = '.extend';
const REVIEW_BOOK = '.review';
const REFRESH_GOODREADS = '.refreshgoodreads';
const PLAY = ['.play', '.p']
const SKIP = ['.skip', '.s', '!s', '!skip']
const STOP = ['.stop', '!p']
const PAUSE = '.pause' 
const RESUME = '.resume'
const SHUFFLE = '.shuffle' 
const TOGGLE = '.toggle'
const VOLUME = '.volume' 
const MUSIC_COMMANDS = '.musiccommands'
const QUEUE = '.queue' 



module.exports = {
  BOT_SETTINGS,
  SELECTED_BOOK_INFO,
  BOOK_CLUB_INFO,
  ADD_BOOK,
  DELETE_BOOK,
  SHOW_BOOKS,
  CURRENT_BOOK,
  HELP,
  roll,
  random_book,
  BOOKCOMMANDS,
  EXTEND_TIME,
  REVIEW_BOOK,
  REFRESH_GOODREADS,
  UPDATE_CURRENT_BOOK,
  PLAY,
  SKIP,
  STOP,
  PAUSE,
  RESUME,
  SHUFFLE,
  TOGGLE,
  VOLUME,
  MUSIC_COMMANDS,
  QUEUE
}