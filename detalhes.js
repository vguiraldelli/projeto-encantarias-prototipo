
// Obtém o ID do item pela URL
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('id');

// Carregar os dados do JSON
fetch('Data_Pontos.json')
    .then(response => response.json())
    .then(data => {
        // Busca o item correspondente pelo ID
        const item = data.find((ponto) => ponto.ID === itemId);

        if (item) {

            // Chama processarEntidade para obter a Entidade e o subtítulo
            const { entidadePrincipal, subtituloEntidade } = processarEntidade(item.Entidade);
            // Processa os toques separadamente
            const toquesHtml = processarToques(item.Toque);
            // Processa a letra
            const letraHtml = gerarLetras(item.Letra);

            document.getElementById("gallery").innerHTML = `
                <div class="card-container-detalhes">
                    <div class="card-content">
                       <div class="title-container">
                            <h1 class="title-entidade">${entidadePrincipal  || "Desconhecido"}</h1> <!-- Exibe a Entidade ou Desconhecido -->
                            ${subtituloEntidade ? `<h3 class="subtitle-entidade">${subtituloEntidade}</h3>` : ""}
                            <h3 class="title-titulo">${item.Título  || "Sem Título"}</h3>
                            <h4 class="title-toque">${toquesHtml  || "Não especificado"}</h4> <!-- Exibe os toques como cards -->
                        </div>
                        <div class="card-box">
                            <div class="container-letra">
                                ${letraHtml}
                            </div>
                        </div>
                        <input type="button" class="btn_normal" name="btn-sair" value="Sair" onclick="javascript:window.close()">
                        <!-- Adicione outros detalhes aqui -->
                    </div>
                </div>
                `;

                    // <p><strong>Letra:</strong> ${item.Letra || "Sem Letra"}</p>
                    // <p><strong>Função:</strong> ${item.Função || "Não especificada"}</p>
                    // <p><strong>Toque:</strong> ${item.Toque || "Não especificado"}</p>
        } else {
            document.getElementById("details-container").innerHTML = `<p>Item não encontrado.</p>`;
        }
    })
    .catch(err => console.error('Erro ao carregar dados:', err));

    // Função para processar o campo Entidade
    function processarEntidade(entidade) {
        
        // Separa as entidades pelo delimitador
        const entidades = entidade.split(/[,;]/).map(ent => ent.trim());

        if (entidades.includes("Diversos")) {
            // Se "Diversos" estiver presente
            const outrasEntidades = entidades.filter(ent => ent !== "Diversos").sort((a, b) => a.localeCompare(b));

            // Se houver mais de uma entidade após "Diversos"
            let subtitulo = "";
            
            if (outrasEntidades.length > 0) {
                if (outrasEntidades.length === 1) {
                    subtitulo = outrasEntidades[0]; // Só uma entidade, exibe ela
                } else {
                    // Para mais de uma entidade, separa todas com vírgula, e coloca "e" antes da última
                    subtitulo = outrasEntidades.slice(0, -1).join(", ") + " e " + outrasEntidades[outrasEntidades.length - 1];
                }
            }

            return {
                entidadePrincipal: "Diversos",
                subtituloEntidade: subtitulo || null, // Subtítulo ou null se não houver outras entidades
            };
            
        }

        // Se não houver "Diversos", usa a entidade completa
        return {
            entidadePrincipal: entidade,
            subtituloEntidade: null,
        };
    }

    // Função para processar os toques
    function processarToques(toques) {
        // Se o campo 'Toque' estiver vazio, retorna uma string vazia
        if (!toques.trim()) return "";

        // Separa os toques por vírgula ou ponto e vírgula e remove espaços extras
        const toquesSeparados = toques.split(/[,;]/).map(toque => toque.trim()).filter(toque => toque !== "");

        // Cria os cards dos toques
        let toquesHtml = '';
        toquesSeparados.forEach(toque => {
            toquesHtml += `<span class="card-toque">${toque}</span>`;
        });

        return toquesHtml; // Retorna os toques formatados como cards
    }

    // Função para gerar as letras com repetições
    function gerarLetras(letra) {
        // Separa as estrofes por duas quebras de linha
        const estrofes = letra.split("\n\n").map(estrofe => estrofe.trim()).filter(estrofe => estrofe !== "");
        let container = ``;

        estrofes.forEach(estrofe => {
            const linhas = estrofe.split("\n").map(linha => linha.trim()).filter(linha => linha !== "");
            const matchRepeticao = linhas[0].match(/^(\d+)x$/); // Verifica se a primeira linha indica repetição (ex: "2x")

            if (matchRepeticao) {
                // Bloco com repetição
                const repeticoes = parseInt(matchRepeticao[1], 10);
                const linhasSemRepeticao = linhas.slice(1); // Remove a linha com "Xx"
                container += criarBlocoComRepeticao(linhasSemRepeticao, repeticoes);
            } else {
                // Bloco sem repetição
                container += criarBlocoSemRepeticao(linhas);
            }
        });

        return container;
    }

    // Função para criar um bloco com repetição
    function criarBlocoComRepeticao(linhas, repeticoes) {
        let html = `<div class="container-repeticao"><div class="my-div">`;
        linhas.forEach(linha => {
            html += `<p class="letra">${linha}</p>`;
        });
        html += `</div>`;
        html += `<div class="span-repit">`;
        html += `<span class="chavetaodir${linhas.length}x">&nbsp;}</span>`;
        html += `<span class="repit">&nbsp;${repeticoes}x</span>`;
        html += `</div>`;
        html += `</div>`;
        return html;
    }

    // Função para criar um bloco sem repetição
    function criarBlocoSemRepeticao(linhas) {
        let html = `<div class="my-div-norepit">`;
        linhas.forEach(linha => {
            html += `<p class="letra">${linha}</p>`;
        });
        html += `</div>`;
        return html;
    }
    