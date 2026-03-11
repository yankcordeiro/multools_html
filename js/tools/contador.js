/* ==================== CONTADOR ==================== */
document.getElementById("btnContador").addEventListener("click", () => {
  clearAlert("contadorAlert");
  const file = document.getElementById("contadorFile").files[0];
  if (!file) { showAlert("contadorAlert","Selecione primeiro uma planilha Excel."); return; }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type:"array" });
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval:"" });

      if (!json.length) { showAlert("contadorAlert","Planilha vazia."); return; }
      if (!("eventos" in json[0]) || !("origens" in json[0])) {
        showAlert("contadorAlert","Colunas obrigatórias <code>eventos</code> e <code>origens</code> não encontradas."); return;
      }

      const evCount = {}, orCount = {};
      json.forEach(row => {
        const ev = String(row["eventos"] ?? "").split("/")[0].trim();
        if (ev) evCount[ev] = (evCount[ev] || 0) + 1;
        const or = String(row["origens"] ?? "").trim();
      });

      const evArr = Object.entries(evCount).sort((a,b) => b[1]-a[1]);
      const orArr = Object.entries(orCount).sort((a,b) => b[1]-a[1]);

      document.getElementById("tbEventos").innerHTML = evArr.map(([n,q],i) => `<tr><td>${i+1}</td><td>${n}</td><td style="text-align:right;">${q}</td></tr>`).join("");
      document.getElementById("totEventos").textContent = evArr.reduce((s,[,q])=>s+q,0);

      document.getElementById("tbOrigens").innerHTML = orArr.map(([n,q],i) => `<tr><td>${i+1}</td><td>${n}</td><td style="text-align:right;">${q}</td></tr>`).join("");
      document.getElementById("totOrigens").textContent = orArr.reduce((s,[,q])=>s+q,0);

      document.getElementById("contadorResult").style.display = "block";
      buildChart("chartEventos", evArr.map(([n])=>n), evArr.map(([,q])=>q));
      buildChart("chartOrigens", orArr.map(([n])=>n), orArr.map(([,q])=>q));
      showAlert("contadorAlert","Processamento concluído com sucesso.","ok");
    } catch(err) {
      showAlert("contadorAlert","Erro ao processar a planilha. Verifique se é um Excel válido.");
    }
  };
  reader.readAsArrayBuffer(file);
});
