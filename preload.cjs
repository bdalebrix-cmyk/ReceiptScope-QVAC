const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("receiptScope", {
  chooseReceipt: () => ipcRenderer.invoke("choose-receipt"),
  scanReceipt: (imagePath) => ipcRenderer.invoke("scan-receipt", imagePath),
  onStatus: (callback) => {
    ipcRenderer.on("status", (_event, data) => callback(data));
  }
});
