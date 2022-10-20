import { app, BrowserWindow } from "electron";
import * as path from "path";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 550,
    resizable: false
  });

  // win.webContents.openDevTools();
  
  win.setMenu(null);
  win.loadFile(path.join(__dirname, "/index.html"));
}

app.on("ready", () => {
  createWindow();
});
