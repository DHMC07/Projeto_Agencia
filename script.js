const senhaRegistro = "registro123";
const senhaGestao = "admin123";

let todosDestinos = [];
let selecionadosRegistro = [];
let editSelectedDestinos = [];

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname;

  if (currentPage.includes("registro.html")) {
    if (sessionStorage.getItem("logadoRegistro") === "true") mostrarRegistro();
    document.getElementById("formRegistro").addEventListener("submit", e => {
      e.preventDefault();
      verificarLogin("registro");
    });
    inicializarRegistro();
  }

  if (currentPage.includes("gestao.html")) {
    if (sessionStorage.getItem("logadoGestao") === "true") {
      mostrarGestao();
      carregarRegistros();
    }
    document.getElementById("formGestao").addEventListener("submit", e => {
      e.preventDefault();
      verificarLogin("gestao");
    });
  }
});

function verificarLogin(tipo) {
  const input = document.getElementById(`senha${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).value;
  const erro = document.getElementById(`erroLogin${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
  const senha = tipo === "registro" ? senhaRegistro : senhaGestao;

  if (input === senha) {
    sessionStorage.setItem(`logado${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`, "true");
    tipo === "registro" ? mostrarRegistro() : mostrarGestao();
    if (tipo === "gestao") carregarRegistros();
  } else {
    erro.textContent = "Senha incorreta.";
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

function inicializarRegistro() {
  const dataRegistroInput = document.getElementById("dataRegistro");
  const hoje = new Date().toISOString().split("T")[0];
  if (dataRegistroInput) dataRegistroInput.value = hoje;

  fetch("destinos.json")
    .then(res => res.json())
    .then(data => todosDestinos = data)
    .catch(() => console.error("Erro ao carregar destinos."));

  const destinoInput = document.getElementById("destinoInput");
  const sugestoes = document.getElementById("sugestoes");
  const selecionados = document.getElementById("destinosSelecionados");
  const hidden = document.getElementById("destinosHidden");

  destinoInput.addEventListener("input", () => {
    const input = destinoInput.value.toLowerCase();
    sugestoes.innerHTML = "";
    if (input === "") return;

    const filtrados = todosDestinos.filter(dest => 
      dest.toLowerCase().includes(input) && !selecionadosRegistro.includes(dest)
    ).slice(0, 5);

    filtrados.forEach(dest => {
      const li = document.createElement("li");
      li.textContent = dest;
      li.onclick = () => {
        selecionadosRegistro.push(dest);
        atualizarDestinos();
        destinoInput.value = "";
        sugestoes.innerHTML = "";
      };
      sugestoes.appendChild(li);
    });
  });

  function atualizarDestinos() {
    selecionados.innerHTML = "";
    selecionadosRegistro.forEach((dest, i) => {
      const span = document.createElement("span");
      span.textContent = dest;
      span.className = "destino-tag";
      span.onclick = () => {
        selecionadosRegistro.splice(i, 1);
        atualizarDestinos();
      };
      selecionados.appendChild(span);
    });
    hidden.value = selecionadosRegistro.join(", ");
  }

  document.getElementById("registroForm").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;

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
      destinos: hidden.value
    };

    const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
    registros.push(dados);
    localStorage.setItem("registrosViagem", JSON.stringify(registros));

    form.reset();
    destinoInput.value = "";
    sugestoes.innerHTML = "";
    selecionadosRegistro = [];
    atualizarDestinos();

    const msg = document.getElementById("mensagemSucesso");
    msg.textContent = "Registro salvo com sucesso!";
    setTimeout(() => msg.textContent = "", 3000);
  });
}

function carregarRegistros() {
  const tbody = document.querySelector("#tabelaRegistros tbody");
  tbody.innerHTML = "";

  const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

  registros.forEach(reg => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${reg.nome}</td>
      <td>${reg.pessoas}</td>
      <td>${reg.dataIda} até ${reg.dataVolta}</td>
      <td>${reg.flexivel}</td>
      <td>${reg.aeroporto}</td>
      <td>${reg.regime}</td>
      <td>${reg.valor}</td>
      <td>${reg.observacoes}</td>
      <td>${reg.dataRegistro}</td>
      <td>${reg.dataProximoContato}</td>
      <td>${reg.nomeAgente}</td>
      <td>${reg.destinos}</td>
    `;
    tbody.appendChild(tr);
  });
}

function logout() {
  sessionStorage.clear();
  location.reload();
}

function voltarInicio() {
  location.href = "index.html";
}
