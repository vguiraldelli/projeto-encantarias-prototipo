// Função genérica para exibir mensagens de CSV (usada em todas as abas relacionadas)
function displayCSVMessage(tabMessageId, message, type) {
    const messageLabel = document.getElementById(tabMessageId);
    if (!messageLabel) {
        console.error(`Elemento com ID "${tabMessageId}" não encontrado.`);
        return;
    }
    messageLabel.textContent = message;
    messageLabel.className = `cvs-message ${type}`;
}


// Solicitar permissão ao carregar a página
async function requestClipboardPermission() {
    try {
        const permission = await navigator.permissions.query({
            name: "clipboard-read"
        });
        if (permission.state === "granted" || permission.state === "prompt") {
            displayCSVMessage(
                "Permissão para acessar a área de transferência concedida.",
                "success"
            );
        } else {
            displayCSVMessage(
                "Permissão para acessar a área de transferência negada. Confirme ao colar.",
                "error"
            );
        }
    } catch (err) {
        console.error("Erro ao verificar permissão da área de transferência:", err);
    }
}

// Solicitar permissão ao carregar a página
requestClipboardPermission();

document.getElementById('pasteButton').addEventListener('click', async () => {
    if (navigator.clipboard && navigator.clipboard.readText) {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('inputText').value = text;
            displayCSVMessage('Conteúdo colado com sucesso.', 'success');
        } catch (err) {
            console.error('Erro ao colar:', err);
            displayCSVMessage(
                'Confirme a permissão no diálogo para colar conteúdo externo.',
                'error'
            );
        }
    } else {
        displayCSVMessage(
            'Função de colar não suportada neste navegador.',
            'error'
        );
    }
});

document.getElementById('clearButton').addEventListener('click', () => {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
    document.getElementById('csvImportButton').value = ''; // Limpa a seleção do arquivo CSV
    clearMessage(); // Limpa as mensagens de status
    displayCSVMessage('', ''); // Limpa mensagens relacionadas ao CSV
});


// Função para gerar o relatório final
function generateReport(originalJSON, jsonData, processedJSONOrCSVContent, caller) {
    if (caller === 'processCSVandUpdateJSON') {
        // Relatório para a função processCSVandUpdateJSON
        const entriesInJSONBefore = originalJSON.length;
        const entriesInCSV = countCSVEntries(processedJSONOrCSVContent);

        // Número total de entradas após o processamento
        const entriesInJSONAfter = jsonData.length;

        // Entradas carregadas com sucesso: diferença entre antes e depois
        const successfullyLoaded = entriesInJSONAfter - entriesInJSONBefore;


        return `Entradas identificadas no JSON: ${entriesInJSONBefore}
                Entradas identificadas no CSV: ${entriesInCSV}
                Entradas carregadas com sucesso: ${successfullyLoaded}
				Quantidade de entradas final: ${entriesInJSONAfter}
				`;

    } else if (caller === 'generateCSVButton') {
        // Relatório específico para a função de geração CSV
        const entriesInJSON = jsonData.length;
        const entriesInCSV = countCSVEntries(processedJSONOrCSVContent);

        return `Entradas identificadas no JSON: ${entriesInJSON}
                Entradas convertidas para o CSV: ${entriesInCSV}
				`;
    }
}



// ------------------------------------ Conversor de Encantarias ------------------------------------ //

document.getElementById('convertButton').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value.trim();
    if (inputText === '') {
        displayCSVMessage("messageLabel",'Por favor, insira uma letra para conversão.', 'error');
        return;
    }

    // Processa o texto e mantém as quebras de linha
    const processedText = processText(inputText);

    // Exibe o resultado processado no console com as quebras de linha representadas como "\n"
    console.log(processedText.split('\n').join('\\n').split('\n\n').join('\\n\\n'));

    // Exibe o resultado processado no campo de saída com as quebras de linha como texto literal
    document.getElementById('outputText').value = processedText
        .replace(/\n/g, '\\n')
        .replace(/\n\n/g, '\\n\\n');

    displayCSVMessage("messageLabel",'Conversão realizada com sucesso.', 'success');
});


function processText(text) {
    if (typeof text !== 'string') return text;

    // Substitui todas as quebras de linha reais por '\n'
    text = text.replace(/(\r\n|\n|\r)/g, '\n');

    // Divide o texto em estrofes usando duas ou mais quebras de linha como delimitadores
    const strophes = text.split(/\n\n+/);

    console.log('Estrofes divididas:', strophes);

    let processedText = '';
    let lastStrophe = '';

    strophes.forEach((strophe, index) => {
        // Remove espaços em branco no início e no fim de cada estrofe
        strophe = strophe.trim();

        if (strophe === '') return; // Ignora estrofes vazias

        console.log(`Processando estrofe ${index + 1}:`, strophe);

        // Verifica se a estrofe termina com 'Nx' (exemplo: 2x)
        const repeatMatch = strophe.match(/(\d+x)$/);

        if (repeatMatch) {
            const repeat = repeatMatch[0]; // Captura 'Nx'
            strophe = strophe.replace(/(\d+x)$/, '').trim(); // Remove 'Nx' do final da estrofe

            console.log('Repetição encontrada, movendo para o início da estrofe atual.');

            // Adiciona a repetição no início da estrofe atual
            strophe = `${repeat}\n${strophe}`;
        }

        // Adiciona a estrofe ao texto processado
        if (lastStrophe) {
            processedText += '\n\n';
        }
        processedText += strophe;

        // Atualiza a última estrofe processada
        lastStrophe = strophe;
    });

    console.log('Texto processado:', processedText);

    return processedText;
}




document.getElementById('copyButton').addEventListener('click', () => {
    const outputText = document.getElementById('outputText').value;
    if (outputText === '') {
        displayCSVMessage('Não há conteúdo para copiar.', 'error');
        return;
    }
    navigator.clipboard.writeText(outputText)
        .then(() => {
            displayCSVMessage('Conteúdo copiado para a área de transferência.', 'success');
        })
        .catch(() => {
            displayCSVMessage('Erro ao copiar conteúdo.', 'error');
        });
});



// Função para limpar mensagens
function clearMessage() {
    const messageLabel = document.getElementById('messageLabel');
    messageLabel.textContent = '';
    messageLabel.className = 'message';
}



// ------------------------------------ Conversor CSV (em lote) ------------------------------------ //

// Função para processar o CSV e gerar um arquivo atualizado para download
document.getElementById('processCSVButton').addEventListener('click', async function () {
    const csvInput = document.getElementById('csvImportButton');
    const outputLog = document.getElementById('outputCsv');
    const messageElement = document.getElementById('csvMessage');

    if (!csvInput.files.length) {
        displayCSVMessage('csvMessage', 'Por favor, selecione um arquivo CSV.', 'error');
        return;
    }

    const file = csvInput.files[0];
    const reader = new FileReader();

    // Mensagem de status de progresso
    displayCSVMessage('csvMessage', 'Processando CSV... Por favor, aguarde.', 'processing');
    outputLog.textContent = ''; // Limpar o log de saída

    reader.onload = function (e) {
        const csvContent = e.target.result;

        // Processar o CSV com suporte a campos entre aspas e quebras de linha internas
        const lines = parseCSV(csvContent);

        if (lines.length === 0) {
            displayCSVMessage('csvMessage', 'O arquivo CSV está vazio ou não pôde ser processado.', 'error');
            return;
        }

        const headers = lines[0];
        const letraIndex = headers.indexOf("Letra");
        if (letraIndex === -1) {
            displayCSVMessage('csvMessage', 'Coluna "Letra" não encontrada no CSV.', 'error');
            return;
        }

        const processedLines = [headers]; // Adicionar cabeçalho ao novo CSV

        // Processar cada linha do CSV
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i];

            if (row.length === headers.length) {
                // Aplicar a função processText à coluna "Letra"
                console.log(`Conteúdo original do campo "Letra" na linha ${i + 1}:`, row[letraIndex]);
                row[letraIndex] = processText(row[letraIndex] || "");

                // Substituir quebras de linha internas por \n para exportação
                row[letraIndex] = row[letraIndex].replace(/\r?\n/g, '\\n');

                processedLines.push(row);
            }
        }

        // Criar o novo conteúdo CSV processado
        const processedCSVContent = processedLines.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(';')).join('\n');
        const csvBlob = new Blob([processedCSVContent], { type: 'text/csv;charset=utf-8;' });

        // Criar o link para download do CSV processado
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(csvBlob);
        downloadLink.download = 'csv_processado.csv';
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Exibir mensagem de sucesso e log de saída
        outputLog.textContent = `Arquivo processado com sucesso. ${processedLines.length - 1} linhas foram processadas.`;
        displayCSVMessage('csvMessage', 'Processamento concluído com sucesso.', 'success');
    };

    reader.onerror = function () {
        displayCSVMessage('csvMessage', 'Erro ao ler o arquivo CSV.', 'error');
    };

    reader.readAsText(file, 'UTF-8');
});

// Função para fazer parsing de CSV mantendo quebras de linha internas em campos entre aspas
function parseCSV(csvContent) {
    const rows = [];
    let currentRow = [];
    let inQuotes = false;
    let currentField = '';
    let currentLine = '';
    const delimiter = /(;|[\r\n])/; // Delimitador de campo e quebra de linha

    for (let i = 0; i < csvContent.length; i++) {
        const char = csvContent[i];

        if (char === '"' && (i === 0 || csvContent[i - 1] !== '\\')) {
            // Alternar o estado de inQuotes ao encontrar aspas não escapadas
            inQuotes = !inQuotes;
            continue;
        }

        if (!inQuotes && char === ';') {
            // Delimitador de campo, adicionar campo à linha atual
            currentRow.push(currentField.replace(/""/g, '"'));
            currentField = '';
        } else if (!inQuotes && (char === '\n' || char === '\r')) {
            // Delimitador de linha, adicionar linha à lista de linhas
            if (currentField) {
                currentRow.push(currentField.replace(/""/g, '"'));
            }
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
        } else {
            // Adicionar caracteres ao campo atual
            currentField += char;
        }
    }

    // Adicionar a última linha se existir
    if (currentRow.length > 0) {
        rows.push(currentRow);
    }

    return rows;
}




// ------------------------------------ Popular Json ------------------------------------ //

// Função para tratar IDs:
// Variável global para armazenar o próximo ID
let nextID = "E00001"; // Valor inicial padrão

// Função para inicializar o próximo ID com base no JSON carregado
function initializeNextID(jsonData) {
    // Filtra os IDs existentes no JSON, extrai os números e encontra o maior
    const ids = jsonData
        .map(entry => entry.ID)
        .filter(id => id && id.startsWith("E")) // Garante que o ID começa com "E"
        .map(id => parseInt(id.substring(1), 10)); // Extrai a parte numérica do ID

    if (ids.length > 0) {
        const maxID = Math.max(...ids); // Obtém o maior número
        nextID = `E${String(maxID + 1).padStart(5, "0")}`; // Configura o próximo ID
    }
}

// Função para gerar o próximo ID incremental
function generateNextID() {
    const numericPart = parseInt(nextID.substring(1), 10); // Extrai a parte numérica
    const newID = `E${String(numericPart).padStart(5, "0")}`; // Gera o ID formatado
    nextID = `E${String(numericPart + 1).padStart(5, "0")}`; // Atualiza o próximo ID globalmente
    return newID;
}






// Variáveis globais para armazenar os conteúdos do JSON e do CSV
let jsonContent = null;
let csvContent = null;


// ------------------ CSV para Json ------------------ //
document.getElementById('cvs-csvToJson').addEventListener('click', function() {
    const outputElement = document.getElementById("output");
    if (!outputElement) {
        console.error("Elemento com ID 'output' não encontrado.");
        return;
    }

    if (!jsonContent || !csvContent) {
        if (document.getElementById("jsonInput").files.length === 0 || document.getElementById("csvInput").files.length === 0) {
            displayCSVMessage("csvToJsonMessage", "Por favor, carregue ambos os arquivos JSON e CSV.", "error");
            outputElement.textContent = "Por favor, carregue ambos os arquivos JSON e CSV.";
        }
        return;
    }

    const originalJSON = JSON.parse(jsonContent);
    const jsonData = [...originalJSON];

    const lines = csvContent.split(/\r?\n/);
    const headers = parseCSVLine(lines[0]);
    
    let errors = [];
    let ignoredLines = [];
    let successfullyLoadedEntries = 0; // Variável para contar as entradas carregadas com sucesso

    initializeNextID(jsonData);

    let buffer = "";
    let inQuotes = false;

    for (let i = 1; i < lines.length; i++) {
        let line = lines[i] || "";

        if (line.includes('"')) {
            const quoteCount = (line.match(/"/g) || []).length;
            inQuotes = (quoteCount % 2 !== 0) ? !inQuotes : inQuotes;
        }

        buffer += line + (inQuotes ? "\n" : "");

        if (!inQuotes && buffer.trim()) {
            const row = parseCSVLine(buffer);
            buffer = "";

            if (row.length !== headers.length) {
                errors.push(`Linha ${i + 1} do CSV está incompleta (esperado: ${headers.length}, encontrado: ${row.length}). Conteúdo: ${line}`);
                ignoredLines.push({ lineNumber: i + 1, content: line });
                continue;
            }

            const entry = {};
            for (let j = 0; j < headers.length; j++) {
                entry[headers[j].trim()] = row[j].trim();
            }

            entry["ID"] = generateNextID();

            if (entry["Letra"]) {
                entry["Letra"] = processText(entry["Letra"]).replace(/(\n{2,})/g, '\n\n');
            }

            if (entry["Autor"] === "Victor Guiraldelli") {
                entry["Proprietário"] = "Victor Guiraldelli";
                delete entry["Autor"];
            }

            jsonData.push(entry);
            successfullyLoadedEntries++; // Incrementa o contador de entradas carregadas com sucesso
        }
    }

    // Gerar o relatório
    const report = generateReport(originalJSON, jsonData, csvContent, 'processCSVandUpdateJSON');
    console.log(report);

    if (errors.length > 0) {
        const ignoredLog = ignoredLines.map(line => `Linha ${line.lineNumber}: ${line.content}`).join("\n");
        const logBlob = new Blob([ignoredLog], { type: "text/plain" });
        const logLink = document.createElement("a");
        logLink.href = URL.createObjectURL(logBlob);
        logLink.download = "linhas_ignoradas.txt";
        logLink.textContent = "Baixar log de linhas ignoradas";
        logLink.style.display = "block";
        outputElement.appendChild(logLink);

        displayCSVMessage("csvToJsonMessage", "Erros encontrados no CSV. Verifique o log para mais detalhes.", "error");
    } else {
        displayCSVMessage("csvToJsonMessage", "Processamento concluído com sucesso.", "success");
    }

    outputElement.textContent = report;

    if (errors.length === 0) {
        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
        const downloadLink = document.getElementById("downloadLink");
        if (downloadLink) {
            downloadLink.href = URL.createObjectURL(jsonBlob);
            downloadLink.download = "resultado_atualizado.json";
            downloadLink.style.display = "block";
        }
    }
});

// Configuração dos inputs para selecionar os arquivos JSON e CSV
document.getElementById("jsonInput").addEventListener("change", handleJSONUpload);
document.getElementById("csvInput").addEventListener("change", handleCSVUpload);

// Carregamento do JSON
function handleJSONUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            jsonContent = e.target.result;
            displayCSVMessage("csvToJsonMessage", "JSON carregado com sucesso.");
        };
        reader.readAsText(file);
    }
}

// Carregamento do CSV
function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            csvContent = e.target.result;
            displayCSVMessage("csvToJsonMessage", "CSV carregado com sucesso.");
        };
        reader.readAsText(file);
    }
}

// Função auxiliar para contar entradas CSV
function countCSVEntries(csvContent) {
    let inQuotes = false; // Estado para verificar se estamos dentro de aspas
    let entryCount = 0;

    for (let i = 0; i < csvContent.length; i++) {
        const char = csvContent[i];

        if (char === '"') {
            // Alterna o estado ao encontrar aspas
            inQuotes = !inQuotes;
        } else if (char === '\n' && !inQuotes) {
            // Conta a quebra de linha apenas se estiver fora de aspas
            entryCount++;
        }
    }

    // Adiciona uma entrada caso a última linha não termine com '\n'
    if (csvContent[csvContent.length - 1] !== '\n') {
        entryCount++;
    }

    // Remove o cabeçalho da contagem
    return Math.max(entryCount - 1, 0);
}


// Função para interpretar linhas CSV respeitando aspas duplas
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current); // Adiciona o último campo
    return result;
}





// function displayOutput(data) {
//     const outputElement = document.getElementById('output');
//     if (!outputElement) {
//         console.error('Elemento de saída com ID "output" não encontrado.');
//         return;
//     }

//     outputElement.textContent = JSON.stringify(data, null, 2);
// }

// function prepareDownload(data) {
//     const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
//     const downloadLink = document.getElementById('downloadLink');

//     if (!downloadLink) {
//         console.error('Elemento de download com ID "downloadLink" não encontrado.');
//         return;
//     }

//     downloadLink.href = URL.createObjectURL(jsonBlob);
//     downloadLink.download = 'updated_data.json';
//     downloadLink.style.display = 'block';
//     downloadLink.textContent = 'Baixar JSON Atualizado';
// }






// ------------------------------------ Popular o CSV ------------------------------------ //

document.getElementById('generateCSVButton').addEventListener('click', function() {
    const inputFile = document.getElementById('jsonToCsvInput');
    const outputElement = document.getElementById('outputJsonToCsv');
    const downloadLink = document.getElementById('cvs-json_to_csv_downloadLink');
    const messageElement = document.getElementById('jsonToCsvMessage');

    if (!inputFile.files.length) {
        //messageElement.textContent = 'Por favor, selecione um arquivo JSON para continuar.';
        displayCSVMessage('jsonToCsvMessage', 'Por favor, selecione um arquivo JSON para continuar.', 'error');
        return;
    }

    const file = inputFile.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                throw new Error('O arquivo JSON não contém dados válidos.');
            }

            const headers = Object.keys(jsonData[0]).join(';');
            let csvContent = headers + '\n';

            jsonData.forEach(row => {
                const csvRow = Object.values(row).map(value => {
                    if (typeof value === 'string') {
                        value = value.replace(/\n/g, '\n').replace(/\r/g, '');
                        value = value.replace(/"/g, '""');
                        return `"${value}"`;
                    }
                    return value;
                }).join(';');
                csvContent += csvRow + '\n';
            });

            //outputElement.textContent = csvContent;

            // Criar um link de download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download = 'output.csv';
            downloadLink.style.display = 'block';
            //messageElement.textContent = 'CSV gerado com sucesso!';
            displayCSVMessage('jsonToCsvMessage', 'CSV gerado com sucesso!', 'success');



            // Gerar relatório
            const report = generateReport(null, jsonData, csvContent, 'generateCSVButton');
            outputElement.textContent = report;

        } catch (error) {
            messageElement.textContent = 'Erro ao processar o arquivo JSON: ' + error.message;
        }
    };

    reader.readAsText(file);
});

