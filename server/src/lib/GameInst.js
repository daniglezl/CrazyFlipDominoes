import net from 'net'

class GameInst {
  constructor(sock, gameType, host, port) {
    this.gameType = gameType
    this.maxPlayers = gameType == "1v1" ? 2 : 4
    this.tempPlayers = [sock]
    this.players = []
    this.host = host
    this.port = port
    this.server = null
  }

  start() {
    this.server = net.createServer()
    this.server.listen(this.port, this.host)
    console.log(`[GAME]: ${ this.gameType } game started on ${ this.host }:${ this.port }`)

    this.tempPlayers.forEach((e) => {
      e.write(`gi${ this.port }`)
    })

    this.server.on("connection", (sock) => {
      this.players.push(sock)
      sock.name = `${ sock.remoteAddress }:${ sock.remotePort }`
      if (this.players.length === this.maxPlayers) {
        this.dealCards()
      }
    })
  }

  addPlayer(sock) {
    this.tempPlayers.push(sock)
    if (this.tempPlayers.length === this.maxPlayers) {
      this.start()
    }
  }

  isFull() {
    this.tempPlayers.length === this.maxPlayers
  }

  dealCards() {
    let cards = []
    for(let i = 0; i < 10; i++) {
      for(let j = i; j < 10; j++) {
        cards.push(`c${ i }-${ j }`)
      }
    }
    cards.forEach((c) => {
      let index1 = cards.indexOf(c)
      let index2 = this.getRandom(0, cards.length - 1)
      let temp = cards[index1]
      cards[index1] = cards[index2]
      cards[index2] = temp
    })
    let count = 0
    let playerCards = ""
    this.players.forEach((p) => {
      playerCards = cards.slice(count, count + 10).join(",")
      p.write(playerCards)
      count += 10
    })
  }

  getRandom(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

export default GameInst