function isEmpty (data) {
  if (
    data === null ||
    data === undefined ||
    data === '' ||
    data === [] ||
    data.length === 0 ||
    data === {}
    ) return true;
  return false;
}

function isISBN (text) {
  const updatedText = text.replace(/-/g, '');
  if (!isNaN(updatedText) && (updatedText.length === 13 || updatedText.length === 10)) {
    return true
  }
  return false
}

module.exports = {
  isEmpty,
  isISBN
}