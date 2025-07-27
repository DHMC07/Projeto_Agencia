// ========== SENHAS ==========
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

  // Ativa aba selecionada por padrão (Round trip)
  const abaAtiva = document.querySelector(".tab.active");
  if (abaAtiva) selectTab(abaAtiva);
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

  // Preencher a "Data de Registro" automaticamente
  const dataRegistroInput = document.getElementById('dataRegistro');
  if (dataRegistroInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexado
    const day = String(today.getDate()).padStart(2, '0');
    dataRegistroInput.value = `${year}-${month}-${day}`;
  }
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
  window.location.href = "index.html";
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
        observacoes: form.observacoes.value.trim(),
        // NOVOS CAMPOS DE DATA AQUI
        dataRegistro: form.dataRegistro.value,
        dataProximoContato: form.dataProximoContato.value
      };

      let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
      registros.push(dados);
      localStorage.setItem("registrosViagem", JSON.stringify(registros));

      form.reset();
      const mensagem = document.getElementById("mensagemSucesso");
      mensagem.textContent = "Dados registrados com sucesso!";
      setTimeout(() => mensagem.textContent = "", 3000);

      // Opcional: Recarregar a tabela na página de gestão se estiver visível (após o registro)
      if (document.getElementById("gestaoContainer") && document.getElementById("gestaoContainer").style.display === "block") {
          carregarRegistros();
      }
    });
  }
});

// ========== AUTOCOMPLETE DE DESTINOS ==========
document.addEventListener("DOMContentLoaded", () => {
  const destinoInput = document.getElementById("destinoInput");
  const sugestoesEl = document.getElementById("sugestoes");
  const destinosSelecionados = document.getElementById("destinosSelecionados");
  const destinosHidden = document.getElementById("destinosHidden");

  let destinos = [];
  let selecionados = [];

  // Ajuste o caminho se 'destinos.json' não estiver na raiz do seu projeto ou em 'script.js'
  fetch("destinos.json") 
    .then(res => res.json())
    .then(data => destinos = data)
    .catch(err => console.error("Erro ao carregar destinos:", err));

  destinoInput.addEventListener("input", () => {
    const input = destinoInput.value.toLowerCase();
    sugestoesEl.innerHTML = "";

    if (input.length === 0) return;

    const filtrados = destinos.filter(dest => 
      dest.toLowerCase().includes(input) && !selecionados.includes(dest)
    ).slice(0, 5);

    filtrados.forEach(dest => {
      const li = document.createElement("li");
      li.textContent = dest;
      li.onclick = () => {
        selecionados.push(dest);
        atualizarDestinos();
        destinoInput.value = "";
        sugestoesEl.innerHTML = "";
      };
      sugestoesEl.appendChild(li);
    });
  });

  function atualizarDestinos() {
    destinosSelecionados.innerHTML = "";
    selecionados.forEach((dest, index) => {
      const span = document.createElement("span");
      span.className = "destino-tag";
      span.textContent = dest;
      span.onclick = () => {
        selecionados.splice(index, 1);
        atualizarDestinos();
      };
      destinosSelecionados.appendChild(span);
    });
    destinosHidden.value = selecionados.join(", ");
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

    // Garantir que os campos de data existam para evitar "undefined" na exibição
    const dataReg = registro.dataRegistro || 'N/A';
    const dataProxContato = registro.dataProximoContato || 'N/A';
    const observacoesTexto = registro.observacoes || 'N/A'; // Para garantir que sempre haja um valor

    linha.innerHTML = `
      <td>${registro.nome || 'N/A'}</td>
      <td>${registro.pessoas || 'N/A'}</td>
      <td>${registro.dataIda || 'N/A'} até ${registro.dataVolta || 'N/A'}</td>
      <td>${registro.flexivel || 'N/A'}</td>
      <td>${registro.aeroporto || 'N/A'}</td>
      <td>${registro.regime || 'N/A'}</td>
      <td>${registro.valor || 'N/A'}</td>
      <td>${observacoesTexto}</td>
      <td>${dataReg}</td>
      <td>${dataProxContato}</td>
    `;

    tabelaBody.appendChild(linha);
  });
}

// ========== ATUALIZAÇÃO AUTOMÁTICA ==========
function iniciarAtualizacaoAutomatica() {
  setInterval(() => {
    // Verifica se gestaoContainer existe e está visível antes de carregar registros
    const gestaoContainer = document.getElementById("gestaoContainer");
    if (gestaoContainer && gestaoContainer.style.display === "block") {
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

  // Adicionar os novos cabeçalhos para exportação CSV
  const cabecalho = ["Nome", "Pessoas", "DataIda", "DataVolta", "Flexível", "Aeroporto", "Regime", "Valor (€)", "Observações", "Data Registro", "Próximo Contato"];
  const linhas = registros.map(r => [
    r.nome, 
    r.pessoas, 
    r.dataIda, 
    r.dataVolta, 
    r.flexivel, 
    r.aeroporto, 
    r.regime, 
    r.valor, 
    // Escape observações que podem conter vírgulas ou quebras de linha
    `"${(r.observacoes || '').replace(/"/g, '""')}"`, 
    r.dataRegistro || '', // Garante que campos ausentes sejam string vazia
    r.dataProximoContato || '' // Garante que campos ausentes sejam string vazia
  ]);

  let csvContent = "data:text/csv;charset=utf-8," + [cabecalho.map(h => `"${h.replace(/"/g, '""')}"`).join(","), ...linhas.map(e => e.join(","))].join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "registros_viagem.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


// ========== INATIVIDADE ==========
let tempoInatividade = 0;
const LIMITE_MINUTOS = 5;
const LIMITE_SEGUNDOS = LIMITE_MINUTOS * 60;
const AVISO_ANTES = 30;

let avisoTimeoutMostrado = false;

function resetarTimerInatividade() {
  tempoInatividade = 0;
  avisoTimeoutMostrado = false;
  esconderAvisoLogout();
}

function iniciarMonitoramentoInatividade() {
  document.addEventListener("mousemove", resetarTimerInatividade);
  document.addEventListener("keydown", resetarTimerInatividade);
  document.addEventListener("click", resetarTimerInatividade); // Adicionado para cliques também

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
  // Evitar adicionar o aviso múltiplas vezes se a função for chamada repetidamente
  if (!document.getElementById("avisoLogout")) {
    document.body.appendChild(aviso);
  }
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

// ========== ABAS DE TIPO DE VIAGEM ==========
function selectTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active");

  const tipo = tab.textContent.trim().toLowerCase();
  const campoDataVolta = document.querySelector("input[name='dataVolta']");

  if (campoDataVolta) {
    if (tipo === "one way") {
      campoDataVolta.closest("label").style.display = "none";
      campoDataVolta.removeAttribute("required");
    } else {
      campoDataVolta.closest("label").style.display = "block";
      campoDataVolta.setAttribute("required", "true");
    }
  }
}