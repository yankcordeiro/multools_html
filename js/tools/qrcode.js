/* ==================== QR CODE ==================== */
document.getElementById("btnGerarQr").addEventListener("click", () => {
  const content = document.getElementById("qr-content").value.trim();
  const size = parseInt(document.getElementById("qr-size").value);
  const resultBox = document.getElementById("qr-result");
  const btnDownload = document.getElementById("btnDownloadQr");
  if (!content) { resultBox.innerHTML = '<span class="utm-placeholder" style="color:#ff6b6b;">Por favor, insira o conteúdo do QR Code</span>'; return; }
  if (typeof QRCode === "undefined") { resultBox.innerHTML = '<span class="utm-placeholder" style="color:#ff6b6b;">Biblioteca QRCode não carregou. Recarregue a página.</span>'; return; }
  resultBox.innerHTML = "";
  const qrContainer = document.createElement("div");
  resultBox.appendChild(qrContainer);
  new QRCode(qrContainer, {
    text: content,
    width: size,
    height: size,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  setTimeout(() => {
    const canvas = qrContainer.querySelector("canvas");
    const img = qrContainer.querySelector("img");
    if (canvas) {
      btnDownload.style.display = "inline-flex";
      btnDownload.onclick = () => { const link = document.createElement("a"); link.download = "qrcode.png"; link.href = canvas.toDataURL("image/png"); link.click(); };
    } else if (img) {
      btnDownload.style.display = "inline-flex";
      btnDownload.onclick = () => { const link = document.createElement("a"); link.download = "qrcode.png"; link.href = img.src; link.click(); };
    }
  }, 100);
});
