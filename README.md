# ReceiptScope

**ReceiptScope** is a private receipt OCR desktop app powered by Tether's QVAC SDK.

Choose a receipt image and ReceiptScope runs OCR locally on your computer. The image is passed directly to QVAC's local OCR runtime; there is no AI API key and no cloud AI request in the app.

## QVAC usage

This project uses:

- `@qvac/sdk` **0.19.1**
- `loadModel()`
- `ocr()`
- `unloadModel()`
- `OCR_LATIN`

QVAC 0.19.x uses in-process local inference and removed delegated/provider inference. ReceiptScope does not configure a cloud provider.

## Requirements

- Node.js >= 22.17
- npm >= 10.9
- A desktop environment supported by Electron and QVAC

## Install

```bash
git clone YOUR_REPOSITORY_URL
cd receiptscope
npm install
```

## Run

```bash
npm start
```

The first scan may download the QVAC OCR model. Later scans can reuse the local model.

## How it works

1. Pick a receipt image.
2. ReceiptScope asks QVAC to load the `OCR_LATIN` model.
3. QVAC performs local OCR.
4. Detected text blocks are displayed in the app.
5. The model is unloaded when the application quits.

## Privacy

ReceiptScope is designed around local processing. The application does not contain an AI cloud API, API key, analytics endpoint, or upload service. The selected image is provided to the local QVAC OCR runtime.

## License

MIT. See [LICENSE](./LICENSE).

## Attribution

Built with [QVAC](https://github.com/tetherto/qvac), Tether's open-source local AI SDK.
