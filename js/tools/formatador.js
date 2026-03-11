/* ==================== FORMATADOR ==================== */
let fmtCsv = "";
let fmtData = [];

function limpar(n) { return String(n ?? "").replace(/\D/g,""); }
function formatar(n) {
  let num = limpar(n);
  if (num.length === 10) num = "6789".includes(num[2]) ? "55" + num.slice(0,2) + "9" + num.slice(2) : "55" + num;
  else if (num.length === 11) num = "55" + num;
  return num;
}
function tipo(n) { const s = String(n ?? ""); if (s.length !== 13) return "Inválido"; return s[4] === "9" ? "Celular" : "Fixo"; }
function gerarLinkWa(num) {
  const n = limpar(num);
  if (n.length >= 10) return `https://wa.me/${n}`;
  return "";
}

function isExcelFile(filename) {
  return /\.(xlsx|xls)$/i.test(filename);
}

function readFileDataFormatador(file) {
  return new Promise((resolve, reject) => {
    if (isExcelFile(file.name)) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
          const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
          const rows = json.length > 0 ? [Object.keys(json[0]), ...json.map(row => Object.values(row))] : [];
          resolve(rows.map(row => row.map(String)));
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          let content = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(e.target.result));
          const rows = parseCsv(content);
          resolve(rows);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    }
  });
}

function aplicarFormatador(linhas, idxTel, incluirWa) {
  const resultado = [];
  const cols = [...linhas[0], "Numero_Formatado", "Tipo_Telefone"];
  if (incluirWa) cols.push("Link_WhatsApp");
  resultado.push(cols);
  
  for (let i = 1; i < linhas.length; i++) {
    const row = [...linhas[i]];
    if (row.length === 1 && row[0] === "") continue;
    const fmt = formatar(row[idxTel] ?? "");
    const tp = tipo(fmt);
    row.push(fmt, tp);
    if (incluirWa) row.push(gerarLinkWa(fmt));
    resultado.push(row);
  }
  return resultado;
}

function toCsvUtf8(rows) {
  const csv = toCsv(rows);
  return "\uFEFF" + csv;
}

function renderFormatador(novas, incluirWa) {
  const headRow = novas[0];
  document.getElementById("fmtHead").innerHTML = `<tr>${headRow.map(c=>`<th>${c}</th>`).join("")}</tr>`;
  document.getElementById("fmtBody").innerHTML = novas.slice(1,21).map(r => `<tr>${r.map(v=>`<td>${v??""}</td>`).join("")}</tr>`).join("");
  document.getElementById("formatadorResult").style.display = "block";
}

document.getElementById("btnFormatador").addEventListener("click", async () => {
  clearAlert("formatadorAlert");
  fmtCsv = "";
  fmtData = [];
  document.getElementById("formatadorResult").style.display = "none";
  const incluirWa = document.getElementById("fmt-incluir-wa").checked;
  const file = document.getElementById("formatadorFile").files[0];
  if (!file) { showAlert("formatadorAlert","Selecione o arquivo (CSV ou Excel)."); return; }

  try {
    const linhas = await readFileDataFormatador(file);
    if (!linhas.length) { showAlert("formatadorAlert","Arquivo vazio."); return; }
    const idxTel = linhas[0].findIndex(h => ["telefone","phone"].some(k => String(h).toLowerCase().includes(k)));
    if (idxTel === -1) { showAlert("formatadorAlert","Coluna de telefone não encontrada no cabeçalho."); return; }
    const novas = aplicarFormatador(linhas, idxTel, incluirWa);
    fmtData = novas;
    fmtCsv = toCsvUtf8(novas);
    renderFormatador(novas, incluirWa);
    showAlert("formatadorAlert","Telefones formatados com sucesso.","ok");
  } catch(err) { showAlert("formatadorAlert","Erro ao processar o arquivo."); }
});

document.getElementById("btnFormatarDaqui").addEventListener("click", () => {
  if (!sepArray.length) { showAlert("separadorAlert","Primeiro processe um arquivo no separador."); return; }
  const incluirWa = document.getElementById("fmt-incluir-wa").checked;
  const novas = aplicarFormatador(sepArray, 2, incluirWa);
  fmtData = novas;
  fmtCsv = toCsvUtf8(novas);
  setTimeout(() => {
    const tabEl = document.getElementById("tab-formatador");
    if (tabEl && bootstrap) bootstrap.Tab.getOrCreateInstance(tabEl).show();
  }, 100);
  clearAlert("formatadorAlert");
  renderFormatador(novas, incluirWa);
  showAlert("formatadorAlert","Telefones formatados a partir do resultado do Separador.", "ok");
});

document.getElementById("fmt-incluir-wa").addEventListener("change", function() {
  if (fmtData.length > 0) {
    const idxTel = 2;
    const novas = aplicarFormatador(fmtData, idxTel, this.checked);
    fmtData = novas;
    fmtCsv = toCsvUtf8(novas);
    renderFormatador(novas, this.checked);
  }
});

document.getElementById("btnDownloadFmt").addEventListener("click", () => { 
  if (fmtCsv) {
    const blob = new Blob([fmtCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "telefones_formatados.csv" });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
});
