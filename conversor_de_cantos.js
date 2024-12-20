// Solicitar permissão ao carregar a página
async function requestClipboardPermission() {
    try {
        const permission = await navigator.permissions.query({
            name: "clipboard-read"
        });
        if (permission.state === "granted" || permission.state === "prompt") {
            displayMessage(
                "Permissão para acessar a área de transferência concedida.",
                "success"
            );
        } else {
            displayMessage(
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
            displayMessage('Conteúdo colado com sucesso.', 'success');
        } catch (err) {
            console.error('Erro ao colar:', err);
            displayMessage(
                'Confirme a permissão no diálogo para colar conteúdo externo.',
                'error'
            );
        }
    } else {
        displayMessage(
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

document.getElementById('convertButton').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value.trim();
    if (inputText === '') {
        displayMessage('Por favor, insira uma letra para conversão.', 'error');
        return;
    }
    // Realiza a conversão corretamente, substituindo as quebras de linha reais por '\n'
    const convertedText = inputText.replace(/\n\n/g, '\\n\\n').replace(/\n/g, '\\n');
    document.getElementById('outputText').value = convertedText;
    displayMessage('Conversão realizada com sucesso.', 'success');
});

document.getElementById('copyButton').addEventListener('click', () => {
    const outputText = document.getElementById('outputText').value;
    if (outputText === '') {
        displayMessage('Não há conteúdo para copiar.', 'error');
        return;
    }
    navigator.clipboard.writeText(outputText)
        .then(() => {
            displayMessage('Conteúdo copiado para a área de transferência.', 'success');
        })
        .catch(() => {
            displayMessage('Erro ao copiar conteúdo.', 'error');
        });
});

// Função para exibir mensagens de sucesso ou erro
function displayMessage(message, type) {
    const messageLabel = document.getElementById('messageLabel');
    messageLabel.textContent = message;
    messageLabel.className = `message ${type}`;
}

// Função para limpar mensagens
function clearMessage() {
    const messageLabel = document.getElementById('messageLabel');
    messageLabel.textContent = '';
    messageLabel.className = 'message';
}



// Função para ler e converter arquivo CSV
document.getElementById('processCSVButton').addEventListener('click', async function () {
    const csvImportButton = document.getElementById('csvImportButton');
    const file = csvImportButton.files[0]; // Obtém o arquivo selecionado

    if (!file) {
        displayCSVMessage('Por favor, selecione um arquivo CSV para importar.', 'error');
        return;
    }

    displayCSVMessage('Processando CSV... Por favor, aguarde.', 'processing');

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const content = e.target.result; // Conteúdo do arquivo

            // Regex para dividir linhas, considerando campos com aspas que podem conter quebras de linha
            const lines = content.match(/(?:[^\r\n"]|"(?:\\.|[^"])*")+|[\r\n]+/g).filter(line => line.trim() !== '');

            // Verifica se há ao menos duas linhas (cabeçalho + dados)
            if (lines.length < 2) {
                throw new Error('O arquivo CSV não contém dados suficientes.');
            }

            const headers = lines[0].split(';').map(h => h.trim());
            if (headers.length < 3) {
                throw new Error('O arquivo CSV deve conter ao menos 3 colunas: Entidade, Título, e Cantos.');
            }

            const rows = lines.slice(1); // Ignora o cabeçalho

            const processedRows = [];
            let currentRow = [];
            let insideQuotes = false;

            // Processa linha por linha
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                if (insideQuotes) {
                    // Adiciona linha atual ao conteúdo acumulado do campo entre aspas
                    currentRow[currentRow.length - 1] += `\n${row}`;
                    if (/"/.test(row)) {
                        insideQuotes = false; // Sai do modo "dentro das aspas" quando o campo fecha
                    }
                } else {
                    const columns = row.split(';');
                    currentRow = columns.map(col => col.trim());
                    if (currentRow.some(col => col.startsWith('"') && !col.endsWith('"'))) {
                        insideQuotes = true; // Campo com aspas abertas
                    } else {
                        processedRows.push(currentRow); // Adiciona linha processada
                    }
                }
            }

            // Converte as linhas processadas em CSV formatado
            const outputRows = processedRows.map((row, index) => {
                if (row.length < 3) {
                    throw new Error(`Linha incompleta na linha ${index + 2}.`);
                }

                const entidade = row[0];
                const titulo = row[1];
                let canto = row.slice(2).join(';');

                canto = canto
                    .replace(/^"|"$/g, '') // Remove aspas externas
                    .replace(/\r\n|\r|\n/g, '\\n') // Substitui quebras de linha reais
                    .replace(/""/g, '"'); // Trata aspas escapadas

                return `${entidade};${titulo};"${canto}"`;
            });

            const outputCSV = [headers.join(';'), ...outputRows].join('\n');

            // Cria o Blob para o CSV gerado
            const blob = new Blob([outputCSV], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'converted_cantos.csv';

            // Simula o clique para download do arquivo
            link.click();

            displayCSVMessage('CSV exportado automaticamente para seus downloads.', 'success');
        } catch (err) {
            console.error('Erro ao processar CSV:', err);
            displayCSVMessage(`Erro ao processar o CSV: ${err.message}`, 'error');
        }
    };

    reader.onerror = function () {
        displayCSVMessage('Erro ao ler o arquivo CSV. Tente novamente.', 'error');
    };

    reader.readAsText(file, 'UTF-8'); // Lê o arquivo como texto no formato UTF-8
});




// Função para exibir mensagens de CSV (importação/exportação)
function displayCSVMessage(message, type) {
    const messageLabel = document.getElementById('csvMessage');
    messageLabel.textContent = message;
    messageLabel.className = `message ${type}`;
}
