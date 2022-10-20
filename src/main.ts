import { app, BrowserWindow } from "electron";
import * as path from "path";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 400
  });

  // win.webContents.openDevTools()

  win.loadFile(path.join(__dirname + "/index.html")).then(() => {
    // implement
  });
}

app.on("ready", () => {
  console.log("App is ready");
  createWindow();
});
