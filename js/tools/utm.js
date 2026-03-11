/* ==================== UTM ==================== */
let utmSavedLinks = JSON.parse(localStorage.getItem("utmSavedLinks") || "[]");
let currentUtmLink = "";

function renderUtmSaved() {
  const list = document.getElementById("utm-saved-list");
  if (!utmSavedLinks.length) { list.innerHTML = '<div class="utm-empty">Nenhum link salvo ainda</div>'; return; }
  list.innerHTML = utmSavedLinks.map((link, i) => `
    <div class="utm-saved-item">
      <span class="utm-saved-name" title="${link.url}">${link.name}</span>
      <div class="utm-saved-actions">
        <button onclick="copyUtmLink('${link.url}')" title="Copiar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
        <button onclick="deleteUtmLink(${i})" title="Excluir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
      </div>
    </div>
  `).join("");
}

function saveUtmLink() {
  const url = document.getElementById("utm-url").value.trim();
  const source = document.getElementById("utm-source").value.trim();
  const campaign = document.getElementById("utm-campaign").value.trim();
  if (!url || !source) return;
  const name = campaign || source;
  const exists = utmSavedLinks.find(l => l.url === currentUtmLink);
  if (!exists) {
    utmSavedLinks.unshift({ name: name, url: currentUtmLink });
    if (utmSavedLinks.length > 10) utmSavedLinks.pop();
    localStorage.setItem("utmSavedLinks", JSON.stringify(utmSavedLinks));
    renderUtmSaved();
  }
}

window.copyUtmLink = function(url) { navigator.clipboard.writeText(url).then(() => { alert("Link copiado!"); }); };
window.deleteUtmLink = function(index) { utmSavedLinks.splice(index, 1); localStorage.setItem("utmSavedLinks", JSON.stringify(utmSavedLinks)); renderUtmSaved(); };

document.getElementById("btnGerarUtm").addEventListener("click", () => {
  const baseUrl = document.getElementById("utm-url").value.trim();
  const source = document.getElementById("utm-source").value.trim();
  const medium = document.getElementById("utm-medium").value.trim();
  const campaign = document.getElementById("utm-campaign").value.trim();
  const term = document.getElementById("utm-term").value.trim();
  const content = document.getElementById("utm-content").value.trim();
  if (!baseUrl || !source) { document.getElementById("utm-result").innerHTML = '<span class="utm-placeholder">Preencha a URL e o Nome da Campanha (utm_source)</span>'; return; }
  let url = baseUrl.startsWith("http") ? baseUrl : "https://" + baseUrl;
  const params = new URLSearchParams();
  if (source) params.append("utm_source", source);
  if (medium) params.append("utm_medium", medium);
  if (campaign) params.append("utm_campaign", campaign);
  if (term) params.append("utm_term", term);
  if (content) params.append("utm_content", content);
  currentUtmLink = url + (url.includes("?") ? "&" : "?") + params.toString();
  document.getElementById("utm-result").innerHTML = `<span class="utm-result-link">${currentUtmLink}</span>`;
  document.getElementById("btnCopiarUtm").style.display = "inline-flex";
  saveUtmLink();
});

document.getElementById("btnCopiarUtm").addEventListener("click", () => { if (currentUtmLink) { navigator.clipboard.writeText(currentUtmLink).then(() => { alert("Link copiado!"); }); } });
document.getElementById("btnLimparUtm").addEventListener("click", () => { utmSavedLinks = []; localStorage.setItem("utmSavedLinks", JSON.stringify(utmSavedLinks)); renderUtmSaved(); });
renderUtmSaved();
