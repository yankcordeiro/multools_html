/* ==================== SEPARADOR ==================== */
let sepArray = [], sepCsv = "";

function isExcelFile(filename) {
  return /\.(xlsx|xls)$/i.test(filename);
}

function readFileData(file) {
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
          let content = e.target.result;
          content = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(e.target.result));
          const rows = parseCsv(content);
          resolve(rows);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    }
  });
}

function toCsvUtf8(rows) {
  const csv = toCsv(rows);
  return "\uFEFF" + csv;
}

document.getElementById("btnSeparador").addEventListener("click", async () => {
  clearAlert("separadorAlert");
  sepArray = []; sepCsv = "";
  document.getElementById("separadorResult").style.display = "none";
  const file = document.getElementById("separadorFile").files[0];
  if (!file) { showAlert("separadorAlert","Selecione o arquivo (CSV ou Excel)."); return; }

  try {
    const data = await readFileData(file);
    const newData = [];
    data.forEach(row => {
      if (row.length >= 3) {
        const [name, email, phones] = row;
        String(phones ?? "").split(";").forEach(ph => {
          const c = ph.trim();
          if (c) newData.push([name, email, c]);
        });
      }
    });
    if (!newData.length) { showAlert("separadorAlert","Nenhum número encontrado no arquivo."); return; }

    sepArray = [["Nome","Email","Telefone"], ...newData];
    sepCsv = toCsvUtf8(sepArray);
    document.getElementById("tbSeparador").innerHTML = newData.slice(0,20).map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("");
    document.getElementById("separadorResult").style.display = "block";
    showAlert("separadorAlert",`Processamento concluído. <strong>${newData.length}</strong> linhas geradas.`, "ok");
  } catch(err) { showAlert("separadorAlert","Erro ao ler o arquivo. Verifique o formato."); }
});

document.getElementById("btnDownloadSep").addEventListener("click", () => { 
  if (sepCsv) {
    const blob = new Blob([sepCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "numeros_separados.csv" });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
});
