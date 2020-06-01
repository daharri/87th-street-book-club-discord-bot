const fs = require('fs');
const dayjs = require('dayjs');
const selectedBook = require('../savedData/selectedBook.json');
const bookClubInfo = require('../savedData/bookClubInfo.json');
const { addGoodreadsData } = require('../retrievers/bookDataRetriever');
const { isEmpty } = require('../utils/utils');

function setSelectedBookData (book) {
  if (!isEmpty(book)) {
    selectedBook.purchaseLink = '';
    selectedBook.title = book.title;
    selectedBook.author = book.author || '';
    selectedBook.ISBN = book.isbn || '';
    selectedBook.goodreads = {};
    selectedBook.startDate = dayjs();
    selectedBook.endDate = selectedBook.startDate.add(30, 'days');
    selectedBook.offset = 0;
    fs.writeFileSync('./savedData/selectedBook.json', JSON.stringify(selectedBook), (error) => {
      if (error) {
        console.error(error)
      }
    });
    addGoodreadsData(book);
  }
}

function updateGoodReadsData (reset = false) {
  selectedBook.offset = (!reset && !isEmpty(selectedBook.offset)) ? selectedBook.offset + 1 : 0;
  addGoodreadsData(selectedBook);
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

function saveCurrentBookAsPrevious () {
  bookClubInfo.previousBooks.push(selectedBook);
  fs.writeFileSync('savedData/bookClubInfo.json', JSON.stringify(bookClubInfo), (error) => {
    if (error) {
      console.log(error)
    }
  });
}

module.exports = {
  setSelectedBookData,
  chooseBook,
  updateExpirationTime,
  saveCurrentBookAsPrevious,
  updateGoodReadsData
}