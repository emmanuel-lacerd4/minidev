/**
 * Processos de renderização
 */

console.log("Processo de renderização")

// Botão OK (Janela sobre)
function fechar() {
    api.fecharJanela()
}

// Capturar o id de textarea (importante !)
const area = document.getElementById('txtArea')

// Iniciar o APP com foco na área de digitação
area.focus()

// Numeração automática de linhas
function atualizarLinhas() {
    // Capturar o id do container das linhas
    const linhasNumeradas = document.getElementById('linhas')
    // Variável de apoio usada na renderização das linhas no HTML
    let linhasNumeradasHTML = ""
    // Divide o conteúdo da área de texto (tag textArea) em um array de linhas, utilizando o \n como delimitador (nova linha)
    let linha = area.value.split('\n')
    // Percorrer o array de linhas adicionando um número de linha a cada loop
    for (let i = 0; i < linha.length; i++) {
        linhasNumeradasHTML += i + 1 + '<br>'
    }
    // Atualizar documento HTML
    linhasNumeradas.innerHTML = linhasNumeradasHTML
}

// Inicar automaticamente a função junto com o APP (linha 1)
atualizarLinhas()

// Adicionar um evento de entrada a área de texto (textarea) para atualizar as linhas numeradas
area.addEventListener('input', () => {
    atualizarLinhas()
})

// Adicionar um evento de rolagem a área de texto (textarea) para sincronizar com as linhas
area.addEventListener('scroll', () => {
    document.getElementById('linhas').scrollTop = area.scrollTop
})

// Identação do código ao pressionar a tecla TAB
area.addEventListener('keydown', (event) => {
    // Se a tecla TAB for pressionada
    if (event.key === 'Tab') {
        // Ignorar o comportamento padrão
        event.preventDefault()
        // Variáveis de apoio
        const textarea = event.target
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        // Definir o número de espaços para o TAB
        // Dica: usar o "\t" para um TAB real do sistema
        const ident = '  ' // TAB equivale a 2 espaços
        // Adicionar a identação no ponto do cursor
        textarea.value = textarea.value.substring(0, start) + ident + textarea.value.substring(end)
        // Mover o cursor para frente após a identação
        textarea.selectionStart = textarea.selectionEnd = start + ident.length
    }
})

// Mudar a cor do texto
api.setColor((event, color) => {
    // Validação
    if (area) {
        // Trocar a cor da fonte (style -> CSS)
        area.style.color = color
    }
})

// Novo arquivo - Carregar a estrutura do arquivo e mudar o título
api.setFile((event, file) => {
    area.value = file.content
    // Capturar o id do título
    const nomeArquivo = document.getElementById("titulo")
    nomeArquivo.innerHTML = `${file.name} - Mini Dev Editor`
})