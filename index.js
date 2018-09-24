
const Telegraf = require('telegraf')
const neo4jDriver = require('neo4j-driver').v1
const Learning = require('./lib/learning')

const { BOT_TOKEN, DB_URL, DB_USER, DB_PASSWORD } = process.env

const neo4j = neo4jDriver.driver(DB_URL, neo4jDriver.auth.basic(DB_USER, DB_PASSWORD))


const db = neo4j.session()


const bot = new Telegraf(BOT_TOKEN)
const learning = new Learning({ db })

learning.attachBot(bot).then(() => {

  bot.startPolling()

})
