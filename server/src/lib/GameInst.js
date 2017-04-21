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
    console.log("dealing cards")
  }
}

export default GameInst