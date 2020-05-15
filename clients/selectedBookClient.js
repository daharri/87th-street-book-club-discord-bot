const fs = require('fs');
const dayjs = require('dayjs');
const selectedBook = require('../savedData/selectedBook.json');
const bookClubInfo = require('../savedData/bookClubInfo.json');
const { isEmpty } = require('../utils/utils');

function setSelectedBookData (book) {
  if (!isEmpty(book)) {
    const newBook = {};
    newBook.bookTitle = book.title;
    fs.writeFile('../savedData/selectedBook.json', newBook);
  }
}

function chooseBook () {
  const listOfBooks = [];
  bookClubInfo.suggestedBooks.forEach(book => {
    for(const i = 0; i <= book.numOfVotes; i++) {
      listOfBooks.push(book.title);
    }
  });
}

function updateExpirationTime (time, timeUnit) {
  const oldTime = dayjs(selectedBook.endDate);
  const newTime = oldTime.add(time, timeUnit.split('')[0].toLowerCase());
  selectedBook.endDate = newTime;
  fs.writeFile('savedData/selectedBook.json', JSON.stringify(selectedBook), (error) => {
    if (error) {
      console.log(error)
    }
  });
  return newTime;
}

module.exports = {
  setSelectedBookData,
  chooseBook,
  updateExpirationTime
}