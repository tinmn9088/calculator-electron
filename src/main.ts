import { app, BrowserWindow } from "electron";
import * as path from "path";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 550,
    resizable: false,
    icon: 'assets/favicon.png',
    show: false
  });

  // win.webContents.openDevTools();
  
  win.setMenu(null);
  win.loadFile(path.join(__dirname, "/index.html"));
  win.on("ready-to-show", () => win.show());
}

app.on("ready", () => {
  createWindow();
});
