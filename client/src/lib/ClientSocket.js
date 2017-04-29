import net from 'net'
import dgram from 'dgram'
import EventEmitter from 'events'

class ClientSocket extends EventEmitter {
  constructor(host, port) {
    super()
    this.host = host
    this.port = port
    this.socket = this.createSocket()
    this.chatSocket = null
    this.hand = []
    this.me = null
    this.myTurn = false
    this.remaining = null
    this.chatPort = null
    this.connect()
  }

  connect() {
    this.socket.connect(this.port, this.host, () => {
      console.log(`[CONNECTED]: ${ this.host }:${ this.port }`)
    })
  }

  createSocket() {
    let socket = new net.Socket()

    socket.on("data", (data) => {
      this.onData(socket, data)
    })

    socket.on("close", () => {
      console.log("Connection closed")
    })
    return socket
  }

  createChatSocket(port) {
    this.chatPort = port
    this.chatSocket = dgram.createSocket('udp4')
    this.chatSocket.send("a", this.chatPort, this.host)
    this.chatSocket.on("message", (msg) => this.emit("message-received", msg))
  }

  sendMessage(msg) {
    this.chatSocket.send(`p${ this.me }m${ msg }`, this.chatPort, this.host)
  }

  onData(sock, data) {
    data.toString().split("*").forEach((command) => {
      console.log(`[DATA]: ${ command }`)
      if (command.indexOf("cp") == 0) {
        this.createChatSocket(command.substring(2))
      } else if (command.indexOf("gi") == 0) {
        const port = command.substring(2)
        let host = sock.remoteAddress
        sock.destroy()
        sock = this.createSocket()
        sock.connect(port, host, () => {
          console.log(`[CONNECTED GAME]: Connected to game on ${ host }:${ port }`)
        })
      } else if (command.indexOf("c") == 0) {
        this.hand = command.split(",")
          .map((e) => e.substring(1).split("-"))
          .map((e) => {
            return {
              top: parseInt(e[0]),
              bottom: parseInt(e[1])
            }
          })
        this.emit("render-cards")
      } else if (command.indexOf("y") == 0) {
        this.me = parseInt(command.substring(1))
      } else if (command.indexOf("r") == 0) {
        this.remaining = command.substring(1).split(",")
          .map((e) => e.split("-"))
          .map((e) => [parseInt(e[0]), parseInt(e[1])])
        this.emit("show-remaining")
      } else if (command.indexOf("t") == 0) {
        this.myTurn = true;
        this.emit("my-turn")
      }
    })
  }

  send(msg) {
    console.log(`[SEND]: ${ msg }`)
    this.socket.write(msg)
  }

  close() {
    console.log("[CLOSE]")
    this.socket.destroy()
  }
}

export default ClientSocket