const CronJob = require('cron').CronJob
const relativeTime = require('dayjs/plugin/relativeTime')
const dayjs = require('dayjs').extend(relativeTime)

const selectedBook = require('../savedData/selectedBook.json')
const bookClubInfo = require('../savedData/bookClubInfo.json')
const { embedMessage } = require('../utils/utils')

exports.start = (client) => {
  const today = dayjs();
  const timeLeft = today.to(dayjs(selectedBook.endDate));
  const reminderInfo = [
    {
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
  ]

  const dailyReminders = new CronJob('* * * * * *', () => {
    const channelId = process.env.NODE_ENV === 'development' ? bookClubInfo.testChannelId : bookClubInfo.bookClubChannelId;
    const message = embedMessage({
      title: "Daily Reminder",
      description: "@bookies Don't forget to read :nerd:",
      fields: [...reminderInfo]
    });
    console.log(channelId)
    client.channels.cache.get(channelId).send(message);
  })

  dailyReminders.start()
}
