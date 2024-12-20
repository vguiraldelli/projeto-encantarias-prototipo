// Função do botão de Scroll Return
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth" // Faz o scroll suave
    });
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('Iniciando filtro dinâmico...');

    // Carrega os dados JSON ////////////////////////////////////////////////////////////////
    fetch('Data_Pontos.json')
        .then(response => response.json())
        .then(data => {
            console.log('Dados carregados:', data);

            // Inicializa os selects com as opções
            inicializarSelects(data);

            // Inicializa o repeater com todos os itens do JSON
            atualizarRepeater(data);

            // Adiciona evento de mudança para atualizar outros selects e a galeria
            const selects = document.querySelectorAll('.select');
            selects.forEach(select => {
                select.addEventListener('change', function () {
                    atualizarSelectsFiltrados(data, select); // Atualiza os filtros dinâmicos, mas não o filtro alterado
                    atualizarRepeaterFiltrado(data); // Atualiza a galeria com os dados filtrados
                });
            });

            // Evento para o botão de reset
            const resetButton = document.querySelector('.btn_reset');
            resetButton.addEventListener('click', function (event) {
                event.preventDefault(); // Previne o comportamento padrão do botão
                resetFiltros(data); // Chama a função para resetar os filtros
                atualizarRepeater(data); // Exibe todos os pontos após o reset
            });
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));
    /////////////////////////////////////////////////////////////////////////////////////////

    // Função para inicializar os selects com as opções do JSON ////////////////////////////
    function inicializarSelects(data) {
        const cultoSelect = document.getElementById('culto');
        const tipoSelect = document.getElementById('tipo');
        const funcaoSelect = document.getElementById('funcao');
        const linhaSelect = document.getElementById('linha');
        const generoSelect = document.getElementById('genero');
        const entidadeSelect = document.getElementById('entidade');
        const tituloSelect = document.getElementById('titulo');
        const toqueSelect = document.getElementById('toque');
    
        // Extrai opções únicas para cada filtro

        // Extrai Cultos únicos
        const cultos = new Set();
        data.forEach(item => {
            const cultosSeparados = item.Culto.split(',').map(culto => culto.trim());
            cultosSeparados.forEach(culto => cultos.add(culto));
        });
        const cultosArray = [...cultos];

        const tipos = [...new Set(data.map(item => item.Tipo))];
        const funcoes = [...new Set(data.map(item => item.Função))];
        const linhas = [...new Set(data.map(item => item.Linha))];
        const generos = [...new Set(data.map(item => item.Gênero))];

        // Extrai Entidades únicas
        const entidades = new Set();
        data.forEach(item => {
            const entidadesSeparadas = item.Entidade.split(',').map(entidade => entidade.trim());
            entidadesSeparadas.forEach(entidade => entidades.add(entidade));
        });
        const entidadesArray = [...entidades];

        const titulos = [...new Set(data.map(item => item.Título))];
    
        // Extrai Toques únicos
        const toques = new Set();
        data.forEach(item => {
            const toquesSeparados = item.Toque.split(',').map(toque => toque.trim());
            toquesSeparados.forEach(toque => toques.add(toque));
        });
        const toquesArray = [...toques];
    
        // Popula os filtros
        preencherSelect(cultoSelect, cultosArray);
        preencherSelect(tipoSelect, tipos);
        preencherSelect(funcaoSelect, funcoes);
        preencherSelect(linhaSelect, linhas);
        preencherSelect(generoSelect, generos);
        preencherSelect(entidadeSelect, entidadesArray);
        preencherSelect(tituloSelect, titulos);
        preencherSelect(toqueSelect, toquesArray);
    }
    ////////////////////////////////////////////////////////////////////////////////////////

    // Função que preenche um select com opções
    function preencherSelect(select, opcoes) {
        select.innerHTML = ''; // Limpa as opções atuais

        // Se for o select 'funcao', adiciona a opção 'Função' como primeira opção
        if (select.id === 'funcao') {
            select.appendChild(new Option('Função', 'todos')); // Define 'Função' como primeira opção
        } else {
            select.appendChild(new Option(select.id.charAt(0).toUpperCase() + select.id.slice(1), 'todos')); // Adiciona a opção padrão 'todos' para todos os filtros
        }

        // Filtra as opções para não adicionar valores vazios
        const opcoesFiltradas = opcoes.filter(opcao => opcao !== "");

        // Ordena as opções filtradas em ordem alfabética
        const opcoesOrdenadas = opcoesFiltradas.sort((a, b) => a.localeCompare(b));

        // Verifica se o select é o de 'Toque', 'Culto' ou 'Entidade' e trata de forma especial
        if (select.id === 'toque' || select.id === 'culto' || select.id === 'entidade') {
            // Para os filtros 'Toque', 'Culto' e 'Entidade', precisamos separar as opções corretamente
            const opcoesUnicas = new Set();
            opcoesOrdenadas.forEach(opcao => {
                const opcoesSeparadas = opcao.split(/[,;]/).map(opcao => opcao.trim());  // Divide as opções por vírgula ou ponto e vírgula
                opcoesSeparadas.forEach(opcao => opcoesUnicas.add(opcao)); // Adiciona cada opção separadamente
            });

            // Adiciona as opções separadas ao select
            [...opcoesUnicas].sort((a, b) => a.localeCompare(b)).forEach(opcao => {
                const option = new Option(opcao, opcao);
                select.appendChild(option);
            });
        } else {
            // Para os outros filtros, apenas adiciona as opções diretamente
            opcoesOrdenadas.forEach(opcao => {
                const option = new Option(opcao, opcao);
                select.appendChild(option);
            });
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////

    // Função para resetar os filtros e atualizar a galeria ///////////////////////////////
    function resetFiltros(data) {
        // Reseta todos os filtros para o valor 'todos'
        const selects = document.querySelectorAll('.select');
        selects.forEach(select => {
            select.value = 'todos'; // Define o valor padrão para todos os filtros
        });

        // Repopula os selects com todas as opções
        inicializarSelects(data);

        // Atualiza a galeria para exibir todos os itens sem re-popular os filtros
        atualizarRepeater(data);
        // Atualiza a contagem de linhas após aplicar os filtros
        atualizarTodosContainers();
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////

    // Função para atualizar os filtros dinamicamente com base na seleção de um filtro ///
    function atualizarSelectsFiltrados(data, selectAlterado) {
        const filtroCulto = document.getElementById('culto').value;
        const filtroTipo = document.getElementById('tipo').value;
        const filtroFuncao = document.getElementById('funcao').value;
        const filtroLinha = document.getElementById('linha').value;
        const filtroGenero = document.getElementById('genero').value;
        const filtroEntidade = document.getElementById('entidade').value;
        const filtroTitulo = document.getElementById('titulo').value;
        const filtroToque = document.getElementById('toque').value;

        // Filtra os dados com base nos filtros aplicados
        const dadosFiltrados = data.filter(item => {
            return (
                (filtroCulto === 'todos' || item.Culto.includes(filtroCulto)) &&
                (filtroTipo === 'todos' || item.Tipo === filtroTipo) &&
                (filtroFuncao === 'todos' || item.Função === filtroFuncao) &&
                (filtroLinha === 'todos' || item.Linha === filtroLinha) &&
                (filtroGenero === 'todos' || item.Gênero === filtroGenero) &&
                (filtroEntidade === 'todos' || item.Entidade.includes(filtroEntidade)) &&
                (filtroTitulo === 'todos' || item.Título === filtroTitulo) &&
                (filtroToque === 'todos' || item.Toque.includes(filtroToque)) // Verifica se o Toque contém a opção filtrada
            );
        });

        // Atualiza as opções dos filtros com base nos dados filtrados, mas não o filtro alterado
        if (selectAlterado.id !== 'culto') atualizarSelect('culto', dadosFiltrados, 'Culto', filtroCulto);
        if (selectAlterado.id !== 'tipo') atualizarSelect('tipo', dadosFiltrados, 'Tipo', filtroTipo);
        if (selectAlterado.id !== 'funcao') atualizarSelect('funcao', dadosFiltrados, 'Função', filtroFuncao);
        if (selectAlterado.id !== 'linha') atualizarSelect('linha', dadosFiltrados, 'Linha', filtroLinha);
        if (selectAlterado.id !== 'genero') atualizarSelect('genero', dadosFiltrados, 'Gênero', filtroGenero);
        if (selectAlterado.id !== 'entidade') atualizarSelect('entidade', dadosFiltrados, 'Entidade', filtroEntidade);
        if (selectAlterado.id !== 'titulo') atualizarSelect('titulo', dadosFiltrados, 'Título', filtroTitulo);
        if (selectAlterado.id !== 'toque') atualizarSelect('toque', dadosFiltrados, 'Toque', filtroToque);

        
    }
    //////////////////////////////////////////////////////////////////////////////////////

    // Função para atualizar o select de acordo com os dados filtrados //////////////////
    function atualizarSelect(selectId, dadosFiltrados, campo, valorSelecionado) {
        const select = document.getElementById(selectId);
        const opcoes = [...new Set(dadosFiltrados.map(item => item[campo]))];

        // Atualiza as opções do select
        preencherSelect(select, opcoes);

        // Define o valor selecionado de volta para o select
        select.value = valorSelecionado;
    }
    /////////////////////////////////////////////////////////////////////////////////////


///// Início das funções do Repeater da Galeria de Pontos //////////////////////////////

    // Função para atualizar a galeria com os itens filtrados
    function atualizarRepeaterFiltrado(data) {
        const filtroCulto = document.getElementById('culto').value;
        const filtroTipo = document.getElementById('tipo').value;
        const filtroFuncao = document.getElementById('funcao').value;
        const filtroLinha = document.getElementById('linha').value;
        const filtroGenero = document.getElementById('genero').value;
        const filtroEntidade = document.getElementById('entidade').value;
        const filtroTitulo = document.getElementById('titulo').value;
        const filtroToque = document.getElementById('toque').value;
    
        // Filtra os dados com base nos filtros aplicados
        const dadosFiltrados = data.filter(item => {
            return (
                (filtroCulto === 'todos' || item.Culto.includes(filtroCulto)) &&
                (filtroTipo === 'todos' || item.Tipo === filtroTipo) &&
                (filtroFuncao === 'todos' || item.Função === filtroFuncao) &&
                (filtroLinha === 'todos' || item.Linha === filtroLinha) &&
                (filtroGenero === 'todos' || item.Gênero === filtroGenero) &&
                (filtroEntidade === 'todos' || item.Entidade.includes(filtroEntidade)) &&
                (filtroTitulo === 'todos' || item.Título === filtroTitulo) &&
                (filtroToque === 'todos' || item.Toque.includes(filtroToque))
            );
        });
    
        // Atualiza a galeria com os dados filtrados
        atualizarRepeater(dadosFiltrados);
        // Atualiza a contagem de linhas após aplicar os filtros
        atualizarTodosContainers();
    }

    // Função para atualizar o repeater com os itens filtrados
    function atualizarRepeater(dados) {
        const contentDiv = document.getElementById('gallery');
        contentDiv.innerHTML = '';  // Limpa a galeria antes de adicionar os itens
    
        // Verifica se há dados para mostrar
        if (dados.length === 0) {
            contentDiv.innerHTML = '<p>Nenhum ponto encontrado com os filtros aplicados.</p>';
            return;
        }
    
        // Preenche a galeria com os dados filtrados
        dados.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('card-container');
    
            // Gerando o HTML do item
            const cardHtml = gerarCard(item);
            itemDiv.innerHTML = cardHtml;
    
            contentDiv.appendChild(itemDiv);
        });

        // Atualiza a contagem de linhas após aplicar os filtros
        atualizarTodosContainers();
    }

    // Função para gerar o HTML do card
    function gerarCard(item) {
        // Chama processarEntidade para obter a Entidade e o subtítulo
        const { entidadePrincipal, subtituloEntidade } = processarEntidade(item.Entidade, item.Título);
        
        // Processa os toques separadamente
        const toquesHtml = processarToques(item.Toque);
        
        const letraHtml = gerarLetras(item.Letra);
        
        return `
            <div class="title-container">
                <h1 class="title-entidade" title="Entidade">${entidadePrincipal}</h1> <!-- Exibe a Entidade ou Título -->
                ${subtituloEntidade ? `<h3 class="subtitle-entidade" title="Entidades">${subtituloEntidade}</h3>` : ""}
                <h3 class="title-titulo" title="Título">${item.Título}</h3>
                <h4 class="title-toque" title="Toque">${toquesHtml}</h4> <!-- Exibe os toques como cards -->
            </div>
            <div class="card-box">
                <div class="container-letra">
                    ${letraHtml}
                </div>
            </div>
            <button id ="" class ="btn_normal" onclick="window.open('detalhes.html?id=${item.ID}','_blank')" type="button">Mais detalhes</button>
            <button id="" class="btn_seta_top" onclick="scrollToTop()">
                <p class="seta-rotator">&#10163;</p>
            </button>
            
        `;
    }


    // Função para processar o campo Entidade
    function processarEntidade(entidade, titulo) {
        // Se a Entidade estiver vazia, usa o Título
        if (entidade.trim() === "") {
            return {
                entidadePrincipal: titulo,  // Substitui a Entidade por Título
                subtituloEntidade: null,
            };
        }

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
    // Cria a estrutura principal do bloco
    const containerRepeticao = document.createElement("div");
    containerRepeticao.classList.add("container-repeticao");

    const myDiv = document.createElement("div");
    myDiv.classList.add("my-div");

    // Adiciona as linhas à div
    linhas.forEach(linha => {
        const p = document.createElement("p");
        p.classList.add("letra");
        p.textContent = linha;
        myDiv.appendChild(p);
    });

    // Adiciona a `my-div` ao contêiner principal
    containerRepeticao.appendChild(myDiv);

    // Cria o elemento de repetição e informações com um id único
    const spanRepit = document.createElement("div");
    spanRepit.classList.add("span-repit");

    // Adiciona um id único ao elemento .chavetaodir baseado na contagem de linhas
    const chavetaId = `chavetaodir${linhas.length}x`; // Exemplo de id único baseado na contagem de linhas

    spanRepit.innerHTML = `
        <div id="${chavetaId}" class="chavetaodir">
            <div class="div_chavetao"><span class="span_teste">}</span></div>
        </div>
            <div class="repit">${repeticoes}x</div>
    `;

    containerRepeticao.appendChild(spanRepit);

    // Atualiza a contagem de linhas em tempo real e armazena na variável global
    atualizarContagemLinhas(myDiv, spanRepit);

    // Retorna o HTML gerado
    return containerRepeticao.outerHTML;
}



// Função para atualizar a contagem de linhas e a classe do chavetaodir
function atualizarContagemLinhas(myDiv, spanRepit) {
    const atualizarLinhas = () => {
        const linhasCont = contarLinhas(myDiv);
        console.log("Contagem de linhas atualizada:", linhasCont);

        // Atualiza a classe do chavetaodir com base na contagem de linhas
        const chavetaElement = spanRepit.querySelector(".chavetaodir");

        if (chavetaElement) {
            // Remove a classe antiga (se existir)
            chavetaElement.className = 'chavetaodir'; // Reseta para a classe base

            // Adiciona a nova classe de acordo com a contagem de linhas
            chavetaElement.classList.add(`chavetaodir${linhasCont}x`);
        } else {
            console.error("Elemento .chavetaodir não encontrado em spanRepit.");
        }
    };

    // Observa alterações de tamanho no elemento e atualiza a contagem de linhas
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(atualizarLinhas);
    });
    resizeObserver.observe(myDiv); // Observa o contêiner `myDiv`

    // Atualiza a contagem de linhas inicialmente com um pequeno atraso
    setTimeout(() => {
        requestAnimationFrame(atualizarLinhas);
    }, 100); // Pequeno atraso para garantir a renderização completa
}




// Função para atualizar todos os contêineres
function atualizarTodosContainers() {
    const containers = document.querySelectorAll('.container-repeticao');
    containers.forEach(container => {
        const myDiv = container.querySelector('.my-div');
        const spanRepit = container.querySelector('.span-repit');
        if (myDiv && spanRepit) {
            atualizarContagemLinhas(myDiv, spanRepit, (linhasCont) => {
                console.log("Contagem de linhas atualizada:", linhasCont);

                // Atualiza a classe do chavetaodir com base na contagem de linhas
                const chavetaElement = spanRepit.querySelector(".chavetaodir");
                if (chavetaElement) {
                    chavetaElement.classList.remove(`chavetaodir${linhasContagemGlobal}x`);
                    chavetaElement.classList.add(`chavetaodir${linhasCont}x`);
                    console.log(spanRepit.innerHTML); // Verifica se o elemento foi adicionado corretamente
                } else {
                    console.error("Elemento .chavetaodir não encontrado em spanRepit.");
                }
            });
        }
    });
}

// Garante que a contagem de linhas seja atualizada após o carregamento completo da página
window.addEventListener('load', () => {
    setTimeout(atualizarTodosContainers, 100); // Pequeno atraso para garantir a renderização completa
});





    // Função para criar um bloco sem repetição
    function criarBlocoSemRepeticao(linhas) {
        let html = `<div class="my-div-norepit">`;
        linhas.forEach(linha => {
            html += `<p class="letra">${linha}</p>`;
        });
        html += `</div>`;
        return html;
    }


});




