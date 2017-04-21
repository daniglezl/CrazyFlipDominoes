import net from 'net'

class ClientSocket {
  constructor(host, port) {
    this.host = host
    this.port = port
    this.socket = this.createSocket()
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
      this.onData(data)
    })

    socket.on("close", () => {
      console.log("Connection closed")
    })
    return socket
  }

  onData(data) {
    console.log(`[DATA]: ${ data }`)
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