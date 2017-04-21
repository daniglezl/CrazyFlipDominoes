import $ from 'jQuery'
import ClientSocket from './lib/ClientSocket'
const HOST = '127.0.0.1'
const PORT = '6900'
let socket = null

$(document).ready(() => {
  // $(".game-screen").hide()
  $(".main-content").hide()

  $("#play-1v1").on("click", () => {
    socket = new ClientSocket(HOST, PORT, $)
    socket.send("1v1")
  })

  $("#play-2v2").on("click", () => {
    socket = new ClientSocket(HOST, PORT, $)
    socket.send("2v2")
  })
})
