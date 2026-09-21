const pick = document.querySelector("#pick");
const copy = document.querySelector("#copy");
const status = document.querySelector("#status");
const output = document.querySelector("#output");
const empty = document.querySelector("#empty");

let extracted = "";

function setStatus(message, type = "") {
  status.textContent = message;
  status.dataset.type = type;
}

window.receiptScope.onStatus(({ message, type }) => {
  setStatus(message, type);
  if (type === "loading" || type === "scanning") {
    pick.disabled = true;
    pick.textContent = type === "loading" ? "Loading local model…" : "Scanning…";
  } else {
    pick.disabled = false;
    pick.textContent = "Scan another receipt";
  }
});

pick.addEventListener("click", async () => {
  try {
    const imagePath = await window.receiptScope.chooseReceipt();
    if (!imagePath) return;

    const result = await window.receiptScope.scanReceipt(imagePath);
    extracted = result.lines.map((line) => line.text).join("\n");

    output.textContent = extracted || "No text was detected.";
    output.hidden = false;
    empty.hidden = true;
    copy.disabled = !extracted;
  } catch (error) {
    setStatus(error?.message || "Something went wrong.", "error");
    pick.disabled = false;
    pick.textContent = "Try again";
  }
});

copy.addEventListener("click", async () => {
  if (!extracted) return;
  await navigator.clipboard.writeText(extracted);
  copy.textContent = "Copied";
  setTimeout(() => (copy.textContent = "Copy text"), 1200);
});