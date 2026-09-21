import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadModel, ocr, OCR_LATIN, unloadModel, close } from "@qvac/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let modelId = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 900,
    minHeight: 650,
    backgroundColor: "#f5f5f0",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await mainWindow.loadFile(path.join(__dirname, "index.html"));
}

async function ensureModel() {
  if (modelId) return modelId;

  mainWindow?.webContents.send("status", {
    type: "loading",
    message: "Loading the local OCR model…"
  });

  modelId = await loadModel({
    modelSrc: OCR_LATIN,
    modelConfig: {
      langList: ["en"],
      magRatio: 1.5,
      defaultRotationAngles: [90, 180, 270],
      contrastRetry: false,
      lowConfidenceThreshold: 0.5,
      recognizerBatchSize: 1
    }
  });

  mainWindow?.webContents.send("status", {
    type: "ready",
    message: "Local model ready — nothing is uploaded."
  });

  return modelId;
}

ipcMain.handle("choose-receipt", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Choose a receipt image",
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "bmp", "webp"] }
    ]
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("scan-receipt", async (_event, imagePath) => {
  if (!imagePath) throw new Error("No receipt image selected.");

  const id = await ensureModel();

  mainWindow?.webContents.send("status", {
    type: "scanning",
    message: "Reading receipt locally…"
  });

  const { blocks } = ocr({
    modelId: id,
    image: imagePath,
    options: { paragraph: false }
  });

  const result = await blocks;

  const lines = result
    .map((block) => ({
      text: block.text?.trim() ?? "",
      confidence: block.confidence ?? null,
      bbox: block.bbox ?? null
    }))
    .filter((block) => block.text.length > 0);

  mainWindow?.webContents.send("status", {
    type: "done",
    message: `Done — ${lines.length} text regions found locally.`
  });

  return { lines };
});

app.whenReady().then(createWindow);

app.on("before-quit", async () => {
  try {
    if (modelId) {
      await unloadModel({ modelId, clearStorage: false });
      modelId = null;
    }
    await close();
  } catch {}
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
