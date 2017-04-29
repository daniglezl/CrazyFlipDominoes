import $ from 'jQuery'
import ClientSocket from './lib/ClientSocket'
const HOST = '127.0.0.1'
const PORT = '6900'
let socket = null

function renderCards(socket) {
  let main = $("#hand-container")
  socket.hand.forEach((c) => {
    main.append(`
      <div class="card" data-top=${ c.top } data-bottom=${ c.bottom }>
        <div class="top face-${c.top}"></div>
        <div class="bottom face-${c.bottom}"></div>
      </div>
    `)
  })
  $(".main-content").hide()
  $(".game-screen").show()
}

function showRemaining(socket) {
  if (socket.remaining.length == 2) {
    let other = socket.remaining.find((e) => e[0] != socket.me)
    $(".top-player").html(`Player: ${ other[0] + 1 } - ${ other[1] }`)
  }
}

function setListeners(socket) {
  socket.on("render-cards", () => renderCards(socket))
  socket.on("show-remaining", () => showRemaining(socket))
  socket.on("my-turn", () => {

  })
  socket.on("message-received", (msg) => {
    $("#chat-messages").append(msg.toString())
  })
}

$(document).ready(() => {
  $(".game-screen").hide()
  // $(".main-content").hide()

  $("#play-1v1").on("click", () => {
    socket = new ClientSocket(HOST, PORT)
    socket.send("1v1")
    setListeners(socket)
  })

  $("#play-2v2").on("click", () => {
    socket = new ClientSocket(HOST, PORT)
    socket.send("2v2")
    setListeners(socket)
  })

  $("#chat-box").on("keypress", (e) => {
    if (e.keyCode == 13) {
      e.preventDefault()
      socket.sendMessage($(e.target).val())
      $(e.target).val("")
    }
  })
})
