/* ==================== REMOVER FUNDO ==================== */
document.getElementById("btnRemoverFundo").addEventListener("click", async () => {
  const fileInput = document.getElementById("remover-fundo-file");
  const loadingDiv = document.getElementById("remover-fundo-loading");
  const resultDiv = document.getElementById("remover-fundo-result");
  
  if (!fileInput.files[0]) {
    resultDiv.innerHTML = '<div class="dg-alert dg-alert-err">Selecione uma imagem</div>';
    return;
  }
  
  loadingDiv.style.display = "block";
  resultDiv.innerHTML = "";
  
  try {
    const file = fileInput.files[0];
    const base64 = await fileToBase64(file);
    
    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");
    
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": "dummypass123456"
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error("API retornou erro");
    }
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    resultDiv.innerHTML = `
      <img src="${url}" style="max-width:100%;border-radius:8px;margin-bottom:1rem;">
      <br>
      <a href="${url}" download="imagem_sem_fundo.png" class="btn-dg btn-dg-verde">Baixar Imagem</a>
    `;
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = '<div class="dg-alert dg-alert-err">Erro ao processar. Para usar esta função, é necessária uma API key do remove.bg (50 chamadas-grátis/mês). Acesse: <a href="https://www.remove.bg/api" target="_blank">remove.bg/api</a></div>';
  } finally {
    loadingDiv.style.display = "none";
  }
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
