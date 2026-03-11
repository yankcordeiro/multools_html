/* ==================== VALIDADOR URLS ==================== */
function checkUrlOnline(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ valid: true, status: "Online" });
    img.onerror = () => resolve({ valid: false, status: "Offline" });
    img.src = url.startsWith("http") ? url + "/favicon.ico" : "https://" + url + "/favicon.ico";
  });
}

document.getElementById("btnValidarUrls").addEventListener("click", async () => {
  const input = document.getElementById("url-input").value.trim();
  if (!input) return;
  const urls = input.split("\n").filter(u => u.trim());
  const tbody = document.getElementById("url-tbody");
  const resultsDiv = document.getElementById("url-results");
  tbody.innerHTML = ""; resultsDiv.style.display = "block";
  let okCount = 0, errorCount = 0;
  for (const url of urls) {
    let trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith("http")) {
      trimmedUrl = "https://" + trimmedUrl;
    }
    const result = await checkUrlOnline(trimmedUrl);
    const row = document.createElement("tr");
    row.innerHTML = `<td><span class="url-status-icon">${result.valid ? "✅" : "❌"}</span></td><td style="word-break:break-all;">${url.trim()}</td><td>${result.status}</td>`;
    tbody.appendChild(row);
    if (result.valid) okCount++; else errorCount++;
  }
  document.getElementById("url-ok-count").textContent = `${okCount} OK`;
  document.getElementById("url-error-count").textContent = `${errorCount} Erros`;
  document.getElementById("url-total-count").textContent = `Total: ${urls.length}`;
});
