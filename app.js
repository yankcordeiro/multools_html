const VERDE = "#0abf04";
const CORES = [
  "#0abf04","#2ecc71","#1abc9c","#27ae60",
  "#52be80","#82e0aa","#a9dfbf","#d5f5e3"
];

const LOGIN_USER = "mkt";
const LOGIN_PASS = "yank";

function showAlert(id, msg, tipo = "err") {
  const cls = tipo === "ok" ? "dg-alert-ok" : tipo === "info" ? "dg-alert-info" : "dg-alert-err";
  document.getElementById(id).innerHTML =
    `<div class="dg-alert ${cls}">${msg}</div>`;
}
function clearAlert(id) { document.getElementById(id).innerHTML = ""; }

function parseCsv(txt) {
  return txt.replace(/\r\n/g,"\n").split("\n")
    .filter(Boolean)
    .map(l => l.split(";"));
}

function toCsv(rows) {
  return rows.map(r =>
    r.map(v => {
      v = String(v ?? "");
      return (v.includes(";") || v.includes('"') || v.includes("\n"))
        ? `"${v.replace(/"/g,'""')}"` : v;
    }).join(";")
  ).join("\n");
}

function baixar(nome, conteudo) {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: nome });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* Login */
document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const user = document.getElementById("login-user").value.trim();
  const pass = document.getElementById("login-pass").value.trim();
  const errorEl = document.getElementById("login-error");
  
  if (user === LOGIN_USER && pass === LOGIN_PASS) {
    sessionStorage.setItem("logged", "true");
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("main-app").style.display = "block";
    errorEl.textContent = "";
  } else {
    errorEl.textContent = "Usuário ou senha incorretos";
  }
});

/* Logout */
document.getElementById("btn-logout").addEventListener("click", function() {
  sessionStorage.removeItem("logged");
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("main-app").style.display = "none";
  document.getElementById("login-user").value = "";
  document.getElementById("login-pass").value = "";
});

/* Verifica sessão ao carregar */
window.addEventListener("DOMContentLoaded", function() {
  if (sessionStorage.getItem("logged") === "true") {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("main-app").style.display = "block";
  }
});

/* File labels */
["contador","separador","formatador"].forEach(m => {
  document.getElementById(`${m}File`).addEventListener("change", function() {
    document.getElementById(`${m}FileName`).textContent =
      this.files[0] ? this.files[0].name : "Nenhum arquivo selecionado";
  });
});

/* Gráficos */
const charts = {};
function buildChart(id, labels, values) {
  if (charts[id]) charts[id].destroy();
  const ctx = document.getElementById(id).getContext("2d");
  charts[id] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map((_,i) => CORES[i % CORES.length]),
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: c => ` ${c.parsed.y} ocorrência${c.parsed.y !== 1 ? "s" : ""}` }
        }
      },
      scales: {
        x: {
          ticks: { color: "rgba(255,255,255,0.55)", font: { family:"Montserrat", size:10 }, maxRotation:38 },
          grid:  { color: "rgba(255,255,255,0.04)" }
        },
        y: {
          ticks: { color: "rgba(255,255,255,0.45)", font: { family:"Montserrat", size:10 }, stepSize:1 },
          grid:  { color: "rgba(255,255,255,0.06)" }
        }
      }
    }
  });
}

/* CONTADOR */
document.getElementById("btnContador").addEventListener("click", () => {
  clearAlert("contadorAlert");
  const file = document.getElementById("contadorFile").files[0];
  if (!file) { showAlert("contadorAlert","Selecione primeiro uma planilha Excel."); return; }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb   = XLSX.read(new Uint8Array(e.target.result), { type:"array" });
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval:"" });

      if (!json.length) { showAlert("contadorAlert","Planilha vazia."); return; }

      if (!("eventos" in json[0]) || !("origens" in json[0])) {
        showAlert("contadorAlert",
          "Colunas obrigatórias <code>eventos</code> e <code>origens</code> não encontradas.");
        return;
      }

      const evCount = {}, orCount = {};
      json.forEach(row => {
        const ev = String(row["eventos"] ?? "").split("/")[0].trim();
        if (ev) evCount[ev] = (evCount[ev] || 0) + 1;
        const or = String(row["origens"] ?? "");
        if (or) orCount[or] = (orCount[or] || 0) + 1;
      });

      const evArr = Object.entries(evCount).sort((a,b) => b[1]-a[1]);
      const orArr = Object.entries(orCount).sort((a,b) => b[1]-a[1]);

      document.getElementById("tbEventos").innerHTML =
        evArr.map(([n,q],i) =>
          `<tr><td>${i+1}</td><td>${n}</td><td style="text-align:right;">${q}</td></tr>`
        ).join("");
      const totEv = evArr.reduce((s,[,q])=>s+q,0);
      document.getElementById("totEventos").textContent = totEv;

      document.getElementById("tbOrigens").innerHTML =
        orArr.map(([n,q],i) =>
          `<tr><td>${i+1}</td><td>${n}</td><td style="text-align:right;">${q}</td></tr>`
        ).join("");
      const totOr = orArr.reduce((s,[,q])=>s+q,0);
      document.getElementById("totOrigens").textContent = totOr;

      document.getElementById("contadorResult").style.display = "block";

      buildChart("chartEventos", evArr.map(([n])=>n), evArr.map(([,q])=>q));
      buildChart("chartOrigens", orArr.map(([n])=>n), orArr.map(([,q])=>q));

      showAlert("contadorAlert","Processamento concluído com sucesso.","ok");
    } catch(err) {
      console.error(err);
      showAlert("contadorAlert","Erro ao processar a planilha. Verifique se é um Excel válido.");
    }
  };
  reader.readAsArrayBuffer(file);
});

/* SEPARADOR */
let sepArray = [];
let sepCsv   = "";

document.getElementById("btnSeparador").addEventListener("click", () => {
  clearAlert("separadorAlert");
  sepArray = []; sepCsv = "";
  document.getElementById("separadorResult").style.display = "none";

  const file = document.getElementById("separadorFile").files[0];
  if (!file) { showAlert("separadorAlert","Selecione o arquivo CSV."); return; }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data    = parseCsv(e.target.result);
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

      if (!newData.length) {
        showAlert("separadorAlert","Nenhum número encontrado no arquivo.");
        return;
      }

      sepArray = [["Nome","Email","Telefone"], ...newData];
      sepCsv   = toCsv(sepArray);

      document.getElementById("tbSeparador").innerHTML =
        newData.slice(0,20).map(r =>
          `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`
        ).join("");

      document.getElementById("separadorResult").style.display = "block";
      showAlert("separadorAlert",
        `Processamento concluído. <strong>${newData.length}</strong> linhas geradas.`, "ok");
    } catch(err) {
      console.error(err);
      showAlert("separadorAlert","Erro ao ler o CSV. Verifique se o delimitador é <code>;</code>.");
    }
  };
  reader.readAsText(file, "utf-8");
});

document.getElementById("btnDownloadSep").addEventListener("click", () => {
  if (sepCsv) baixar("numeros_separados.csv", sepCsv);
});

/* FORMATADOR */
let fmtCsv = "";

function limpar(n) { return String(n ?? "").replace(/\D/g,""); }

function formatar(n) {
  let num = limpar(n);
  if (num.length === 10) {
    num = "6789".includes(num[2])
      ? "55" + num.slice(0,2) + "9" + num.slice(2)
      : "55" + num;
  } else if (num.length === 11) {
    num = "55" + num;
  }
  return num;
}

function tipo(n) {
  const s = String(n ?? "");
  if (s.length !== 13) return "Inválido";
  return s[4] === "9" ? "Celular" : "Fixo";
}

function aplicarFormatador(linhas, idxTel) {
  const resultado = [];
  const header = [...linhas[0], "Numero_Formatado", "Tipo_Telefone"];
  resultado.push(header);
  for (let i = 1; i < linhas.length; i++) {
    const row = [...linhas[i]];
    if (row.length === 1 && row[0] === "") continue;
    const fmt = formatar(row[idxTel] ?? "");
    row.push(fmt, tipo(fmt));
    resultado.push(row);
  }
  return resultado;
}

function renderFormatador(novas) {
  document.getElementById("fmtHead").innerHTML =
    `<tr>${novas[0].map(c=>`<th>${c}</th>`).join("")}</tr>`;
  document.getElementById("fmtBody").innerHTML =
    novas.slice(1,21).map(r =>
      `<tr>${r.map(v=>`<td>${v??""}</td>`).join("")}</tr>`
    ).join("");
  document.getElementById("formatadorResult").style.display = "block";
}

document.getElementById("btnFormatador").addEventListener("click", () => {
  clearAlert("formatadorAlert");
  fmtCsv = "";
  document.getElementById("formatadorResult").style.display = "none";

  const file = document.getElementById("formatadorFile").files[0];
  if (!file) { showAlert("formatadorAlert","Selecione o arquivo CSV."); return; }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const linhas = parseCsv(e.target.result);
      if (!linhas.length) { showAlert("formatadorAlert","CSV vazio."); return; }

      const idxTel = linhas[0].findIndex(h =>
        ["telefone","phone"].some(k => String(h).toLowerCase().includes(k))
      );
      if (idxTel === -1) {
        showAlert("formatadorAlert","Coluna de telefone não encontrada no cabeçalho.");
        return;
      }

      const novas = aplicarFormatador(linhas, idxTel);
      fmtCsv = toCsv(novas);
      renderFormatador(novas);
      showAlert("formatadorAlert","Telefones formatados com sucesso.","ok");
    } catch(err) {
      console.error(err);
      showAlert("formatadorAlert","Erro ao processar o CSV.");
    }
  };
  reader.readAsText(file, "utf-8");
});

document.getElementById("btnFormatarDaqui").addEventListener("click", () => {
  if (!sepArray.length) {
    showAlert("separadorAlert","Primeiro processe um CSV no separador.");
    return;
  }
  const novas = aplicarFormatador(sepArray, 2);
  fmtCsv = toCsv(novas);

  bootstrap.Tab.getOrCreateInstance(
    document.getElementById("tab-formatador")
  ).show();

  clearAlert("formatadorAlert");
  renderFormatador(novas);
  showAlert("formatadorAlert",
    "Telefones formatados a partir do resultado do Separador.", "ok");
});

document.getElementById("btnDownloadFmt").addEventListener("click", () => {
  if (fmtCsv) baixar("telefones_formatados.csv", fmtCsv);
});
