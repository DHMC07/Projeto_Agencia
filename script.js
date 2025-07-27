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
    iniciarMonitoramentoInatividade();
  }

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
    iniciarMonitoramentoInatividade();
  } else {
    erro.textContent = "Senha incorreta.";
  }
}

// ========== FUNÇÕES VISUAIS ==========
function mostrarRegistro() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("registroContainer").style.display = "block";

  const dataRegistroInput = document.getElementById('dataRegistro');
  if (dataRegistroInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
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

// ========== REGISTRO DE FORMULÁRIO (PARA PÁGINA DE REGISTRO) ==========
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registroForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const dataIda = form.dataIda.value;
      const dataVolta = form.dataVolta.value;

      // Validação de datas
      if (dataVolta && dataIda && new Date(dataVolta) < new Date(dataIda)) {
          alert("A Data de Volta não pode ser anterior à Data de Ida.");
          return; // Impede o envio do formulário
      }

      const dados = {
        nome: form.nome.value.trim(),
        pessoas: form.pessoas.value,
        dataIda: dataIda,
        dataVolta: dataVolta,
        flexivel: form.flexivel.value,
        aeroporto: form.aeroporto.value,
        regime: form.regime.value,
        valor: form.valor.value,
        observacoes: form.observacoes.value.trim(),
        dataRegistro: form.dataRegistro.value,
        dataProximoContato: form.dataProximoContato.value,
        nomeAgente: form.NomeAgente.value,
        destinos: document.getElementById("destinosHidden").value // <<<< VERIFICAR SE O ID 'destinosHidden' ESTÁ CORRETO NO REGISTRO.HTML
      };

      let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
      registros.push(dados);
      localStorage.setItem("registrosViagem", JSON.stringify(registros));

      form.reset();
      // Limpa os destinos selecionados no formulário de registro
      document.getElementById("destinosSelecionados").innerHTML = "";
      document.getElementById("destinosHidden").value = "";
      document.getElementById("destinoInput").value = ""; // Limpa também o input do autocomplete
      
      const mensagem = document.getElementById("mensagemSucesso");
      mensagem.textContent = "Dados registrados com sucesso!";
      setTimeout(() => mensagem.textContent = "", 3000);

      if (document.getElementById("gestaoContainer") && document.getElementById("gestaoContainer").style.display === "block") {
          carregarRegistros();
      }
    });
  }
});

// ========== AUTOCOMPLETE DE DESTINOS (PARA PÁGINA DE REGISTRO E EDIÇÃO) ==========
// Variável global para armazenar todos os destinos carregados
let todosDestinos = [];

document.addEventListener("DOMContentLoaded", () => {
  // Carrega os destinos uma vez para uso em registro e edição
  fetch("destinos.json") 
    .then(res => res.json())
    .then(data => todosDestinos = data)
    .catch(err => console.error("Erro ao carregar destinos:", err));

  const destinoInput = document.getElementById("destinoInput");
  const sugestoesEl = document.getElementById("sugestoes");
  const destinosSelecionados = document.getElementById("destinosSelecionados");
  const destinosHidden = document.getElementById("destinosHidden");

  let selecionadosRegistro = []; // Variável para rastrear destinos selecionados no formulário de registro

  if (destinoInput) {
    destinoInput.addEventListener("input", () => {
      handleAutocompleteInput(destinoInput, sugestoesEl, destinosSelecionados, destinosHidden, selecionadosRegistro);
    });
  }

  // Função genérica para lidar com o autocomplete
  function handleAutocompleteInput(inputElement, suggestionsElement, displayElement, hiddenInputElement, currentSelectedArray) {
    const input = inputElement.value.toLowerCase();
    suggestionsElement.innerHTML = "";

    if (input.length === 0) return;

    const filtrados = todosDestinos.filter(dest => 
      dest.toLowerCase().includes(input) && !currentSelectedArray.includes(dest)
    ).slice(0, 5);

    filtrados.forEach(dest => {
      const li = document.createElement("li");
      li.textContent = dest;
      li.onclick = () => {
        currentSelectedArray.push(dest);
        updateDestinosDisplay(displayElement.id, hiddenInputElement.id, currentSelectedArray, inputElement);
        inputElement.value = "";
        suggestionsElement.innerHTML = "";
      };
      suggestionsElement.appendChild(li);
    });
  }

  // Função genérica para atualizar a exibição e o campo hidden dos destinos
  window.updateDestinosDisplay = function(displayElementId, hiddenInputId, currentSelectedArray, inputElementToClear = null) {
    const displayElement = document.getElementById(displayElementId);
    const hiddenInputElement = document.getElementById(hiddenInputId);
    if (!displayElement || !hiddenInputElement) return;

    displayElement.innerHTML = "";
    currentSelectedArray.forEach((dest, index) => {
      const span = document.createElement("span");
      span.className = "destino-tag";
      span.textContent = dest;
      span.onclick = () => {
        currentSelectedArray.splice(index, 1);
        updateDestinosDisplay(displayElementId, hiddenInputId, currentSelectedArray);
      };
      displayElement.appendChild(span);
    });
    hiddenInputElement.value = currentSelectedArray.join(", ");
    if (inputElementToClear) {
        inputElementToClear.focus(); // Mantém o foco no input após adicionar
    }
  }

  // Define a função de atualização para o formulário de registro (para garantir que selecionadosRegistro seja atualizado)
  window.atualizarDestinosRegistro = function() {
      updateDestinosDisplay("destinosSelecionados", "destinosHidden", selecionadosRegistro);
  }
});


// ========== EXIBIR REGISTROS (PARA PÁGINA DE GESTÃO) ==========
function carregarRegistros() {
  const tabelaBody = document.querySelector("#tabelaRegistros tbody");
  if (!tabelaBody) return;

  tabelaBody.innerHTML = "";

  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

  if (registros.length === 0) {
      const noRecordsRow = document.createElement("tr");
      noRecordsRow.innerHTML = `<td colspan="13" style="text-align: center; padding: 20px;">Nenhum registro encontrado.</td>`; 
      tabelaBody.appendChild(noRecordsRow);
      return;
  }

  registros.forEach((registro, index) => { 
    const linha = document.createElement("tr");

    const dataReg = registro.dataRegistro || 'N/A';
    const dataProxContato = registro.dataProximoContato || 'N/A';
    const observacoesTexto = registro.observacoes || 'N/A';
    const nomeAgente = registro.nomeAgente || 'N/A';
    const destinosCliente = registro.destinos || 'N/A'; 

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
      <td>${nomeAgente}</td>
      <td>${destinosCliente}</td>
      <td>
        <button class="btn-acao editar-btn" onclick="editarRegistro(${index})">Editar</button>
        <button class="btn-acao eliminar-btn" onclick="eliminarRegistro(${index})">Eliminar</button>
      </td>
    `;

    tabelaBody.appendChild(linha);
  });
}

// ========== FUNÇÕES DE EDIÇÃO E ELIMINAÇÃO (PARA PÁGINA DE GESTÃO) ==========

function eliminarRegistro(index) {
  if (confirm("Tem certeza que deseja eliminar este registro?")) {
    let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
    registros.splice(index, 1);
    localStorage.setItem("registrosViagem", JSON.stringify(registros));
    carregarRegistros();
    alert("Registro eliminado com sucesso!");
  }
}

function editarRegistro(index) {
  let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
  const registroParaEditar = registros[index];

  if (!registroParaEditar) {
    alert("Registro não encontrado para edição.");
    return;
  }

  document.getElementById('editIndex').value = index;

  document.getElementById('editNome').value = registroParaEditar.nome || '';
  document.getElementById('editPessoas').value = registroParaEditar.pessoas || '';
  document.getElementById('editDataIda').value = registroParaEditar.dataIda || '';
  document.getElementById('editDataVolta').value = registroParaEditar.dataVolta || '';
  document.getElementById('editFlexivel').value = registroParaEditar.flexivel || 'Não';
  document.getElementById('editAeroporto').value = registroParaEditar.aeroporto || 'Lisboa';
  document.getElementById('editRegime').value = registroParaEditar.regime || 'Nada incluído';
  document.getElementById('editValor').value = registroParaEditar.valor || '';
  document.getElementById('editObservacoes').value = registroParaEditar.observacoes || '';
  document.getElementById('editDataRegistro').value = registroParaEditar.dataRegistro || '';
  document.getElementById('editDataProximoContato').value = registroParaEditar.dataProximoContato || '';
  document.getElementById('editNomeAgente').value = registroParaEditar.nomeAgente || 'Soaila Maia';

  // Lógica para preencher e gerenciar destinos no modal de edição
  const editDestinosInput = document.getElementById("editDestinoInput");
  const editDestinosDisplay = document.getElementById("editDestinosSelecionados");
  const editDestinosHidden = document.getElementById("editDestinosHidden");
  
  // Limpa o estado anterior do modal antes de preencher
  editDestinosInput.value = '';
  document.getElementById("editSugestoes").innerHTML = '';

  let editSelectedDestinos = [];
  if (registroParaEditar.destinos) {
      editSelectedDestinos = registroParaEditar.destinos.split(', ').filter(d => d.trim() !== '');
  }
  window.updateDestinosDisplay(editDestinosDisplay.id, editDestinosHidden.id, editSelectedDestinos);

  // Re-atribui o event listener para o input do modal, usando a função genérica
  editDestinosInput.oninput = () => {
      handleAutocompleteInput(editDestinosInput, document.getElementById("editSugestoes"), editDestinosDisplay, editDestinosHidden, editSelectedDestinos);
  };
  
  document.getElementById('editModal').style.display = 'block';
}

document.addEventListener("DOMContentLoaded", function() {
  const editForm = document.getElementById("editForm");
  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const dataIda = document.getElementById('editDataIda').value;
      const dataVolta = document.getElementById('editDataVolta').value;

      // Validação de datas no modal de edição
      if (dataVolta && dataIda && new Date(dataVolta) < new Date(dataIda)) {
          alert("A Data de Volta não pode ser anterior à Data de Ida.");
          return; // Impede o envio do formulário
      }

      const index = document.getElementById('editIndex').value;
      let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

      registros[index] = {
        nome: document.getElementById('editNome').value.trim(),
        pessoas: document.getElementById('editPessoas').value,
        dataIda: dataIda,
        dataVolta: dataVolta,
        flexivel: document.getElementById('editFlexivel').value,
        aeroporto: document.getElementById('editAeroporto').value,
        regime: document.getElementById('editRegime').value,
        valor: document.getElementById('editValor').value,
        observacoes: document.getElementById('editObservacoes').value.trim(),
        dataRegistro: document.getElementById('editDataRegistro').value,
        dataProximoContato: document.getElementById('editDataProximoContato').value,
        nomeAgente: document.getElementById('editNomeAgente').value,
        destinos: document.getElementById('editDestinosHidden').value
      };

      localStorage.setItem("registrosViagem", JSON.stringify(registros));
      carregarRegistros();
      fecharModal();
      alert("Registro atualizado com sucesso!");
    });
  }
});

function fecharModal() {
  document.getElementById('editModal').style.display = 'none';
  // Limpar os campos do modal e a display de tags para o próximo uso
  document.getElementById('editDestinosSelecionados').innerHTML = '';
  document.getElementById('editDestinosHidden').value = '';
  document.getElementById('editDestinoInput').value = '';
  document.getElementById('editSugestoes').innerHTML = '';
}

window.onclick = function(event) {
  const modal = document.getElementById('editModal');
  if (event.target == modal) {
    modal.style.display = "none";
    fecharModal(); 
  }
}

// ========== ATUALIZAÇÃO AUTOMÁTICA ==========
function iniciarAtualizacaoAutomatica() {
  setInterval(() => {
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

  const cabecalho = ["Nome", "Pessoas", "DataIda", "DataVolta", "Flexível", "Aeroporto", "Regime", "Valor (€)", "Observações", "Data Registro", "Próximo Contato", "Nome Agente", "Destinos"];
  const linhas = registros.map(r => [
    r.nome, 
    r.pessoas, 
    r.dataIda, 
    r.dataVolta, 
    r.flexivel, 
    r.aeroporto, 
    r.regime, 
    r.valor, 
    `"${(r.observacoes || '').replace(/"/g, '""')}"`, 
    r.dataRegistro || '', 
    r.dataProximoContato || '',
    r.nomeAgente || '',
    `"${(r.destinos || '').replace(/"/g, '""')}"`
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
  document.addEventListener("click", resetarTimerInatividade); 

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

// ========== ABAS DE TIPO DE VIAGEM (PARA PÁGINA DE REGISTRO) ==========
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