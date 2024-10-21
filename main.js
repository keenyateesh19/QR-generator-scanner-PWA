import "/style.css";
import logo from "/qrify-logo.svg";
import QRcode from "qrcode";
import QrScanner from "qr-scanner";

document.getElementById("app").innerHTML = `
    <header class="navbar">
        <img src=${logo} alt="QRify Logo" class="navbar__logo">
    </header>
    <main>
        <div class="tab-selector">
            <input type="radio" name="tab-switch" id="generate" class="tab__input" checked value="generate">
            <label for="generate" class="tab__item">
                Generate
            </label>
            <input type="radio" name="tab-switch" id="scan" class="tab__input" value="scan">
            <label for="scan" class="tab__item">
                Scan
            </label>
        </div>
        <div class="generate-tab">
            <div class="generate-tab__accordions">
                <div class="generate-tab__accordion open">
                    <div class="accordion__header">
                        <h2>Content</h2>
                        <img src="/down-chevron.svg">
                    </div>
                    <div class="accordion__body">
                        <label for="url">
                            URL<br>
                            <div class="text-field">
                                <input type="text" id="url" name="url" placeholder="Paste your link here" value="https://keenyateesh.com">
                                <span class="error-msg display">*Please enter the link</span>
                            </div>
                        </label>
                        <a href="#qrcode" class="primary-btn">Generate</a>
                    </div>
                </div>
                <div class="generate-tab__accordion">
                    <div class="accordion__header">
                        <h2>Customize</h2>
                        <img src="/down-chevron.svg">
                    </div>
                    <div class="accordion__body">
                        <label for="bg-color">
                            Background Color
                        </label><br>
                        <div class="color-selectors">
                            <input type="color" name="bg-color" id="bg-color" value="#ffffff">
                        <input type="text" value="#ffffff" id="bg-color-value">
                        <span class="error-msg display">*</span>
                        </div>
                        <label for="fg-color">
                            Foreground Color
                        </label><br>
                        <div class="color-selectors">
                            <input type="color" name="fg-color" id="fg-color" value="#000000">
                        <input type="text" value="#000000" id="fg-color-value">
                        <span class="error-msg display">*Enter valid hex code</span>
                        </div>
                        <span>
                            Error Correction
                        </span><br>
                        <div class="btn-group">
                            <input type="radio" name="error-correction" value="L" id="low">
                            <label for="low" class="error-level">Low</label>
                            <input type="radio" name="error-correction" value="M" id="medium">
                            <label for="medium" class="error-level">Medium</label>
                            <input type="radio" name="error-correction" value="Q"
                            id="quaritle">
                            <label for="quaritle" class="error-level">Quartile</label>
                            <input type="radio" name="error-correction" value="H" checked id="high">
                            <label for="high" class="error-level">High</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="generate-tab__qr generate-tab__accordion">
                <canvas id="qrcode"></canvas>
                <a href="" id="download" class="primary-btn">Download</a>
            </div>
        </div>
        <div class="scan-tab">
            <div class="scan-tab__accordion">
                <div class="camera-container">
                    <video id="camera-stream"></video>
                    <div class="overlay"></div>
                </div>
            </div>
        </div>
        <div class="modal-overlay">
            <div class="modal">
            <input type="text" disabled id="qr-content">
            <div class="button-group">
                <button id="copy" class="primary-btn copy">Copy</button>
            <button id="close" class="primary-btn">Close</button>
            </div>
          </div>
        </div>
    </main>
`;

// Switching Tabs Generate and Scan
const tabs = document.querySelectorAll("[name='tab-switch']");
const generateTab = document.querySelector(".generate-tab");
const scanTab = document.querySelector(".scan-tab");
const videoStream = document.querySelector("#camera-stream");
const scanner = new QrScanner(
  videoStream,
  (result) => {
    scanner.stop();
    showModal(result.data);
  },
  { returnDetailedScanResult: true }
);

tabs.forEach((tab) => {
  tab.addEventListener("change", (e) => {
    if (e.target.value === "generate") {
      scanTab.style.display = "none";
      generateTab.style.display = "flex";
      scanner.stop();
    } else {
      generateTab.style.display = "none";
      scanTab.style.display = "block";
      scanner.start().catch((er) => {
        alert(er);
      });
    }
  });
});

// Accordion Interaction
const accordionHeader = document.querySelectorAll(".accordion__header");

accordionHeader.forEach((header) => {
  header.addEventListener("click", (e) => {
    e.stopPropagation();
    const accordionContainer = e.target.closest(".generate-tab__accordion");
    accordionContainer.classList.toggle("open");
  });
});

// Input Validation
const error = document.querySelector(".text-field > span");
const urlText = document.querySelector("#url");
const showError = function (
  e,
  errorType = "*Cannot generate QR without content"
) {
  error.textContent = errorType;
  e.target.value === ""
    ? error.classList.remove("display")
    : error.classList.add("display");
};
urlText.addEventListener("input", showError);

// Sync Color Input and Text Input
const bgColor = document.querySelector("#bg-color");
const fgColor = document.querySelector("#fg-color");
// Select the text input fields
const bgColorValue = document.querySelector("#bg-color-value");
const fgColorValue = document.querySelector("#fg-color-value");

const updateTxtInput = (e) => {
  e.target.nextElementSibling.value = e.target.value;
};

bgColor.addEventListener("input", updateTxtInput);
fgColor.addEventListener("input", updateTxtInput);

// Error Message for Invalid Hex Code

const isValidHexCode = function (hex) {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexPattern.test(hex);
};

const updateColor = function (e) {
  if (isValidHexCode(e.target.value)) {
    e.target.nextElementSibling.classList.add("display");
    e.target.previousElementSibling.value = e.target.value;
  } else {
    e.target.nextElementSibling.classList.remove("display");
  }
};

//Update Color

bgColorValue.addEventListener("input", updateColor);
fgColorValue.addEventListener("input", updateColor);

// Generate QR Code

const qrCanvas = document.querySelector("#qrcode");
const generateBtn = document.querySelector('label[for="url"] + .primary-btn');

const maxError = function (errorContent) {
  if (errorContent === null) {
    error.textContent = errorContent.message;
    error.classList.remove("display");
  }
};

const generateQR = () => {
  QRcode.toCanvas(
    qrCanvas,
    urlText.value,
    {
      height: 312,
      width: 312,
      errorCorrectionLevel: document.querySelectorAll(
        'input[name="error-correction"]:checked'
      ),
      color: { light: bgColorValue.value, dark: fgColorValue.value },
    },
    maxError
  );
  downloadQR();
};

generateBtn.addEventListener("click", (e) => {
  if (
    urlText.value === "" ||
    !isValidHexCode(bgColorValue.value) ||
    !isValidHexCode(fgColorValue.value)
  )
    e.preventDefault();
  else generateQR();
});

// Color Change QR Update

[bgColor, fgColor].forEach((input) => {
  input.addEventListener("input", generateQR);
});

const downloadBtn = document.querySelector("#download");

// Create Downloadable Link

async function downloadQR() {
  const uri = await QRcode.toDataURL(urlText.value, {
    height: 512,
    width: 512,
    errorCorrectionLevel: document.querySelectorAll(
      'input[name="error-correction"]:checked'
    ),
    color: { light: bgColorValue.value, dark: fgColorValue.value },
  });
  downloadBtn.setAttribute("href", uri);
  downloadBtn.setAttribute("download", `${urlText.value}`);
}

generateQR();

const qrContent = document.querySelector(".qr-content");
const modal = document.querySelector(".modal-overlay");

const showModal = (qrResult) => {
  qrContent.value = qrResult;
  modal.style.display = "flex";
};

const copyBtn = document.querySelector("#copy");
copyBtn.addEventListener("click", (e) => {
  e.preventDefault();
  qrContent.select();
  qrContent.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(qrContent.value);
  copyBtn.textContent = "Copied!";
});

const closeBtn = document.querySelector("#close");
closeBtn.addEventListener("click", (e) => {
  modal.style.display = "none";
  scanner.start();
});
