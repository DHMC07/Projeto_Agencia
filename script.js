// ========== SENHAS ==========
const senhaRegistro = "registro123";
const senhaGestao = "admin123";

let todosDestinos = [];
let selecionadosRegistro = [];
let editSelectedDestinos = [];

// ========== INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("registro")) initRegistro();
  if (path.includes("gestao")) initGestao();

  // Carregar destinos
  fetch("destinos.json")
    .then((res) => res.json())
    .then((data) => (todosDestinos = data))
    .catch((err) => console.error("Erro ao carregar destinos:", err));
});

// ========== REGISTRO ==========
function initRegistro() {
  const dataRegistro = document.getElementById("dataRegistro");
  if (dataRegistro) {
    const hoje = new Date().toISOString().split("T")[0];
    dataRegistro.value = hoje;
  }

  // Login via Enter
  document.getElementById("formRegistro").addEventListener("submit", (e) => {
    e.preventDefault();
    const senha = document.getElementById("senhaRegistro").value;
    if (senha === senhaRegistro) {
      sessionStorage.setItem("logadoRegistro", "true");
      mostrarRegistro();
    } else {
      document.getElementById("erroLoginRegistro").textContent = "Senha incorreta.";
    }
  });

  // Registro
  const form = document.getElementById("registroForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const dados = {
      nome: form.nome.value,
      pessoas: form.pessoas.value,
      dataIda: form.dataIda.value,
      dataVolta: form.dataVolta.value,
      flexivel: form.flexivel.value,
      aeroporto: form.aeroporto.value,
      regime: form.regime.value,
      valor: form.valor.value,
      observacoes: form.observacoes.value,
      dataRegistro: form.dataRegistro.value,
      dataProximoContato: form.dataProximoContato.value,
      nomeAgente: form.NomeAgente.value,
      destinos: document.getElementById("destinosHidden").value
    };

    const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
    registros.push(dados);
    localStorage.setItem("registrosViagem", JSON.stringify(registros));

    form.reset();
    selecionadosRegistro = [];
    document.getElementById("destinosSelecionados").innerHTML = "";
    document.getElementById("destinosHidden").value = "";
    document.getElementById("mensagemSucesso").textContent = "Registro efetuado com sucesso!";
    setTimeout(() => (document.getElementById("mensagemSucesso").textContent = ""), 3000);
  });

  // Tabs de tipo de viagem
  document.querySelectorAll(".tab").forEach((tab) =>
    tab.addEventListener("click", () => selectTab(tab))
  );

  // Autocomplete destinos
  initAutocomplete("destinoInput", "sugestoes", "destinosSelecionados", "destinosHidden", selecionadosRegistro);

  if (sessionStorage.getItem("logadoRegistro") === "true") {
    mostrarRegistro();
  }
}

function mostrarRegistro() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("registroContainer").style.display = "block";
}

function selectTab(tab) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");

  const tipo = tab.textContent.trim().toLowerCase();
  const campoVolta = document.querySelector("input[name='dataVolta']");
  if (!campoVolta) return;

  if (tipo === "só ida" || tipo === "one way") {
    campoVolta.closest("label").style.display = "none";
    campoVolta.removeAttribute("required");
  } else {
    campoVolta.closest("label").style.display = "block";
    campoVolta.setAttribute("required", "true");
  }
}

// ========== GESTÃO ==========
function initGestao() {
  document.getElementById("formGestao").addEventListener("submit", (e) => {
    e.preventDefault();
    const senha = document.getElementById("senhaGestao").value;
    if (senha === senhaGestao) {
      sessionStorage.setItem("logadoGestao", "true");
      mostrarGestao();
      carregarRegistros();
    } else {
      document.getElementById("erroLoginGestao").textContent = "Senha incorreta.";
    }
  });

  if (sessionStorage.getItem("logadoGestao") === "true") {
    mostrarGestao();
    carregarRegistros();
  }
}

function mostrarGestao() {
  document.getElementById("loginGestao").style.display = "none";
  document.getElementById("gestaoContainer").style.display = "block";
}

function carregarRegistros() {
  const tabela = document.querySelector("#tabelaRegistros tbody");
  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
  tabela.innerHTML = "";

  if (registros.length === 0) {
    tabela.innerHTML = `<tr><td colspan="13" style="text-align:center;">Sem registros</td></tr>`;
    return;
  }

  registros.forEach((r) => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${r.nome}</td>
      <td>${r.pessoas}</td>
      <td>${r.dataIda} até ${r.dataVolta}</td>
      <td>${r.flexivel}</td>
      <td>${r.aeroporto}</td>
      <td>${r.regime}</td>
      <td>${r.valor}</td>
      <td>${r.observacoes}</td>
      <td>${r.dataRegistro}</td>
      <td>${r.dataProximoContato}</td>
      <td>${r.nomeAgente}</td>
      <td>${r.destinos}</td>
      <td></td>
    `;
    tabela.appendChild(linha);
  });
}

// ========== AUTOCOMPLETE ==========
function initAutocomplete(inputId, sugestoesId, wrapperId, hiddenId, selectedList) {
  const input = document.getElementById(inputId);
  const sugestoes = document.getElementById(sugestoesId);
  const wrapper = document.getElementById(wrapperId);
  const hidden = document.getElementById(hiddenId);

  input.addEventListener("input", () => {
    const texto = input.value.toLowerCase();
    sugestoes.innerHTML = "";
    if (!texto) return;

    const filtrados = todosDestinos.filter(
      (d) => d.toLowerCase().includes(texto) && !selectedList.includes(d)
    ).slice(0, 6);

    filtrados.forEach((dest) => {
      const li = document.createElement("li");
      li.textContent = dest;
      li.onclick = () => {
        selectedList.push(dest);
        atualizarDestinos(wrapper, hidden, selectedList);
        input.value = "";
        sugestoes.innerHTML = "";
      };
      sugestoes.appendChild(li);
    });
  });
}

function atualizarDestinos(wrapper, hidden, lista) {
  wrapper.innerHTML = "";
  lista.forEach((dest, i) => {
    const tag = document.createElement("span");
    tag.className = "destino-tag";
    tag.textContent = dest;
    tag.onclick = () => {
      lista.splice(i, 1);
      atualizarDestinos(wrapper, hidden, lista);
    };
    wrapper.appendChild(tag);
  });
  hidden.value = lista.join(", ");
}

// ========== EXPORTAÇÃO ==========
function exportarCSV() {
  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
  if (!registros.length) return alert("Sem registros.");

  const cabecalho = [
    "Nome",
    "Pessoas",
    "Período",
    "Flexível",
    "Aeroporto",
    "Regime",
    "Valor",
    "Observações",
    "Data Registro",
    "Próx. Contato",
    "Agente",
    "Destinos"
  ];
  const linhas = registros.map((r) => [
    r.nome,
    r.pessoas,
    `${r.dataIda} até ${r.dataVolta}`,
    r.flexivel,
    r.aeroporto,
    r.regime,
    r.valor,
    r.observacoes,
    r.dataRegistro,
    r.dataProximoContato,
    r.nomeAgente,
    r.destinos
  ]);

  const conteudo = [cabecalho, ...linhas].map((l) => l.join(",")).join("\n");
  const link = document.createElement("a");
  link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(conteudo);
  link.download = "registros.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ========== UTIL ==========
function logout() {
  sessionStorage.clear();
  window.location.reload();
}

function voltarInicio() {
  window.location.href = "index.html";
}
