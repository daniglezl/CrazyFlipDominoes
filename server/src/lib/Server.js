import net from'net'
import GameInst from "./GameInst.js"

class Server {
  constructor(host, gamePort, chatPort) {
    this.host = host
    this.gamePortMin = gamePort[0]
    this.gamePortMax = gamePort[1]
    this.chatPortMin = chatPort[0]
    this.chatPortMax = chatPort[1]
    this.currentGamePort = this.gamePortMin
    let { gameSocket, chatSocket } = this.createSockets()
    this.gameSocket = gameSocket
    this.chatSocket = chatSocket
    this.gameInstances = []
    this.clients = []
  }

  createSockets() {
    return {
      gameSocket: this.createGameSocket(),
      chatSocket: this.createChatSocket()
    }
  }

  createGameSocket() {
    let gameSocket = net.createServer()
    gameSocket.listen(this.gamePortMin, this.host)
    console.log(`[LISTENING]: Game server listening on ${ this.host }:${ this.gamePortMin }`)
    gameSocket.on("connection", (sock) => {
      sock.name = `${ sock.remoteAddress }:${ sock.remotePort }`
      console.log(`[CONN]: ${ sock.name } joined`)
      this.clients.push(sock)

      sock.on("data", (data) => this.onData(sock, data))
      sock.on("close", () => this.onClose(sock))
    })

    return gameSocket
  }

  createChatSocket() {
    return null
  }

  onData(sock, data) {
    console.log(`[DATA]: Data from ${ sock.name }`)
    switch(data.toString()) {
      case "1v1":
      case "2v2": {
        this.addToGameInstance(sock, data.toString())
        break
      }
    }
  }

  addToGameInstance(sock, gameType) {
    this.clients = this.clients.filter((e) => e.name !== sock.name)
    let inst = this.gameInstances.find((e) => e.gameType == gameType)
    if (inst) {
      if (inst.isFull()) {
        this.gameInstances = this.gameInstances.filter((e) => e.gameType !== gameType)
        this.gameInstances.push(new GameInst(sock, gameType, this.host, this.getInstPort()))
      } else {
        inst.addPlayer(sock)
      }
    } else {
      this.gameInstances.push(new GameInst(sock, gameType, this.host, this.getInstPort()))
    }
  }

  getInstPort() {
    this.currentGamePort += 1
    if (this.currentGamePort == this.gamePortMax + 1)
      this.currentGamePort = this.gamePortMin + 1
    return this.currentGamePort
  }

  onClose(sock) {
    console.log(`[CLOSED]: Connection closed for ${ sock.name }`)
  }
}

export default Server