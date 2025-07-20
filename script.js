// ========= REGISTRO (registro.html) =========

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

// ========= GESTÃO (gestao.html) =========

function verificarSenha() {
  const senhaCorreta = "admin123";
  const input = document.getElementById("senhaInput").value;
  const erro = document.getElementById("erroSenha");

  if (input === senhaCorreta) {
    document.getElementById("senhaContainer").style.display = "none";
    document.getElementById("gestaoContainer").style.display = "block";
    carregarRegistros();
  } else {
    erro.textContent = "Senha incorreta. Tente novamente.";
  }
}

function carregarRegistros() {
  const tabelaBody = document.querySelector("#tabelaRegistros tbody");
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

// Atualização automática a cada 5 segundos (simula tempo real)
if (window.location.pathname.includes("gestao.html")) {
  setInterval(() => {
    if (document.getElementById("gestaoContainer").style.display === "block") {
      carregarRegistros();
    }
  }, 5000);
}

// ========= EXPORTAÇÃO CSV =========

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
