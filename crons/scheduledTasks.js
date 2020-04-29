const CronJob = require('cron').CronJob
const selectedBook = require('../savedData/selectedBook.json')
const bookClubInfo = require('../savedData/bookClubInfo.json')
const relativeTime = require('dayjs/plugin/relativeTime')
const dayjs = require('dayjs').extend(relativeTime)

exports.start = (client) => {
  const today = dayjs();
  const endDate = today.to(dayjs(selectedBook.endDate));

  const dailyReminders = new CronJob('0 0 11 * * *', () => {
    const channelId = process.env.NODE_ENV === 'development' ? bookClubInfo.testChannelId : bookClubInfo.bookClubChannelId
    client.channels.cache.get(channelId).send(`@bookies Don't forget to read :nerd: 
      \n Current Book: ${selectedBook.title} by ${selectedBook.author}
      \n Time expires ${endDate}
      \n Type \`.help\` for more info
      `)
  })

  dailyReminders.start()
}
