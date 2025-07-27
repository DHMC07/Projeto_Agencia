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
        dataRegistro: form.dataRegistro.value,
        dataProximoContato: form.dataProximoContato.value,
        nomeAgente: form.NomeAgente.value,
        destinos: document.getElementById("destinosHidden").value // <<<< NOVO: Salvar destinos
      };

      let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
      registros.push(dados);
      localStorage.setItem("registrosViagem", JSON.stringify(registros));

      form.reset();
      // Limpa os destinos selecionados no formulário de registro
      document.getElementById("destinosSelecionados").innerHTML = "";
      document.getElementById("destinosHidden").value = "";

      const mensagem = document.getElementById("mensagemSucesso");
      mensagem.textContent = "Dados registrados com sucesso!";
      setTimeout(() => mensagem.textContent = "", 3000);

      if (document.getElementById("gestaoContainer") && document.getElementById("gestaoContainer").style.display === "block") {
          carregarRegistros();
      }
    });
  }
});

// ========== AUTOCOMPLETE DE DESTINOS (PARA PÁGINA DE REGISTRO) ==========
document.addEventListener("DOMContentLoaded", () => {
  const destinoInput = document.getElementById("destinoInput");
  const sugestoesEl = document.getElementById("sugestoes");
  const destinosSelecionados = document.getElementById("destinosSelecionados");
  const destinosHidden = document.getElementById("destinosHidden");

  let destinos = [];
  let selecionados = []; // Variável para rastrear destinos selecionados

  fetch("destinos.json") 
    .then(res => res.json())
    .then(data => destinos = data)
    .catch(err => console.error("Erro ao carregar destinos:", err));

  if (destinoInput) {
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
  }

  // Função para atualizar os destinos selecionados (usada também no modal de edição)
  window.atualizarDestinosDisplay = function(elementId, hiddenInputId, currentSelected) {
    const displayElement = document.getElementById(elementId);
    const hiddenInputElement = document.getElementById(hiddenInputId);
    if (!displayElement || !hiddenInputElement) return;

    displayElement.innerHTML = "";
    currentSelected.forEach((dest, index) => {
      const span = document.createElement("span");
      span.className = "destino-tag";
      span.textContent = dest;
      span.onclick = () => {
        currentSelected.splice(index, 1);
        atualizarDestinosDisplay(elementId, hiddenInputId, currentSelected);
      };
      displayElement.appendChild(span);
    });
    hiddenInputElement.value = currentSelected.join(", ");
    selecionados = currentSelected; // Atualiza 'selecionados' para o formulário de registro
  }

  // Função para o formulário de registro
  function atualizarDestinos() {
    atualizarDestinosDisplay("destinosSelecionados", "destinosHidden", selecionados);
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
      noRecordsRow.innerHTML = `<td colspan="13" style="text-align: center; padding: 20px;">Nenhum registro encontrado.</td>`; // Colspan ajustado para 13
      tabelaBody.appendChild(noRecordsRow);
      return;
  }

  registros.forEach((registro, index) => { 
    const linha = document.createElement("tr");

    const dataReg = registro.dataRegistro || 'N/A';
    const dataProxContato = registro.dataProximoContato || 'N/A';
    const observacoesTexto = registro.observacoes || 'N/A';
    const nomeAgente = registro.nomeAgente || 'N/A';
    const destinosCliente = registro.destinos || 'N/A'; // <<<< NOVO: Obter destinos do registro

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
      <td>${destinosCliente}</td> <td>
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

  // <<<< NOVO: Preencher campos de destino no modal de edição
  const editDestinosInput = document.getElementById("editDestinoInput");
  const editDestinosDisplay = document.getElementById("editDestinosSelecionados");
  const editDestinosHidden = document.getElementById("editDestinosHidden");
  let editSelectedDestinos = [];

  if (registroParaEditar.destinos) {
      editSelectedDestinos = registroParaEditar.destinos.split(', ').filter(d => d.trim() !== '');
  }
  window.atualizarDestinosDisplay("editDestinosSelecionados", "editDestinosHidden", editSelectedDestinos);

  // Lógica para autocomplete de destinos no modal
  if (editDestinosInput) {
      editDestinosInput.oninput = () => {
          const input = editDestinosInput.value.toLowerCase();
          const sugestoesEl = document.getElementById("editSugestoes");
          sugestoesEl.innerHTML = "";
          if (input.length === 0) return;

          let todosDestinos = []; // Precisa carregar destinos novamente para o modal se 'destinos' global não estiver acessível
          fetch("destinos.json")
              .then(res => res.json())
              .then(data => {
                  todosDestinos = data;
                  const filtrados = todosDestinos.filter(dest =>
                      dest.toLowerCase().includes(input) && !editSelectedDestinos.includes(dest)
                  ).slice(0, 5);

                  filtrados.forEach(dest => {
                      const li = document.createElement("li");
                      li.textContent = dest;
                      li.onclick = () => {
                          editSelectedDestinos.push(dest);
                          window.atualizarDestinosDisplay("editDestinosSelecionados", "editDestinosHidden", editSelectedDestinos);
                          editDestinosInput.value = "";
                          sugestoesEl.innerHTML = "";
                      };
                      sugestoesEl.appendChild(li);
                  });
              })
              .catch(err => console.error("Erro ao carregar destinos para edição:", err));
      };
  }
  // Fim da lógica de autocomplete para o modal

  document.getElementById('editModal').style.display = 'block';
}

document.addEventListener("DOMContentLoaded", function() {
  const editForm = document.getElementById("editForm");
  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const index = document.getElementById('editIndex').value;
      let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

      registros[index] = {
        nome: document.getElementById('editNome').value.trim(),
        pessoas: document.getElementById('editPessoas').value,
        dataIda: document.getElementById('editDataIda').value,
        dataVolta: document.getElementById('editDataVolta').value,
        flexivel: document.getElementById('editFlexivel').value,
        aeroporto: document.getElementById('editAeroporto').value,
        regime: document.getElementById('editRegime').value,
        valor: document.getElementById('editValor').value,
        observacoes: document.getElementById('editObservacoes').value.trim(),
        dataRegistro: document.getElementById('editDataRegistro').value,
        dataProximoContato: document.getElementById('editDataProximoContato').value,
        nomeAgente: document.getElementById('editNomeAgente').value,
        destinos: document.getElementById('editDestinosHidden').value // <<<< NOVO: Salvar destinos editados
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
    fecharModal(); // Chamar fecharModal para limpar os campos
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

  const cabecalho = ["Nome", "Pessoas", "DataIda", "DataVolta", "Flexível", "Aeroporto", "Regime", "Valor (€)", "Observações", "Data Registro", "Próximo Contato", "Nome Agente", "Destinos"]; // <<< NOVO: "Destinos" no cabeçalho CSV
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
    `"${(r.destinos || '').replace(/"/g, '""')}"` // <<< NOVO: Valor dos Destinos
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