import net from 'net'
import dgram from 'dgram'

class GameInst {
  constructor(sock, gameType, host, port, chatPort) {
    this.gameType = gameType
    this.maxPlayers = gameType == "1v1" ? 2 : 4
    this.tempPlayers = [sock]
    this.players = []
    this.host = host
    this.port = port
    this.chatPort = chatPort
    this.server = null
    this.chatServer = null
    this.chatClients = []
    this.remaining = []
    this.currenPlayer = 0
  }

  start() {
    this.createServers()

    this.tempPlayers.forEach((e) => {
      e.write(`*cp${ this.chatPort }`)
      e.write(`*gi${ this.port }`)
    })
  }

  createServers() {
    // game server
    this.server = net.createServer()
    this.server.listen(this.port, this.host)
    console.log(`[GAME]: ${ this.gameType } game started on ${ this.host }:${ this.port }`)

    this.server.on("connection", (sock) => {
      this.players.push(sock)
      sock.name = `${ sock.remoteAddress }:${ sock.remotePort }`
      if (this.players.length === this.maxPlayers) {
        this.dealCards()
      }
    })

    // chat server
    this.chatServer = dgram.createSocket('udp4')

    this.chatServer.on('error', (err) => {
      console.log(`server error:\n${err.stack}`)
      this.chatServer.close()
    })

    this.chatServer.on('message', (msg, rinfo) => this.broadcastMessage(msg, rinfo))

    this.chatServer.on('listening', () => {
      console.log(`[CHAT]: Chat server started on ${ this.host }:${ this.chatPort }`)
    })

    this.chatServer.bind(this.chatPort)
  }

  broadcastMessage(msg, rinfo) {
    if (msg.toString().indexOf("a") === 0) {
      let c = `${rinfo.address}:${rinfo.port}`
      if (this.chatClients.indexOf(c) < 0)
        this.chatClients.push(c)
    } else {
      msg = msg.toString()
      const player = parseInt(msg.substring(1, msg.indexOf("m"))) + 1
      msg = msg.substring(msg.indexOf("m") + 1)
      console.log(`[CHAT MSG]: "${msg}" from player ${ player }`)
      msg = `
        <span class="message">
          <b>Player ${ player }:</b>
          ${ msg }
        </span>
      `
      this.chatClients.forEach((c) => {
        let addr, port
        [addr, port] = c.split(":")
        this.chatServer.send(msg, port, addr)
      })
    }
  }

  addPlayer(sock) {
    this.tempPlayers.push(sock)
    if (this.tempPlayers.length === this.maxPlayers) {
      this.start()
    }
  }

  isFull() {
    return this.players.length === this.maxPlayers
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
    this.players.forEach((p, i) => {
      playerCards = cards.slice(count, count + 10).join(",")
      this.remaining.push([i, 10])
      p.write(`*${ playerCards }`)
      p.write(`*y${ i }`)
      count += 10
    })
    let remainingStr = this.remaining.map((e) => `${ e[0] }-${ e[1] }`)
    this.players.forEach((p) => {
      p.write(`*r${ remainingStr.join(",") }`)
    })
    this.players[this.currenPlayer].write("*t")
  }

  getRandom(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

export default GameInst