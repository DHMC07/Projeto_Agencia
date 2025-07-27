// ========== SENHAS (SENHAS EM TEXTO CLARO - PARA FINS DE DEPURACÃO E SIMPLICIDADE LOCAL) ==========
// AVISO: NÃO USE SENHAS EM TEXTO CLARO EM PRODUÇÃO! ISSO É UM RISCO DE SEGURANÇA.
const senhaRegistro = "registro123";


// ========== ESTADO DO AUTOCOMPLETE DE DESTINOS ==========
// (As variáveis globais já foram declaradas acima, não é necessário redeclarar)

// ========== INICIALIZAÇÃO E EVENTOS AO CARREGAR A PÁGINA ==========
document.addEventListener("DOMContentLoaded", () => {
    // Carregar destinos do JSON
    fetch("destinos.json") 
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok ' + res.statusText);
            return res.json();
        })
        .then(data => todosDestinos = data)
        .catch(err => console.error("Erro ao carregar destinos:", err));

    const currentPage = window.location.pathname;

    if (currentPage.includes("registro.html")) {
        // Inicializar a data de registro automaticamente
        const dataRegistroInput = document.getElementById('dataRegistro');
        if (dataRegistroInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dataRegistroInput.value = `${year}-${month}-${day}`;

        // Lógica de login e formulário de registro
        if (sessionStorage.getItem("logadoRegistro") === "true") {
            mostrarRegistro();
        }
        document.getElementById("formRegistro").addEventListener("submit", (event) => {
            event.preventDefault(); // Evita recarregar a página
            verificarLogin("registro");
        });

        // Configurar autocomplete para a página de registro
        const destinoInput = document.getElementById("destinoInput");
        const sugestoesEl = document.getElementById("sugestoes");
        const destinosSelecionados = document.getElementById("destinosSelecionados");
        const destinosHidden = document.getElementById("destinosHidden");

        if (destinoInput) {
            destinoInput.addEventListener("input", () => {
                handleAutocompleteInput(destinoInput, sugestoesEl, destinosSelecionados, destinosHidden, selecionadosRegistro);
            });
        }

        // Adiciona listener para submit do formulário de registro
        const registroForm = document.getElementById("registroForm");
        if (registroForm) {
            registroForm.addEventListener("submit", handleRegistroFormSubmit);
        }

        // Define a aba Round trip como ativa por padrão
        const roundTripTab = document.querySelector("#abasViagem .tab.active");
        if (roundTripTab) selectTab(roundTripTab);

    } else if (currentPage.includes("gestao.html")) {
        // Lógica de login e tabela de gestão
        if (sessionStorage.getItem("logadoGestao") === "true") {
            mostrarGestao();
            carregarRegistros();
            iniciarAtualizacaoAutomatica();
            iniciarMonitoramentoInatividade();
        }
        document.getElementById("formGestao").addEventListener("submit", (event) => {
            event.preventDefault(); // Impede envio padrão
            verificarLogin("gestao");
        });

        // Adicionar listeners para os botões "Exportar CSV" e "Sair" [NOVIDADE AQUI]
        const exportarCSVBtn = document.querySelector("#gestaoContainer button[onclick='exportarCSV()']");
        if (exportarCSVBtn) {
            exportarCSVBtn.removeAttribute('onclick'); // Remover o onclick inline
            exportarCSVBtn.addEventListener('click', exportarCSV);
        }

        const logoutBtn = document.querySelector("#gestaoContainer button[onclick='logout()']");
        if (logoutBtn) {
            logoutBtn.removeAttribute('onclick'); // Remover o onclick inline
            logoutBtn.addEventListener('click', logout);
        }
        
        // Adicionar listener para o botão "Voltar" na tela de login da gestão [NOVIDADE AQUI]
        const voltarBtnGestao = document.querySelector("#loginGestao button.voltar[onclick='voltarInicio()']");
        if (voltarBtnGestao) {
            voltarBtnGestao.removeAttribute('onclick'); // Remover o onclick inline
            voltarBtnGestao.addEventListener('click', voltarInicio);
        }


        // Configurar autocomplete para o modal de edição (na página de gestão)
        const editDestinosInput = document.getElementById("editDestinoInput");
        const editSugestoes = document.getElementById("editSugestoes");
        const editDestinosSelecionados = document.getElementById("editDestinosSelecionados");
        const editDestinosHidden = document.getElementById("editDestinosHidden");

        if (editDestinosInput) {
            editDestinosInput.addEventListener("input", () => {
                handleAutocompleteInput(editDestinosInput, editSugestoes, editDestinosSelecionados, editDestinosHidden, editSelectedDestinos);
            });
        }

        // Adiciona listener para submit do formulário de edição
        const editForm = document.getElementById("editForm");
        if (editForm) {
            editForm.addEventListener("submit", handleEditFormSubmit);
        }

        // Listener para fechar modal clicando fora (este já estava correto)
        window.onclick = function(event) {
            const modal = document.getElementById('editModal');
            if (event.target == modal) {
                fecharModal(); 
            }
        }

        // Listener para o botão de fechar e cancelar no modal [NOVIDADE AQUI]
        const closeButtonModal = document.querySelector("#editModal .close-button[onclick='fecharModal()']");
        if (closeButtonModal) {
            closeButtonModal.removeAttribute('onclick');
            closeButtonModal.addEventListener('click', fecharModal);
        }

        const cancelEditButton = document.querySelector("#editForm button[onclick='fecharModal()']");
        if (cancelEditButton) {
            cancelEditButton.removeAttribute('onclick');
            cancelEditButton.addEventListener('click', fecharModal);
        }
    }
    }
}
);
// ========== FUNÇÕES DE LOGIN ==========
function verificarLogin(tipo) {
    const senhaInputId = tipo === "registro" ? "senhaRegistro" : "senhaGestao";
    const erroElementId = tipo === "registro" ? "erroLoginRegistro" : "erroLoginGestao";
    const senhaCorreta = tipo === "registro" ? senhaRegistro : senhaGestao; 
    const sessionStorageKey = tipo === "registro" ? "logadoRegistro" : "logadoGestao";
    const mostrarFuncao = tipo === "registro" ? mostrarRegistro : mostrarGestao;

    const input = document.getElementById(senhaInputId).value;
    const erro = document.getElementById(erroElementId);

    console.log(`[LOGIN DEBUG] Tentativa de Login para: ${tipo}`);
    console.log(`[LOGIN DEBUG] Senha digitada: "${input}"`);
    console.log(`[LOGIN DEBUG] Senha esperada: "${senhaCorreta}"`);

    if (input === senhaCorreta) { 
        sessionStorage.setItem(sessionStorageKey, "true");
        mostrarFuncao();
        console.log("[LOGIN DEBUG] Login BEM SUCEDIDO!"); 
        if (tipo === "gestao") {
            carregarRegistros();
            iniciarAtualizacaoAutomatica();
            iniciarMonitoramentoInatividade();
        }
    } else {
        erro.textContent = "Senha incorreta.";
        console.log("[LOGIN DEBUG] FALHA: Senha incorreta."); 
    }
}

// ========== FUNÇÕES VISUAIS DE EXIBIÇÃO ==========
function mostrarRegistro() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("registroContainer").style.display = "block";
}

function mostrarGestao() {
    document.getElementById("loginGestao").style.display = "none";
    document.getElementById("gestaoContainer").style.display = "block";
}

// ========== LOGOUT E NAVEGAÇÃO ==========
function logout() {
    sessionStorage.clear();
    window.location.reload();
}

function voltarInicio() {
    window.location.href = "index.html";
}

// ========== AUTOCOMPLETE DE DESTINOS (GENÉRICO PARA REGISTRO E EDIÇÃO) ==========
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
        li.onclick = () => { // Este onclick está em um elemento criado dinamicamente, não no HTML original. Não é afetado pela CSP tão restritiva.
            currentSelectedArray.push(dest);
            updateDestinosDisplay(displayElement.id, hiddenInputElement.id, currentSelectedArray);
            inputElement.value = ""; 
            suggestionsElement.innerHTML = ""; 
            inputElement.focus(); 
        };
        suggestionsElement.appendChild(li);
    });
}

// Função genérica para atualizar a exibição e o campo hidden dos destinos
function updateDestinosDisplay(displayElementId, hiddenInputId, currentSelectedArray) {
    const displayElement = document.getElementById(displayElementId);
    const hiddenInputElement = document.getElementById(hiddenInputId);
    if (!displayElement || !hiddenInputElement) return;

    displayElement.innerHTML = "";
    currentSelectedArray.forEach((dest, index) => {
        const span = document.createElement("span");
        span.className = "destino-tag";
        span.textContent = dest;
        span.onclick = () => { // Este onclick está em um elemento criado dinamicamente, não no HTML original. Não é afetado pela CSP tão restritiva.
            currentSelectedArray.splice(index, 1); 
            updateDestinosDisplay(displayElementId, hiddenInputId, currentSelectedArray); 
        };
        displayElement.appendChild(span);
    });
    hiddenInputElement.value = currentSelectedArray.join(", "); 
}

// ========== VALIDAÇÃO DE DATAS ==========
function validarDatasViagem(dataIdaStr, dataVoltaStr) {
    if (!dataVoltaStr) return true; 

    if (dataIdaStr) {
        const dataIda = new Date(dataIdaStr);
        const dataVolta = new Date(dataVoltaStr);
        if (dataVolta < dataIda) {
            return false; 
        }
    }
    return true; 
}


// ========== REGISTRO DE FORMULÁRIO (PARA PÁGINA DE REGISTRO) ==========
function handleRegistroFormSubmit(e) {
    e.preventDefault();
    const form = e.target; 

    const dataIda = form.dataIda.value;
    const dataVolta = form.dataVolta.value;

    if (!validarDatasViagem(dataIda, dataVolta)) {
        alert("A Data de Volta não pode ser anterior à Data de Ida.");
        return; 
    }

    const destinosHiddenInput = document.getElementById("destinosHidden");
    const destinosSalvar = destinosHiddenInput ? destinosHiddenInput.value : '';

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
        destinos: destinosSalvar 
    };

    let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
    registros.push(dados);
    localStorage.setItem("registrosViagem", JSON.stringify(registros));

    form.reset();
    document.getElementById("destinosSelecionados").innerHTML = "";
    document.getElementById("destinosHidden").value = "";
    document.getElementById("destinoInput").value = ""; 
    
    selecionadosRegistro = []; 

    const mensagem = document.getElementById("mensagemSucesso");
    mensagem.textContent = "Dados registrados com sucesso!";
    setTimeout(() => mensagem.textContent = "", 3000);

    if (document.getElementById("gestaoContainer") && document.getElementById("gestaoContainer").style.display === "block") {
        carregarRegistros();
    }
}

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

        const dataRegFormatada = registro.dataRegistro ? new Date(registro.dataRegistro).toLocaleDateString('pt-PT') : 'N/A';
        const dataProxContatoFormatada = registro.dataProximoContato ? new Date(registro.dataProximoContato).toLocaleDateString('pt-PT') : 'N/A';
        const dataIdaFormatada = registro.dataIda ? new Date(registro.dataIda).toLocaleDateString('pt-PT') : 'N/A';
        const dataVoltaFormatada = registro.dataVolta ? new Date(registro.dataVolta).toLocaleDateString('pt-PT') : 'N/A';

        const observacoesTexto = registro.observacoes || 'N/A';
        const nomeAgente = registro.nomeAgente || 'N/A';
        const destinosCliente = registro.destinos || 'N/A'; 
        
        linha.innerHTML = `
            <td>${registro.nome || 'N/A'}</td>
            <td>${registro.pessoas || 'N/A'}</td>
            <td>${dataIdaFormatada} até ${dataVoltaFormatada}</td>
            <td>${registro.flexivel || 'N/A'}</td>
            <td>${registro.aeroporto || 'N/A'}</td>
            <td>${registro.regime || 'N/A'}</td>
            <td>${registro.valor || 'N/A'}</td>
            <td>${observacoesTexto}</td>
            <td>${dataRegFormatada}</td>
            <td>${dataProxContatoFormatada}</td>
            <td>${nomeAgente}</td>
            <td>${destinosCliente}</td>
            <td>
                <button class="btn-acao editar-btn" data-index="${index}">Editar</button>
                <button class="btn-acao eliminar-btn" data-index="${index}">Eliminar</button>
            </td>
        `;

        tabelaBody.appendChild(linha);
    });

    // === NOVIDADE AQUI: Atribuir eventos após os botões serem adicionados ao DOM ===
    document.querySelectorAll('.editar-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            editarRegistro(parseInt(index));
        });
    });

    document.querySelectorAll('.eliminar-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            eliminarRegistro(parseInt(index));
        });
    });
    // ==============================================================================
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

    const editDestinosInput = document.getElementById("editDestinoInput");
    const editDestinosDisplay = document.getElementById("editDestinosSelecionados");
    const editDestinosHidden = document.getElementById("editDestinosHidden");
    
    editDestinosInput.value = '';
    document.getElementById("editSugestoes").innerHTML = '';

    editSelectedDestinos = []; 
    if (registroParaEditar.destinos) {
        editSelectedDestinos = registroParaEditar.destinos.split(', ').filter(d => d.trim() !== '');
    }
    updateDestinosDisplay(editDestinosDisplay.id, editDestinosHidden.id, editSelectedDestinos);
    
    document.getElementById('editModal').style.display = 'block';
}

function handleEditFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const dataIda = document.getElementById('editDataIda').value;
    const dataVolta = document.getElementById('editDataVolta').value;

    if (!validarDatasViagem(dataIda, dataVolta)) {
        alert("A Data de Volta não pode ser anterior à Data de Ida.");
        return; 
    }

    const index = document.getElementById('editIndex').value;
    let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

    const destinosAtualizados = document.getElementById('editDestinosHidden').value;

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
        destinos: destinosAtualizados 
    };

    localStorage.setItem("registrosViagem", JSON.stringify(registros));
    carregarRegistros();
    fecharModal();
    alert("Registro atualizado com sucesso!");
}

function fecharModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editDestinosSelecionados').innerHTML = '';
    document.getElementById('editDestinosHidden').value = '';
    document.getElementById('editDestinoInput').value = '';
    document.getElementById('editSugestoes').innerHTML = '';
    editSelectedDestinos = []; 
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

// ========== EXPORTAÇÃO CSV ==========
function exportarCSV() {
    const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

    if (registros.length === 0) {
        alert("Nenhum registro para exportar.");
        return;
    }

    const cabecalho = ["Nome", "Pessoas", "DataIda", "DataVolta", "Flexível", "Aeroporto", "Regime", "Valor (€)", "Observações", "Data Registro", "Próximo Contato", "Nome Agente", "Destinos"];
    const linhas = registros.map(r => [
        `"${(r.nome || '').replace(/"/g, '""')}"`, 
        r.pessoas, 
        r.dataIda, 
        r.dataVolta, 
        r.flexivel, 
        `"${(r.aeroporto || '').replace(/"/g, '""')}"`, 
        `"${(r.regime || '').replace(/"/g, '""')}"`, 
        r.valor, 
        `"${(r.observacoes || '').replace(/"/g, '""')}"`, 
        r.dataRegistro || '', 
        r.dataProximoContato || '',
        `"${(r.nomeAgente || '').replace(/"/g, '""')}"`,
        `"${(r.destinos || '').replace(/"/g, '""')}"` 
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + 
        [
            cabecalho.map(h => `"${h.replace(/"/g, '""')}"`).join(","), 
            ...linhas.map(e => e.join(","))
        ].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "registros_viagem.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// ========== MONITORAMENTO DE INATIVIDADE ==========
// let tempoInatividade = 0;
// const LIMITE_MINUTOS = 5;  // Removed duplicate declaration
// const LIMITE_SEGUNDOS = LIMITE_MINUTOS * 60; // Removed duplicate declaration
// const AVISO_ANTES = 30;  // Removed duplicate declaration

// let avisoTimeoutMostrado = false; // Removed duplicate declaration

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

        if ((LIMITE_SEGUNDOS - tempoInatividade) <= AVISO_ANTES && !avisoTimeoutMostrado && tempoInatividade < LIMITE_SEGUNDOS) {
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
    let aviso = document.getElementById("avisoLogout");
    if (!aviso) { 
        aviso = document.createElement("div");
        aviso.id = "avisoLogout";
        document.body.appendChild(aviso);
    }
    
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
}

function esconderAvisoLogout() {
    const aviso = document.getElementById("avisoLogout");
    if (aviso) aviso.remove();
}

function atualizarContadorSessao(segundos) {
    const contador = document.getElementById("contadorTempo");
    if (contador) {
        contador.textContent = Math.max(0, segundos); 
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
            campoDataVolta.value = ''; 
        } else {
            campoDataVolta.closest("label").style.display = "block";
            campoDataVolta.setAttribute("required", "true");
        }
    }
}


// ========== ESTADO DO AUTOCOMPLETE DE DESTINOS ==========
let todosDestinos = []; // Variável global para armazenar todos os destinos carregados
// Variável específica para os destinos selecionados no formulário de REGISTRO
let selecionadosRegistro = []; 
// Variável específica para os destinos selecionados no modal de EDIÇÃO
let editSelectedDestinos = []; 

// ========== INICIALIZAÇÃO E EVENTOS AO CARREGAR A PÁGINA ==========
document.addEventListener("DOMContentLoaded", () => {
    // Carregar destinos do JSON
    fetch("destinos.json") 
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok ' + res.statusText);
            return res.json();
        })
        .then(data => todosDestinos = data)
        .catch(err => console.error("Erro ao carregar destinos:", err));

    const currentPage = window.location.pathname;

    if (currentPage.includes("registro.html")) {
        // Inicializar a data de registro automaticamente
        const dataRegistroInput = document.getElementById('dataRegistro');
        if (dataRegistroInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dataRegistroInput.value = `${year}-${month}-${day}`;
        }

        // Lógica de login e formulário de registro
        if (sessionStorage.getItem("logadoRegistro") === "true") {
            mostrarRegistro();
        }
        document.getElementById("formRegistro").addEventListener("submit", (event) => {
            event.preventDefault(); // Evita recarregar a página
            verificarLogin("registro");
        });

        // Configurar autocomplete para a página de registro
        const destinoInput = document.getElementById("destinoInput");
        const sugestoesEl = document.getElementById("sugestoes");
        const destinosSelecionados = document.getElementById("destinosSelecionados");
        const destinosHidden = document.getElementById("destinosHidden");

        if (destinoInput) {
            destinoInput.addEventListener("input", () => {
                handleAutocompleteInput(destinoInput, sugestoesEl, destinosSelecionados, destinosHidden, selecionadosRegistro);
            });
        }

        // Adiciona listener para submit do formulário de registro
        const registroForm = document.getElementById("registroForm");
        if (registroForm) {
            registroForm.addEventListener("submit", handleRegistroFormSubmit);
        }

        // Define a aba Round trip como ativa por padrão
        const roundTripTab = document.querySelector("#abasViagem .tab.active");
        if (roundTripTab) selectTab(roundTripTab);


    } else if (currentPage.includes("gestao.html")) {
        // Lógica de login e tabela de gestão
        if (sessionStorage.getItem("logadoGestao") === "true") {
            mostrarGestao();
            carregarRegistros();
            iniciarAtualizacaoAutomatica();
            iniciarMonitoramentoInatividade();
        }
        document.getElementById("formGestao").addEventListener("submit", (event) => {
            event.preventDefault(); // Impede envio padrão
            verificarLogin("gestao");
        });

        // Adicionar listeners para os botões "Exportar CSV" e "Sair" [NOVIDADE AQUI]
        const exportarCSVBtn = document.querySelector("#gestaoContainer button[onclick='exportarCSV()']");
        if (exportarCSVBtn) {
            exportarCSVBtn.removeAttribute('onclick'); // Remover o onclick inline
            exportarCSVBtn.addEventListener('click', exportarCSV);
        }

        const logoutBtn = document.querySelector("#gestaoContainer button[onclick='logout()']");
        if (logoutBtn) {
            logoutBtn.removeAttribute('onclick'); // Remover o onclick inline
            logoutBtn.addEventListener('click', logout);
        }
        
        // Adicionar listener para o botão "Voltar" na tela de login da gestão [NOVIDADE AQUI]
        const voltarBtnGestao = document.querySelector("#loginGestao button.voltar[onclick='voltarInicio()']");
        if (voltarBtnGestao) {
            voltarBtnGestao.removeAttribute('onclick'); // Remover o onclick inline
            voltarBtnGestao.addEventListener('click', voltarInicio);
        }


        // Configurar autocomplete para o modal de edição (na página de gestão)
        const editDestinosInput = document.getElementById("editDestinoInput");
        const editSugestoes = document.getElementById("editSugestoes");
        const editDestinosSelecionados = document.getElementById("editDestinosSelecionados");
        const editDestinosHidden = document.getElementById("editDestinosHidden");

        if (editDestinosInput) {
            editDestinosInput.addEventListener("input", () => {
                handleAutocompleteInput(editDestinosInput, editSugestoes, editDestinosSelecionados, editDestinosHidden, editSelectedDestinos);
            });
        }

        // Adiciona listener para submit do formulário de edição
        const editForm = document.getElementById("editForm");
        if (editForm) {
            editForm.addEventListener("submit", handleEditFormSubmit);
        }

        // Listener para fechar modal clicando fora (este já estava correto)
        window.onclick = function(event) {
            const modal = document.getElementById('editModal');
            if (event.target == modal) {
                fecharModal(); 
            }
        }

        // Listener para o botão de fechar e cancelar no modal [NOVIDADE AQUI]
        const closeButtonModal = document.querySelector("#editModal .close-button[onclick='fecharModal()']");
        if (closeButtonModal) {
            closeButtonModal.removeAttribute('onclick');
            closeButtonModal.addEventListener('click', fecharModal);
        }

        const cancelEditButton = document.querySelector("#editForm button[onclick='fecharModal()']");
        if (cancelEditButton) {
            cancelEditButton.removeAttribute('onclick');
            cancelEditButton.addEventListener('click', fecharModal);
        }
    }
});

// ========== FUNÇÕES DE LOGIN ==========
function verificarLogin(tipo) {
    const senhaInputId = tipo === "registro" ? "senhaRegistro" : "senhaGestao";
    const erroElementId = tipo === "registro" ? "erroLoginRegistro" : "erroLoginGestao";
    const senhaCorreta = tipo === "registro" ? senhaRegistro : senhaGestao; 
    const sessionStorageKey = tipo === "registro" ? "logadoRegistro" : "logadoGestao";
    const mostrarFuncao = tipo === "registro" ? mostrarRegistro : mostrarGestao;

    const input = document.getElementById(senhaInputId).value;
    const erro = document.getElementById(erroElementId);

    console.log(`[LOGIN DEBUG] Tentativa de Login para: ${tipo}`);
    console.log(`[LOGIN DEBUG] Senha digitada: "${input}"`);
    console.log(`[LOGIN DEBUG] Senha esperada: "${senhaCorreta}"`);

    if (input === senhaCorreta) { 
        sessionStorage.setItem(sessionStorageKey, "true");
        mostrarFuncao();
        console.log("[LOGIN DEBUG] Login BEM SUCEDIDO!"); 
        if (tipo === "gestao") {
            carregarRegistros();
            iniciarAtualizacaoAutomatica();
            iniciarMonitoramentoInatividade();
        }
    } else {
        erro.textContent = "Senha incorreta.";
        console.log("[LOGIN DEBUG] FALHA: Senha incorreta."); 
    }
}

// ========== FUNÇÕES VISUAIS DE EXIBIÇÃO ==========
function mostrarRegistro() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("registroContainer").style.display = "block";
}

function mostrarGestao() {
    document.getElementById("loginGestao").style.display = "none";
    document.getElementById("gestaoContainer").style.display = "block";
}

// ========== LOGOUT E NAVEGAÇÃO ==========
function logout() {
    sessionStorage.clear();
    window.location.reload();
}

function voltarInicio() {
    window.location.href = "index.html";
}

// ========== AUTOCOMPLETE DE DESTINOS (GENÉRICO PARA REGISTRO E EDIÇÃO) ==========
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
        li.onclick = () => { // Este onclick está em um elemento criado dinamicamente, não no HTML original. Não é afetado pela CSP tão restritiva.
            currentSelectedArray.push(dest);
            updateDestinosDisplay(displayElement.id, hiddenInputElement.id, currentSelectedArray);
            inputElement.value = ""; 
            suggestionsElement.innerHTML = ""; 
            inputElement.focus(); 
        };
        suggestionsElement.appendChild(li);
    });
}

// Função genérica para atualizar a exibição e o campo hidden dos destinos
function updateDestinosDisplay(displayElementId, hiddenInputId, currentSelectedArray) {
    const displayElement = document.getElementById(displayElementId);
    const hiddenInputElement = document.getElementById(hiddenInputId);
    if (!displayElement || !hiddenInputElement) return;

    displayElement.innerHTML = "";
    currentSelectedArray.forEach((dest, index) => {
        const span = document.createElement("span");
        span.className = "destino-tag";
        span.textContent = dest;
        span.onclick = () => { // Este onclick está em um elemento criado dinamicamente, não no HTML original. Não é afetado pela CSP tão restritiva.
            currentSelectedArray.splice(index, 1); 
            updateDestinosDisplay(displayElementId, hiddenInputId, currentSelectedArray); 
        };
        displayElement.appendChild(span);
    });
    hiddenInputElement.value = currentSelectedArray.join(", "); 
}

// ========== VALIDAÇÃO DE DATAS ==========
function validarDatasViagem(dataIdaStr, dataVoltaStr) {
    if (!dataVoltaStr) return true; 

    if (dataIdaStr) {
        const dataIda = new Date(dataIdaStr);
        const dataVolta = new Date(dataVoltaStr);
        if (dataVolta < dataIda) {
            return false; 
        }
    }
    return true; 
}


// ========== REGISTRO DE FORMULÁRIO (PARA PÁGINA DE REGISTRO) ==========
function handleRegistroFormSubmit(e) {
    e.preventDefault();
    const form = e.target; 

    const dataIda = form.dataIda.value;
    const dataVolta = form.dataVolta.value;

    if (!validarDatasViagem(dataIda, dataVolta)) {
        alert("A Data de Volta não pode ser anterior à Data de Ida.");
        return; 
    }

    const destinosHiddenInput = document.getElementById("destinosHidden");
    const destinosSalvar = destinosHiddenInput ? destinosHiddenInput.value : '';

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
        destinos: destinosSalvar 
    };

    let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];
    registros.push(dados);
    localStorage.setItem("registrosViagem", JSON.stringify(registros));

    form.reset();
    document.getElementById("destinosSelecionados").innerHTML = "";
    document.getElementById("destinosHidden").value = "";
    document.getElementById("destinoInput").value = ""; 
    
    selecionadosRegistro = []; 

    const mensagem = document.getElementById("mensagemSucesso");
    mensagem.textContent = "Dados registrados com sucesso!";
    setTimeout(() => mensagem.textContent = "", 3000);

    if (document.getElementById("gestaoContainer") && document.getElementById("gestaoContainer").style.display === "block") {
        carregarRegistros();
    }
}

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

        const dataRegFormatada = registro.dataRegistro ? new Date(registro.dataRegistro).toLocaleDateString('pt-PT') : 'N/A';
        const dataProxContatoFormatada = registro.dataProximoContato ? new Date(registro.dataProximoContato).toLocaleDateString('pt-PT') : 'N/A';
        const dataIdaFormatada = registro.dataIda ? new Date(registro.dataIda).toLocaleDateString('pt-PT') : 'N/A';
        const dataVoltaFormatada = registro.dataVolta ? new Date(registro.dataVolta).toLocaleDateString('pt-PT') : 'N/A';

        const observacoesTexto = registro.observacoes || 'N/A';
        const nomeAgente = registro.nomeAgente || 'N/A';
        const destinosCliente = registro.destinos || 'N/A'; 
        
        linha.innerHTML = `
            <td>${registro.nome || 'N/A'}</td>
            <td>${registro.pessoas || 'N/A'}</td>
            <td>${dataIdaFormatada} até ${dataVoltaFormatada}</td>
            <td>${registro.flexivel || 'N/A'}</td>
            <td>${registro.aeroporto || 'N/A'}</td>
            <td>${registro.regime || 'N/A'}</td>
            <td>${registro.valor || 'N/A'}</td>
            <td>${observacoesTexto}</td>
            <td>${dataRegFormatada}</td>
            <td>${dataProxContatoFormatada}</td>
            <td>${nomeAgente}</td>
            <td>${destinosCliente}</td>
            <td>
                <button class="btn-acao editar-btn" data-index="${index}">Editar</button>
                <button class="btn-acao eliminar-btn" data-index="${index}">Eliminar</button>
            </td>
        `;

        tabelaBody.appendChild(linha);
    });

    // Atribuir eventos após os botões serem adicionados ao DOM
    document.querySelectorAll('.editar-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            editarRegistro(parseInt(index));
        });
    });

    document.querySelectorAll('.eliminar-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            eliminarRegistro(parseInt(index));
        });
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

    const editDestinosInput = document.getElementById("editDestinoInput");
    const editDestinosDisplay = document.getElementById("editDestinosSelecionados");
    const editDestinosHidden = document.getElementById("editDestinosHidden");
    
    editDestinosInput.value = '';
    document.getElementById("editSugestoes").innerHTML = '';

    editSelectedDestinos = []; 
    if (registroParaEditar.destinos) {
        editSelectedDestinos = registroParaEditar.destinos.split(', ').filter(d => d.trim() !== '');
    }
    updateDestinosDisplay(editDestinosDisplay.id, editDestinosHidden.id, editSelectedDestinos);
    
    document.getElementById('editModal').style.display = 'block';
}

function handleEditFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const dataIda = document.getElementById('editDataIda').value;
    const dataVolta = document.getElementById('editDataVolta').value;

    if (!validarDatasViagem(dataIda, dataVolta)) {
        alert("A Data de Volta não pode ser anterior à Data de Ida.");
        return; 
    }

    const index = document.getElementById('editIndex').value;
    let registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

    const destinosAtualizados = document.getElementById('editDestinosHidden').value;

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
        destinos: destinosAtualizados 
    };

    localStorage.setItem("registrosViagem", JSON.stringify(registros));
    carregarRegistros();
    fecharModal();
    alert("Registro atualizado com sucesso!");
}

function fecharModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editDestinosSelecionados').innerHTML = '';
    document.getElementById('editDestinosHidden').value = '';
    document.getElementById('editDestinoInput').value = '';
    document.getElementById('editSugestoes').innerHTML = '';
    editSelectedDestinos = []; 
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

// ========== EXPORTAÇÃO CSV ==========
function exportarCSV() {
    const registros = JSON.parse(localStorage.getItem("registrosViagem")) || [];

    if (registros.length === 0) {
        alert("Nenhum registro para exportar.");
        return;
    }

    const cabecalho = ["Nome", "Pessoas", "DataIda", "DataVolta", "Flexível", "Aeroporto", "Regime", "Valor (€)", "Observações", "Data Registro", "Próximo Contato", "Nome Agente", "Destinos"];
    const linhas = registros.map(r => [
        `"${(r.nome || '').replace(/"/g, '""')}"`, 
        r.pessoas, 
        r.dataIda, 
        r.dataVolta, 
        r.flexivel, 
        `"${(r.aeroporto || '').replace(/"/g, '""')}"`, 
        `"${(r.regime || '').replace(/"/g, '""')}"`, 
        r.valor, 
        `"${(r.observacoes || '').replace(/"/g, '""')}"`, 
        r.dataRegistro || '', 
        r.dataProximoContato || '',
        `"${(r.nomeAgente || '').replace(/"/g, '""')}"`,
        `"${(r.destinos || '').replace(/"/g, '""')}"` 
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + 
        [
            cabecalho.map(h => `"${h.replace(/"/g, '""')}"`).join(","), 
            ...linhas.map(e => e.join(","))
        ].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "registros_viagem.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// ========== MONITORAMENTO DE INATIVIDADE ==========
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

        if ((LIMITE_SEGUNDOS - tempoInatividade) <= AVISO_ANTES && !avisoTimeoutMostrado && tempoInatividade < LIMITE_SEGUNDOS) {
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
    let aviso = document.getElementById("avisoLogout");
    if (!aviso) { 
        aviso = document.createElement("div");
        aviso.id = "avisoLogout";
        document.body.appendChild(aviso);
    }
    
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
}

function esconderAvisoLogout() {
    const aviso = document.getElementById("avisoLogout");
    if (aviso) aviso.remove();
}

function atualizarContadorSessao(segundos) {
    const contador = document.getElementById("contadorTempo");
    if (contador) {
        contador.textContent = Math.max(0, segundos); 
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
            campoDataVolta.value = ''; 
        } else {
            campoDataVolta.closest("label").style.display = "block";
            campoDataVolta.setAttribute("required", "true");
        }
    }
}