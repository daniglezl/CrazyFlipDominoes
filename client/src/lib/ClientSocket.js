import net from 'net'

class ClientSocket {
  constructor(host, port, $) {
    this.host = host
    this.port = port
    this.socket = this.createSocket()
    this.hand = []
    this.$ = $
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

  onData(sock, data) {
    console.log(`[DATA]: ${ data }`)
    if (data.toString().indexOf("gi") == 0) {
      const port = data.toString().substring(2)
      let host = sock.remoteAddress
      sock.destroy()
      sock = this.createSocket()
      sock.connect(port, host, () => {
        console.log(`[CONNECTED GAME]: Connected to game on ${ host }:${ port }`)
      })
    } else if (data.toString().indexOf("c") == 0) {
      this.hand = data.toString().split(",")
        .map((e) => e.substring(1).split("-"))
        .map((e) => {
          return {
            top: parseInt(e[0]),
            bottom: parseInt(e[1])
          }
        })

      let main = this.$("#hand-container")
      this.hand.forEach((c) => {
        main.append(`
          <div class="card" data-top=${ c.top } data-bottom=${ c.bottom }>
            <div class="top face-${c.top}"></div>
            <div class="bottom face-${c.bottom}"></div>
          </div>
        `)
      })
      this.$(".main-content").hide()
      this.$(".game-screen").show()
    }
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