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
    minWidth: 800,
    minHeight: 600
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
