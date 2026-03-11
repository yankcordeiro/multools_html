/* ==================== WHATSAPP ==================== */
document.getElementById("btnGerarWa").addEventListener("click", () => {
  const number = document.getElementById("wa-number").value.replace(/\D/g,"");
  const message = document.getElementById("wa-message").value.trim();
  const resultBox = document.getElementById("wa-result");
  const btnCopiar = document.getElementById("btnCopiarWa");
  const btnAbrir = document.getElementById("wa-link-abrir");
  if (!number) { resultBox.innerHTML = '<span class="utm-placeholder" style="color:#ff6b6b;">Por favor, insira um número de WhatsApp</span>'; return; }
  let waUrl = `https://wa.me/${number}`;
  if (message) waUrl += `?text=${encodeURIComponent(message)}`;
  resultBox.innerHTML = `<span class="utm-result-link">${waUrl}</span>`;
  btnCopiar.style.display = "inline-flex";
  btnAbrir.style.display = "inline-flex";
  btnAbrir.href = waUrl;
  btnCopiar.onclick = () => { navigator.clipboard.writeText(waUrl).then(() => { alert("Link copiado!"); }); };
});
