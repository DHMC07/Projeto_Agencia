// ========== SENHAS ==========
const senhaRegistro = "registro123";
const senhaGestao = "admin123";

let todosDestinos = [];
let selecionadosRegistro = [];
let editSelectedDestinos = [];

// ========== INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname;

  fetch("destinos.json")
    .then(res => res.json())
    .then(data => todosDestinos = [...new Set(data)].sort())
    .catch(err => console.error("Erro ao carregar destinos:", err));

  if (page.includes("registro.html")) {
    if (sessionStorage.getItem("logadoRegistro") === "true") {
      mostrarRegistro();
    }

    document.getElementById("formRegistroLogin")?.addEventListener("submit", e => {
      e.preventDefault();
      verificarLogin("registro");
    });

    document.getElementById("registroForm")?.addEventListener("submit", handleRegistroFormSubmit);

    const destinoInput = document.getElementById("destinoInput");
    destinoInput?.addEventListener("input", () => {
      handleAutocompleteInput(destinoInput, "sugestoes", "destinosSelecionados", "destinosHidden", selecionadosRegistro);
    });

    const today = new Date().toISOString().split("T")[0];
    const dataReg = document.getElementById("dataRegistro");
    if (dataReg) dataReg.value = today;

    const roundTripTab = document.querySelector(".tab.active");
    if (roundTripTab) selectTab(roundTripTab);

  } else if (page.includes("gestao.html")) {
    if (sessionStorage.getItem("logadoGestao") === "true") {
      mostrarGestao();
      carregarRegistros();
    }

    document.getElementById("formGestao")?.addEventListener("submit", e => {
      e.preventDefault();
      verificarLogin("gestao");
    });

    document.getElementById("btnExportar")?.addEventListener("click", exportarCSV);
    document.getElementById("btnSair")?.addEventListener("click", logout);
    document.getElementById("closeModalBtn")?.addEventListener("click", fecharModal);
    document.getElementById("cancelEdit")?.addEventListener("click", fecharModal);
    document.getElementById("editForm")?.addEventListener("submit", handleEditFormSubmit);

    const editInput = document.getElementById("editDestinoInput");
    editInput?.addEventListener("input", () => {
      handleAutocompleteInput(editInput, "editSugestoes", "editDestinosSelecionados", "editDestinosHidden", editSelectedDestinos);
    });

    window.onclick = function (event) {
      const modal = document.getElementById('editModal');
      if (event.target == modal) fecharModal();
    };
  }
});

// ========== LOGIN ==========
function verificarLogin(tipo) {
  const senhaInputId = tipo === "registro" ? "senhaRegistro" : "senhaGestao";
  const senhaCorreta = tipo === "registro" ? senhaRegistro : senhaGestao;
  const sessionKey = tipo === "registro" ? "logadoRegistro" : "logadoGestao";
  const input = document.getElementById(senhaInputId);
  const senhaDigitada = input?.value.trim();
  const erro = document.getElementById(tipo === "registro" ? "erroLoginRegistro" : "erroLoginGestao");

  if (senhaDigitada === senhaCorreta) {
    sessionStorage.setItem(sessionKey, "true");
    if (tipo === "registro") {
      mostrarRegistro();
    } else {
      mostrarGestao();
      carregarRegistros();
    }
    if (erro) erro.textContent = "";
  } else {
    if (erro) erro.textContent = "Senha incorreta. Tente novamente.";
  }
}



function mostrarRegistro() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("registroContainer").style.display = "block";
}

function mostrarGestao() {
  document.getElementById("loginGestao").style.display = "none";
  document.getElementById("gestaoContainer").style.display = "block";
}

// ========== NAVEGAÇÃO ==========
function logout() {
  sessionStorage.clear();
  window.location.reload();
}
function voltarInicio() {
  window.location.href = "index.html";
}

// ========== AUTOCOMPLETE ==========
function handleAutocompleteInput(inputEl, sugestoesId, displayId, hiddenId, arr) {
  const valor = inputEl.value.toLowerCase();
  const sugestoesEl = document.getElementById(sugestoesId);
  const displayEl = document.getElementById(displayId);
  const hiddenEl = document.getElementById(hiddenId);

  sugestoesEl.innerHTML = "";
  if (!valor) return;

  const resultados = todosDestinos.filter(dest => dest.toLowerCase().includes(valor) && !arr.includes(dest)).slice(0, 5);
  resultados.forEach(dest => {
    const li = document.createElement("li");
    li.textContent = dest;
    li.onclick = () => {
      arr.push(dest);
      inputEl.value = "";
      sugestoesEl.innerHTML = "";
      atualizarDestinos(displayEl, hiddenEl, arr);
    };
    sugestoesEl.appendChild(li);
  });
}

function atualizarDestinos(displayEl, hiddenEl, arr) {
  displayEl.innerHTML = "";
  arr.forEach((dest, index) => {
    const tag = document.createElement("span");
    tag.className = "destino-tag";
    tag.textContent = dest;
    tag.onclick = () => {
      arr.splice(index, 1);
      atualizarDestinos(displayEl, hiddenEl, arr);
    };
    displayEl.appendChild(tag);
  });
  hiddenEl.value = arr.join(", ");
}

// ========== TABS ==========
function selectTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active");
  const tipo = tab.textContent.toLowerCase();
  const campoVolta = document.querySelector("input[name='dataVolta']");
  if (campoVolta) {
    if (tipo.includes("one way")) {
      campoVolta.closest("label").style.display = "none";
      campoVolta.removeAttribute("required");
    } else {
      campoVolta.closest("label").style.display = "block";
      campoVolta.setAttribute("required", true);
    }
  }
}

// ========== REGISTRO ==========
function handleRegistroFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const dataIda = form.dataIda.value;
  const dataVolta = form.dataVolta.value;
  if (dataVolta && new Date(dataVolta) < new Date(dataIda)) {
    alert("A Data de Volta não pode ser anterior à Data de Ida.");
    return;
  }

  const dados = {
    nome: form.nome.value.trim(),
    pessoas: form.pessoas.value,
    dataIda,
    dataVolta,
    flexivel: form.flexivel.value,
    aeroporto: form.aeroporto.value,
    regime: form.regime.value,
    valor: form.valor.value,
    observacoes: form.observacoes.value.trim(),
    dataRegistro: form.dataRegistro.value,
    dataProximoContato: form.dataProximoContato.value,
    nomeAgente: form.NomeAgente.value,
    destinos: form.destinos.value
  };

  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
  registros.push(dados);
  localStorage.setItem("registrosViagem", JSON.stringify(registros));

  form.reset();
  document.getElementById("destinosSelecionados").innerHTML = "";
  document.getElementById("destinosHidden").value = "";
  selecionadosRegistro = [];

  const msg = document.getElementById("mensagemSucesso");
  if (msg) {
    msg.textContent = "Dados registrados com sucesso!";
    setTimeout(() => msg.textContent = "", 3000);
  }
}

// ========== GESTÃO ==========
function carregarRegistros() {
  const tbody = document.querySelector("#tabelaRegistros tbody");
  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
  tbody.innerHTML = "";

  if (registros.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="13">Nenhum registro encontrado.</td>`;
    tbody.appendChild(row);
    return;
  }

  registros.forEach((r, i) => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${r.nome}</td>
      <td>${r.pessoas}</td>
      <td>${formatarData(r.dataIda)} até ${formatarData(r.dataVolta)}</td>
      <td>${r.flexivel}</td>
      <td>${r.aeroporto}</td>
      <td>${r.regime}</td>
      <td>${r.valor}</td>
      <td>${r.observacoes}</td>
      <td>${formatarData(r.dataRegistro)}</td>
      <td>${formatarData(r.dataProximoContato)}</td>
      <td>${r.nomeAgente}</td>
      <td>${r.destinos}</td>
      <td>
        <button class="editar-btn" data-index="${i}">Editar</button>
        <button class="eliminar-btn" data-index="${i}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(linha);
  });

  document.querySelectorAll(".editar-btn").forEach(btn => {
    btn.onclick = () => editarRegistro(+btn.dataset.index);
  });
  document.querySelectorAll(".eliminar-btn").forEach(btn => {
    btn.onclick = () => eliminarRegistro(+btn.dataset.index);
  });
}

function formatarData(dataStr) {
  if (!dataStr) return "N/A";
  const d = new Date(dataStr);
  return d.toLocaleDateString("pt-PT");
}

function eliminarRegistro(i) {
  if (confirm("Deseja eliminar este registro?")) {
    const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
    registros.splice(i, 1);
    localStorage.setItem("registrosViagem", JSON.stringify(registros));
    carregarRegistros();
  }
}

function editarRegistro(i) {
  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
  const r = registros[i];
  if (!r) return;

  document.getElementById("editIndex").value = i;
  document.getElementById("editNome").value = r.nome;
  document.getElementById("editPessoas").value = r.pessoas;
  document.getElementById("editDataIda").value = r.dataIda;
  document.getElementById("editDataVolta").value = r.dataVolta;
  document.getElementById("editFlexivel").value = r.flexivel;
  document.getElementById("editAeroporto").value = r.aeroporto;
  document.getElementById("editRegime").value = r.regime;
  document.getElementById("editValor").value = r.valor;
  document.getElementById("editObservacoes").value = r.observacoes;
  document.getElementById("editDataRegistro").value = r.dataRegistro;
  document.getElementById("editDataProximoContato").value = r.dataProximoContato;
  document.getElementById("editNomeAgente").value = r.nomeAgente;

  editSelectedDestinos = r.destinos.split(",").map(s => s.trim());
  atualizarDestinos(document.getElementById("editDestinosSelecionados"), document.getElementById("editDestinosHidden"), editSelectedDestinos);

  document.getElementById("editModal").style.display = "block";
}

function handleEditFormSubmit(e) {
  e.preventDefault();
  const i = document.getElementById("editIndex").value;
  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

  registros[i] = {
    nome: document.getElementById("editNome").value,
    pessoas: document.getElementById("editPessoas").value,
    dataIda: document.getElementById("editDataIda").value,
    dataVolta: document.getElementById("editDataVolta").value,
    flexivel: document.getElementById("editFlexivel").value,
    aeroporto: document.getElementById("editAeroporto").value,
    regime: document.getElementById("editRegime").value,
    valor: document.getElementById("editValor").value,
    observacoes: document.getElementById("editObservacoes").value,
    dataRegistro: document.getElementById("editDataRegistro").value,
    dataProximoContato: document.getElementById("editDataProximoContato").value,
    nomeAgente: document.getElementById("editNomeAgente").value,
    destinos: document.getElementById("editDestinosHidden").value
  };

  localStorage.setItem("registrosViagem", JSON.stringify(registros));
  carregarRegistros();
  fecharModal();
}

function fecharModal() {
  document.getElementById("editModal").style.display = "none";
}

// ========== EXPORTAÇÃO ==========
function exportarCSV() {
  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
  if (!registros.length) return alert("Nenhum registro para exportar.");

  const header = ["Nome", "Pessoas", "DataIda", "DataVolta", "Flexível", "Aeroporto", "Regime", "Valor", "Observações", "DataRegistro", "ProxContato", "Agente", "Destinos"];
  const rows = registros.map(r => [
    r.nome, r.pessoas, r.dataIda, r.dataVolta, r.flexivel, r.aeroporto, r.regime, r.valor, r.observacoes, r.dataRegistro, r.dataProximoContato, r.nomeAgente, r.destinos
  ]);

  const csv = [header, ...rows].map(l => l.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "registros_viagem.csv";
  a.click();
}
