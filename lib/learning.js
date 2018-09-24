const natural = require('natural')
const pairs = require('./helpers/pair')
const tokenizer = new natural.RegexpTokenizer({ pattern: /[\s.,_:"']/ })
const TOKEN_TYPE_FINISH = 2
const TOKEN_TYPE_START = 1
class Learning {
  constructor(options) {
    const { db, bot } = options
    this.db = db
  }

  attachBot(bot) {
    this.bot = bot
    this.bot.on('text', this.learn.bind(this))
    return Promise.all([
      this.db.run('MERGE (word:WORD {type: {type_start}, text: "_START" }) return word', { type_start: TOKEN_TYPE_START }),
      this.db.run('MERGE (word:WORD {type: {type_finish}, text: "_FINISH" }) return word', { type_finish: TOKEN_TYPE_FINISH})
    ])
  }

  async learn(ctx) {
    let tokens = tokenizer.tokenize(ctx.message.text)

    tokens = tokens.map(token => ({ text: token }))
    tokens.unshift({ type: TOKEN_TYPE_START, text: '_START' })
    tokens.push({ type: TOKEN_TYPE_FINISH, text: '_FINISH' })
    const db = this.db
    for (let pair of pairs(tokens)) {
      await db.run(`
        MERGE (left:WORD { text: {left} })
        MERGE (right:WORD { text: {right} })
        MERGE (left)-[r:NEXT]->(right)
        ON MATCH set r.weight = r.weight + 1
        ON CREATE set r.weight = 1`, {
          left: pair[0].text,
          right: pair[1].text
        }
      )
    }
  }
}

module.exports = Learning
