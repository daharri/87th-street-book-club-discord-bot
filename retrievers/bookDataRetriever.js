const fs = require('fs');
const fetch = require('node-fetch');
const parseString = require('xml2js').parseString;
const selectedBook = require('../savedData/selectedBook.json');

require('dotenv').config()

async function findBook (book) {
  const data = {};
  const title = book.title ? book.title : '';
  const author = book.author ? book.author : '';
  const isbn = book.ISBN ? book.ISBN : '';
  const query = `${title} ${author}`;

  const headers = {
    "Content-Type": "application/json",
    "key": process.env.GOODREADS_KEY,
    "secret": process.env.GOODREADS_SECRET
  }

  return fetch(`${process.env.GOODREADS_URL}/search/index.xml?key=${process.env.GOODREADS_KEY}&q=${query}`)
    .then(res => res.text())
    .then(str => str)
    .then(data => {
      return data;
    })
}

async function addGoodreadsData (book) {
  const response = await findBook(book);
  let goodreadsData = {};
  parseString(response, { explicitArray : false, ignoreAttrs : true }, async (err, result) => {
    goodreadsData = result.GoodreadsResponse.search.results.work;
  });
  selectedBook.offset = book.offset;
  if (goodreadsData && goodreadsData[selectedBook.offset]) {
    selectedBook.goodreads = goodreadsData[selectedBook.offset];
    fs.writeFile('./savedData/selectedBook.json', JSON.stringify(selectedBook), error => {
      if (error) {
        console.error(error)
      }
    })
  }
}

module.exports = {
  addGoodreadsData
}