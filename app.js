const VERDE = "#0abf04";
const CORES = [
  "#0abf04","#2ecc71","#1abc9c","#27ae60",
  "#52be80","#82e0aa","#a9dfbf","#d5f5e3"
];

const LOGIN_USER = "mkt";
const LOGIN_PASS = "yank";

/* ==================== LOGIN ==================== */
document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const user = document.getElementById("login-user").value.trim();
  const pass = document.getElementById("login-pass").value.trim();
  const errorEl = document.getElementById("login-error");
  
  if (user === LOGIN_USER && pass === LOGIN_PASS) {
    sessionStorage.setItem("logged", "true");
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("main-app").style.display = "block";
    initTheme();
    showHomePage();
  } else {
    errorEl.textContent = "Usuário ou senha incorretos";
  }
});

document.getElementById("btn-logout").addEventListener("click", function() {
  this.classList.add("active");
  setTimeout(() => {
    sessionStorage.removeItem("logged");
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("main-app").style.display = "none";
    document.getElementById("login-user").value = "";
    document.getElementById("login-pass").value = "";
    this.classList.remove("active");
  }, 300);
});

/* ==================== NAVEGAÇÃO ==================== */
window.showHomePage = function() {
  document.getElementById("home-page").style.display = "block";
  document.getElementById("tools-page").style.display = "none";
  
  if (typeof clearInterval === "function") {
    clearInterval(weatherInterval);
    clearInterval(newsInterval);
  }
  
  loadWeather();
  loadNews();
  
  document.getElementById("menu-dropdown").classList.remove("show");
};

window.showToolsPage = function(tool) {
  document.getElementById("home-page").style.display = "none";
  document.getElementById("tools-page").style.display = "block";
  
  if (typeof clearInterval === "function") {
    clearInterval(weatherInterval);
    clearInterval(newsInterval);
  }
  
  const toolPanes = document.querySelectorAll("#tools-page .tab-pane");
  toolPanes.forEach(pane => pane.style.display = "none");
  
  const paneMap = {
    "contador": "pane-contador", "separador": "pane-separador", "formatador": "pane-formatador",
    "utm": "pane-utm", "whatsapp": "pane-whatsapp", "chars": "pane-contadorchars",
    "urls": "pane-urls", "qrcode": "pane-qrcode", "pdfjpg": "pane-pdfjpg",
    "removerfundo": "pane-removerfundo"
  };
  
  const paneId = paneMap[tool];
  if (paneId) {
    const pane = document.getElementById(paneId);
    if (pane) pane.style.display = "block";
  }
  
  document.getElementById("menu-dropdown").classList.remove("show");
};

/* ==================== WIDGETS ==================== */
let weatherInterval, newsInterval;

async function loadWeather() {
  const widget = document.getElementById("weather-widget");
  if (!widget) return;
  try {
    const res = await fetch("https://wttr.in/13564440?format=j1");
    const data = await res.json();
    const current = data.current_condition[0];
    widget.innerHTML = `
      <div class="weather-info">
        <div class="weather-temp">${current.temp_C}°C</div>
        <div class="weather-desc">${current.weatherDesc[0].value}</div>
        <div class="weather-location">São Carlos, SP</div>
      </div>
    `;
  } catch (e) { widget.innerHTML = '<div class="weather-error">Clima indisponível</div>'; }
  weatherInterval = setInterval(loadWeather, 300000);
}

async function loadNews() {
  const widget = document.getElementById("news-widget");
  if (!widget) return;
  try {
    const res = await fetch("https://newsdata.io/api/1/news?apikey=pub_demo&q=marketing&language=pt&size=3");
    const data = await res.json();
    if (data.results) {
      widget.innerHTML = data.results.map(n => `
        <div class="news-item">
          <a href="${n.link}" target="_blank">${n.title}</a>
        </div>
      `).join("");
    }
  } catch (e) { widget.innerHTML = '<div class="news-error">News indisponível</div>'; }
  newsInterval = setInterval(loadNews, 300000);
}

/* ==================== FUNCTIONS ==================== */
function showAlert(id, msg, tipo = "err") {
  const cls = tipo === "ok" ? "dg-alert-ok" : tipo === "info" ? "dg-alert-info" : "dg-alert-err";
  document.getElementById(id).innerHTML = `<div class="dg-alert ${cls}">${msg}</div>`;
}
function clearAlert(id) { document.getElementById(id).innerHTML = ""; }

function parseCsv(txt) {
  return txt.replace(/\r\n/g,"\n").split("\n").filter(Boolean).map(l => l.split(";"));
}

function toCsv(rows) {
  return rows.map(r => r.map(v => {
    v = String(v ?? "");
    return (v.includes(";") || v.includes('"') || v.includes("\n")) ? `"${v.replace(/"/g,'""')}"` : v;
  }).join(";")).join("\n");
}

function baixar(nome, conteudo) {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: nome });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

const charts = {};
function buildChart(id, labels, values) {
  if (charts[id]) charts[id].destroy();
  const ctx = document.getElementById(id).getContext("2d");
  charts[id] = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ data: values, backgroundColor: labels.map((_,i) => CORES[i % CORES.length]), borderRadius: 5, borderSkipped: false }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.y} ocorrência${c.parsed.y !== 1 ? "s" : ""}` } } },
      scales: {
        x: { ticks: { color: "rgba(255,255,255,0.55)", font: { family:"Montserrat", size:10 }, maxRotation:38 }, grid: { color: "rgba(255,255,255,0.04)" } },
        y: { ticks: { color: "rgba(255,255,255,0.45)", font: { family:"Montserrat", size:10 }, stepSize:1 }, grid: { color: "rgba(255,255,255,0.06)" } }
      }
    }
  });
}

/* ==================== THEME ==================== */
function initTheme() {
  const saved = localStorage.getItem("theme");
  const iconSun = document.getElementById("theme-icon-sun");
  const iconMoon = document.getElementById("theme-icon-moon");
  if (saved === "light") {
    document.body.classList.add("light-theme");
    if (iconSun) iconSun.style.display = "inline";
    if (iconMoon) iconMoon.style.display = "none";
  } else {
    document.body.classList.remove("light-theme");
    if (iconSun) iconSun.style.display = "none";
    if (iconMoon) iconMoon.style.display = "inline";
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");
  const isLight = document.body.classList.contains("light-theme");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  const iconSun = document.getElementById("theme-icon-sun");
  const iconMoon = document.getElementById("theme-icon-moon");
  if (isLight) {
    if (iconSun) iconSun.style.display = "inline";
    if (iconMoon) iconMoon.style.display = "none";
  } else {
    if (iconSun) iconSun.style.display = "none";
    if (iconMoon) iconMoon.style.display = "inline";
  }
}

/* ==================== INIT ==================== */
window.addEventListener("DOMContentLoaded", function() {
  if (sessionStorage.getItem("logged") === "true") {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("main-app").style.display = "block";
    initTheme();
    showHomePage();
  }

  window.toggleMenu = function() { document.getElementById("menu-dropdown").classList.toggle("show"); };
  document.addEventListener("click", function(e) {
    const menu = document.getElementById("menu-dropdown");
    const btn = document.getElementById("btn-menu");
    if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) menu.classList.remove("show");
  });

  document.getElementById("btn-theme").addEventListener("click", toggleTheme);
  document.getElementById("logo-link").addEventListener("click", function(e) { e.preventDefault(); showHomePage(); });

  document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", function() {
      const tool = this.dataset.tool;
      if (tool === "home") showHomePage();
      else showToolsPage(tool);
    });
  });

  ["contador","separador","formatador"].forEach(m => {
    const el = document.getElementById(`${m}File`);
    if (el) el.addEventListener("change", function() { document.getElementById(`${m}FileName`).textContent = this.files[0] ? this.files[0].name : "Nenhum arquivo selecionado"; });
  });
});
