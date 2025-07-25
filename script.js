// SENHAS
const senhaRegistro = "registro123";
const senhaGestao = "admin123";

// ========== LOGIN AUTOMÁTICO AO CARREGAR ==========
document.addEventListener("DOMContentLoaded", () => {
  const isRegistroPage = window.location.pathname.includes("registro.html");
  const isGestaoPage = window.location.pathname.includes("gestao.html");

  if (isRegistroPage && sessionStorage.getItem("logadoRegistro") === "true") {
    mostrarRegistro();
  }

  if (isGestaoPage && sessionStorage.getItem("logadoGestao") === "true") {
    mostrarGestao();
    carregarRegistros();
    iniciarAtualizacaoAutomatica();
  }
});

// ========== FUNÇÕES DE LOGIN ==========
function verificarLoginRegistro() {
  const input = document.getElementById("senhaRegistro").value;
  const erro = document.getElementById("erroLoginRegistro");
  if (input === senhaRegistro) {
    sessionStorage.setItem("logadoRegistro", "true");
    mostrarRegistro();
  } else {
    erro.textContent = "Senha incorreta.";
  }
}

function verificarLoginGestao() {
  const input = document.getElementById("senhaGestao").value;
  const erro = document.getElementById("erroLoginGestao");
  if (input === senhaGestao) {
    sessionStorage.setItem("logadoGestao", "true");
    mostrarGestao();
    carregarRegistros();
    iniciarAtualizacaoAutomatica();
  } else {
    erro.textContent = "Senha incorreta.";
  }
}

// ========== FUNÇÕES VISUAIS ==========
function mostrarRegistro() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("registroContainer").style.display = "block";
}

function mostrarGestao() {
  document.getElementById("loginGestao").style.display = "none";
  document.getElementById("gestaoContainer").style.display = "block";
}

// ========== LOGOUT ==========
function logout() {
  sessionStorage.clear();
  window.location.reload();
}

function voltarInicio() {
  window.location.href = "index.html"; // ou o nome exato da página inicial"
}


// ========== REGISTRO DE FORMULÁRIO ==========
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registroForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const dados = {
        nome: form.nome.value.trim(),
        pessoas: form.pessoas.value,
        dataIda: form.dataIda.value,
        dataVolta: form.dataVolta.value,
        flexivel: form.flexivel.value,
        aeroporto: form.aeroporto.value,
        regime: form.regime.value,
        valor: form.valor.value,
        observacoes: form.observacoes.value.trim()
      };

      let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
      registros.push(dados);
      localStorage.setItem("registrosViagem", JSON.stringify(registros));

      form.reset();
      const mensagem = document.getElementById("mensagemSucesso");
      mensagem.textContent = "Dados registrados com sucesso!";
      setTimeout(() => mensagem.textContent = "", 3000);
    });
  }
});

// ========== EXIBIR REGISTROS ==========
function carregarRegistros() {
  const tabelaBody = document.querySelector("#tabelaRegistros tbody");
  if (!tabelaBody) return;

  tabelaBody.innerHTML = "";

  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

  registros.forEach(registro => {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${registro.nome}</td>
      <td>${registro.pessoas}</td>
      <td>${registro.dataIda} até ${registro.dataVolta}</td>
      <td>${registro.flexivel}</td>
      <td>${registro.aeroporto}</td>
      <td>${registro.regime}</td>
      <td>${registro.valor}</td>
      <td>${registro.observacoes}</td>
    `;

    tabelaBody.appendChild(linha);
  });
}

// ========== ATUALIZAÇÃO AUTOMÁTICA ==========
function iniciarAtualizacaoAutomatica() {
  setInterval(() => {
    if (document.getElementById("gestaoContainer").style.display === "block") {
      carregarRegistros();
    }
  }, 5000);
}

// ========== EXPORTAÇÃO ==========
function exportarCSV() {
  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

  if (registros.length === 0) {
    alert("Nenhum registro para exportar.");
    return;
  }

  const cabecalho = ["Nome", "Pessoas", "DataIda", "DataVolta", "Flexível", "Aeroporto", "Regime", "Valor (€)", "Observações"];
  const linhas = registros.map(r => [
    r.nome, r.pessoas, r.dataIda, r.dataVolta, r.flexivel, r.aeroporto, r.regime, r.valor, r.observacoes
  ]);

  let csvContent = "data:text/csv;charset=utf-8," + [cabecalho, ...linhas].map(e => e.join(",")).join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "registros_viagem.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

let tempoInatividade = 0;
const LIMITE_MINUTOS = 5;
const LIMITE_SEGUNDOS = LIMITE_MINUTOS * 60;
const AVISO_ANTES = 30; // segundos antes do logout para exibir aviso

let avisoTimeoutMostrado = false;

function resetarTimerInatividade() {
  tempoInatividade = 0;
  avisoTimeoutMostrado = false;
  esconderAvisoLogout();
}

function iniciarMonitoramentoInatividade() {
  document.addEventListener("mousemove", resetarTimerInatividade);
  document.addEventListener("keydown", resetarTimerInatividade);

  setInterval(() => {
    tempoInatividade++;

    if ((LIMITE_SEGUNDOS - tempoInatividade) <= AVISO_ANTES && !avisoTimeoutMostrado) {
      mostrarAvisoLogout(LIMITE_SEGUNDOS - tempoInatividade);
      avisoTimeoutMostrado = true;
    }

    if (tempoInatividade >= LIMITE_SEGUNDOS) {
      sessionStorage.clear();
      alert("Sessão expirada por inatividade.");
      window.location.reload();
    }

    atualizarContadorSessao(LIMITE_SEGUNDOS - tempoInatividade);
  }, 1000);
}

function mostrarAvisoLogout(segundosRestantes) {
  let aviso = document.createElement("div");
  aviso.id = "avisoLogout";
  aviso.innerHTML = `
    <strong>⚠️ Sessão prestes a expirar!</strong><br>
    Você será desconectado em <span id="contadorTempo">${segundosRestantes}</span> segundos.
  `;
  Object.assign(aviso.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#737a5e',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    zIndex: 9999,
    boxShadow: '0 0 8px rgba(0,0,0,0.2)',
    textAlign: 'center',
    fontSize: '15px'
  });
  document.body.appendChild(aviso);
}

function esconderAvisoLogout() {
  const aviso = document.getElementById("avisoLogout");
  if (aviso) aviso.remove();
}

function atualizarContadorSessao(segundos) {
  const contador = document.getElementById("contadorTempo");
  if (contador) {
    contador.textContent = segundos;
  }
}
