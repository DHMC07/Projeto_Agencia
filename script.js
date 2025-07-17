document.getElementById("clientForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;
  const dados = new FormData(form);

  const jsonData = {};
  dados.forEach((value, key) => {
    jsonData[key] = value;
  });

  fetch('https://script.google.com/macros/s/AKfycbxZIvaHbtQqQnvxXSjjbrBV_owekMqf_iqKRogXANDF-TUD05UWAgs8Ai-3NeCPh20tYQ/exec', {
    method: 'POST',
    body: JSON.stringify(jsonData),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.text())
  .then(data => {
    document.getElementById("mensagem").textContent = "Dados enviados com sucesso!";
    form.reset();
  })
  .catch(err => {
    document.getElementById("mensagem").textContent = "Erro ao enviar.";
  });
});
