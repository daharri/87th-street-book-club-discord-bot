const CronJob = require('cron').CronJob
const relativeTime = require('dayjs/plugin/relativeTime')
const dayjs = require('dayjs').extend(relativeTime)

const selectedBook = require('../savedData/selectedBook.json')
const bookClubInfo = require('../savedData/bookClubInfo.json')
const {
  embedMessage
} = require('../utils/utils')

const reminderMessage = (timeLeft) => {
  const reminderInfo = [{
      name: selectedBook.title,
      value: `${selectedBook.author + '\n\n' || ''} Type \`.currentBook\` for more info`
    },
    {
      name: 'Time Remaining',
      value: `Time expires ${timeLeft}`
    },
    {
      name: 'Help',
      value: 'Type \`.help\` for more info'
    }
  ];

  return embedMessage({
    title: "Daily Reminder",
    description: "<@&696581354569203752> Don't forget to read :nerd:", // Bookies role id : 696581354569203752. Move to saved data.
    fields: [...reminderInfo]
  });
}

const newBookMessage = (newBookStartTime) => {
  const newBookInfo = [
  {
    name: 'The new book will start in',
    value: `${newBookStartTime}`
  },
  {
    name: 'Voting will start 2 days before the new book is picked',
    value: `Users can only vote once`
  },
  {
    name: 'Help',
    value: 'Type \`.help\` for more info'
  }
];

return embedMessage({
  title: "New Book Reminder",
  description: "<@&696581354569203752> \n The previous book is now done. Type `.review` to review the book." , // Bookies role id : 696581354569203752. Move to saved data.
  fields: [...newBookInfo]
});
}

exports.start = (client) => {
  const dailyReminders = new CronJob('0 0 11 * * *', () => {
    const today = dayjs();
    const timeLeft = today.to(dayjs(selectedBook.endDate));
    const newBookStartTime = dayjs(selectedBook.endDate).add(15, 'days');
    const channelId = process.env.NODE_ENV === 'development' ? bookClubInfo.testChannelId : bookClubInfo.bookClubChannelId;

    if (today.format('YYYY-MM-DD') === newBookStartTime.subtract(1, 'day').format('YYYY-MM-DD')) {
      // saveCurrentBookAsPrevious();
      // // Randomize book
      // const message = newBookMessage(newBookStartTime);
      // client.channels.cache.get(channelId).send(message);
    } else if (today > dayjs(selectedBook.endDate)) {
      const message = reminderMessage(timeLeft);
      client.channels.cache.get(channelId).send(message);
    } else {
      const message = newBookMessage(newBookStartTime);
      client.channels.cache.get(channelId).send(message);
    }
  })

  dailyReminders.start()
}