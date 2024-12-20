// --------- Função para alternar o modo com base na seleção --------- //
function alternarModo(event) {
    const body = document.body;
    const modoSelecionado = event.target.value; // Obtém o valor selecionado (light-mode ou dark-mode)

    // Remove ambas as classes e adiciona a classe selecionada
    body.classList.remove("light-mode", "dark-mode");
    body.classList.add(modoSelecionado);

    // Salva a preferência no localStorage
    localStorage.setItem("theme", modoSelecionado);
}

// Função para carregar o tema preferido do usuário
function carregarTema() {
    const body = document.body;
    const temaSalvo = localStorage.getItem("theme") || "light-mode"; // Padrão: light-mode

    // Aplica o tema salvo ao body
    body.classList.add(temaSalvo);

    // Marca o input correspondente
    if (temaSalvo === "dark-mode") {
        document.getElementById("darkMode").checked = true;
    } else {
        document.getElementById("lightMode").checked = true;
    }
}

// Adiciona eventos aos inputs radio
document.getElementById("lightMode").addEventListener("change", alternarModo);
document.getElementById("darkMode").addEventListener("change", alternarModo);

// Carrega o tema salvo ao carregar a página
document.addEventListener("DOMContentLoaded", carregarTema);







// Função para contar as linhas visíveis dentro de um elemento
function contarLinhas(elemento) {
    const estilo = window.getComputedStyle(elemento);
    let alturaLinha = parseFloat(estilo.lineHeight);

    // Fallback para altura da linha caso não seja um número válido
    if (isNaN(alturaLinha)) {
        alturaLinha = 18; // Valor padrão caso a altura da linha não seja um número válido
    }

    const alturaElemento = elemento.clientHeight;

    // Calcula o número de linhas visíveis
    return Math.floor(alturaElemento / alturaLinha);
}


// Função alterar entre as Tabs do Conversor
function openPage(pageName, elmnt, color) {
    // Hide all elements with class="tabcontent" by default */
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Remove the background color of all tablinks/buttons
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].style.backgroundColor = "";
    }
  
    // Show the specific tab content
    document.getElementById(pageName).style.display = "block";
  
    // Add the specific color to the button used to open the tab content
    elmnt.style.backgroundColor = color;
  }
  
  // Get the element with id="defaultOpen" and click on it
  document.getElementById("defaultOpen").click(); 


  


  document.querySelectorAll('.tablink').forEach(button => {
    button.addEventListener('click', function() {
        // Remove a classe 'active' de todos os botões
        document.querySelectorAll('.tablink').forEach(btn => {
            btn.classList.remove('active');
        });

        // Adiciona a classe 'active' ao botão clicado
        this.classList.add('active');
    });
});