/* ==================== PDF ↔ IMG ==================== */
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

document.getElementById("btnPdfToImg").addEventListener("click", async () => {
  const fileInput = document.getElementById("pdf-to-img-file");
  const format = document.getElementById("pdf-to-img-format").value;
  const quality = parseFloat(document.getElementById("pdf-to-img-quality").value);
  const resultDiv = document.getElementById("pdf-to-img-result");
  
  if (!fileInput.files[0]) {
    resultDiv.innerHTML = '<div class="dg-alert dg-alert-err">Selecione um arquivo PDF</div>';
    return;
  }
  
  resultDiv.innerHTML = '<div class="dg-alert dg-alert-info">Convertendo...aguarde.</div>';
  
  try {
    const file = fileInput.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const zip = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: quality });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      
      const dataUrl = canvas.toDataURL(format, 0.9);
      zip.push({ name: `pagina_${i}.${format === "image/jpeg" ? "jpg" : "png"}`, data: dataUrl });
    }
    
    if (zip.length === 1) {
      const link = document.createElement("a");
      link.href = zip[0].data;
      link.download = zip[0].name;
      link.click();
      resultDiv.innerHTML = '<div class="dg-alert dg-alert-ok">Imagem gerada com sucesso!</div>';
    } else {
      resultDiv.innerHTML = '<div class="dg-alert dg-alert-ok">' + zip.length + ' páginas convertidas. Abaixo:</div>';
      zip.forEach((img, idx) => {
        const btn = document.createElement("a");
        btn.href = img.data;
        btn.download = img.name;
        btn.className = "btn-dg btn-dg-outline me-2 mb-2";
        btn.textContent = "Baixar página " + (idx + 1);
        resultDiv.appendChild(btn);
      });
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = '<div class="dg-alert dg-alert-err">Erro ao converter: ' + err.message + '</div>';
  }
});

document.getElementById("btnImgToPdf").addEventListener("click", async () => {
  const fileInput = document.getElementById("img-to-pdf-files");
  const resultDiv = document.getElementById("img-to-pdf-result");
  
  if (!fileInput.files.length) {
    resultDiv.innerHTML = '<div class="dg-alert dg-alert-err">Selecione pelo menos uma imagem</div>';
    return;
  }
  
  resultDiv.innerHTML = '<div class="dg-alert dg-alert-info">Convertendo...aguarde.</div>';
  
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    const files = Array.from(fileInput.files).sort((a, b) => a.name.localeCompare(b.name));
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imgData = await readFileAsDataURL(file);
      
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = imgData;
      });
      
      const imgWidth = img.width;
      const imgHeight = img.height;
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;
      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;
      
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", x, y, width, height);
    }
    
    pdf.save("convertido.pdf");
    resultDiv.innerHTML = '<div class="dg-alert dg-alert-ok">PDF gerado com sucesso!</div>';
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = '<div class="dg-alert dg-alert-err">Erro ao converter: ' + err.message + '</div>';
  }
});

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
