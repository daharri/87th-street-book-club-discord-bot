const fetch = require('node-fetch');
const parseString = require('xml2js').parseString;

require('dotenv').config()

async function findBook (book) {
  const data = {};
  const query = book.title || book.author || book.ISBN;

  const headers = {
    "Content-Type": "application/json",
    "key": process.env.GOODREADS_KEY,
    "secret": process.env.GOODREADS_SECRET
  }

  await fetch(`${process.env.GOODREADS_URL}/search/index.xml?key=${process.env.GOODREADS_KEY}&q=${query}`)
    .then(res => res.text())
    .then(str =>str)
    .then(data => {
      parseString(data, { explicitArray : false, ignoreAttrs : true }, (err, result) => {
        console.log(JSON.stringify(result))
      })
    })
}

findBook({title: 'Haunted'})