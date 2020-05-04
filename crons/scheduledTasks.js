const CronJob = require('cron').CronJob
const relativeTime = require('dayjs/plugin/relativeTime')
const dayjs = require('dayjs').extend(relativeTime)

const selectedBook = require('../savedData/selectedBook.json')
const bookClubInfo = require('../savedData/bookClubInfo.json')
const { embedMessage } = require('../utils/utils')

exports.start = (client) => {
  const dailyReminders = new CronJob('0 0 11 * * *', () => {
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
    const channelId = process.env.NODE_ENV === 'development' ? bookClubInfo.testChannelId : bookClubInfo.bookClubChannelId;
    const message = embedMessage({
      title: "Daily Reminder",
      description: "<@&696581354569203752> Don't forget to read :nerd:", // Bookies role id : 696581354569203752. Move to saved data.
      fields: [...reminderInfo]
    });
    client.channels.cache.get(channelId).send(message);
  })

  dailyReminders.start()
}
