/* ==================== CONTADOR CHARS ==================== */
const charInput = document.getElementById("char-input");
if (charInput) {
  charInput.addEventListener("input", updateCharCount);
  function updateCharCount() {
    const text = charInput.value;
    document.getElementById("char-count").textContent = text.length;
    document.getElementById("char-count-nospace").textContent = text.replace(/\s/g,"").length;
    document.getElementById("word-count").textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById("line-count").textContent = text ? text.split("\n").length : 0;
    updateLimit("limit-meta", text.length, 160);
    updateLimit("limit-ads-title", text.length, 30);
    updateLimit("limit-ads-desc", text.length, 90);
    updateLimit("limit-insta", text.length, 2200);
    updateLimit("limit-bio", text.length, 150);
  }
  function updateLimit(id, current, max) {
    const el = document.getElementById(id);
    el.textContent = `${current}/${max}`;
    el.className = "limit-badge";
    if (current > max) el.classList.add("over");
    else if (current > max * 0.8) el.classList.add("ok");
  }
}
document.getElementById("btnLimparChars").addEventListener("click", () => { charInput.value = ""; updateCharCount(); });
