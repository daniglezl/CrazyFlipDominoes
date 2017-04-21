// const { app, BrowserWindow } = require('electron')
// const path = require('path')
// const url = require('url')
// const net = require('net')
import { app, BrowserWindow } from 'electron'
import {enableLiveReload} from 'electron-compile'
import path from 'path'
import url from 'url'
import ClientSocket from './lib/ClientSocket'

let win
enableLiveReload()

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    'min-width': 800,
    'min-height': 600
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, "index.html"),
    protocol: "file",
    slashes: true
  }))

  win.webContents.openDevTools()

  win.on("closed", () => {
    win = null
  })

  // let clientSocket = new ClientSocket('127.0.0.1', '6900')
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "drawin")
    app.quit()
})

app.on("activate", () => {
  if (win === null)
    createWindow()
})
