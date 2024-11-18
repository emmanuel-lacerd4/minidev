console.log("Processo principal")

// Importação de pacotes (bibliotecas)
// nativeTheme (forçar um tema no sistema operacional)
// Menu (criar um menu personalizado)
// Shell (acessar links externos)
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')
const path = require('node:path')

// Importação da biblioteca file system (nativa do JavaScript) para manipular arquivos
const fs = require('fs')

// Criação de um objeto com a estrutura básica de um arquivo
let file = {}

// Janela principal
let win // Importante! Neste projeto o escopo da variavél win deve ser global
function createWindow() {
    nativeTheme.themeSource = 'dark' // Janela sempre escura
    win = new BrowserWindow({
        width: 1010, // Largura em pixels
        height: 720, // Altura em pixels
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    // Menu personalizado
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile('./src/views/index.html')
}

// Janela sobre
function aboutWindow() {
    nativeTheme.themeSource = 'dark'
    // A linha abaixo obtem a janela principal
    const main = BrowserWindow.getFocusedWindow()
    let about
    // Validar a janela pai
    if (main) {
        about = new BrowserWindow({
            width: 320,
            height: 160,
            autoHideMenuBar: true, // Esconder o menu
            resizable: false, // Impedir redimensionamento
            minimizable: false, // Impedir minimizar a janela
            //titleBarStyle: 'hidden' // Esconder a barra de estilo (ex: totem de auto atendimento)
            parent: main, // Estabelece uma hierarquia de janelas
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    about.loadFile('./src/views/sobre.html')

    // Fechar a janela quando receber mensagem do processo de renderização.
    ipcMain.on('close-about', () => {
        console.log("Recebi a mensagem close-about")
        // Validar se a janela foi destruida
        if (about && !about.isDestroyed()) {
            about.close()
        }
    })
}

// Execução assincrona do aplicativo electron
app.whenReady().then(() => {
    createWindow()

    // Comportamento do MAC ao fechar uma janela
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// Encerrar a aplicação quando a janela for fechada (Windows e Linux)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Template do menu
const template = [
    {
        label: 'Arquivo',
        submenu: [
            {
                label: 'Novo',
                accelerator: 'CmdOrCtrl+N',
                click: () => novoArquivo()
            },
            {
                label: 'Abrir',
                accelerator: 'CmdOrCtrl+O',
                click: () => abrirArquivo()
            },
            {
                label: 'Salvar',
                accelerator: 'CmdOrCtrl+S',
                click: () => salvar()
            },
            {
                label: 'Salvar Como',
                accelerator: 'CmdOrCtrl+Shift+S',
                click: () => salvarComo()
            },
            {
                type: 'separator'
            },
            {
                label: 'Sair',
                accelerator: 'Alt+F4',
                click: () => app.quit()
            }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            {
                label: 'Desfazer',
                role: 'undo'
            },
            {
                label: 'Refazer',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Recortar',
                role: 'cut'
            },
            {
                label: 'Copiar',
                role: 'copy'
            },
            {
                label: 'Colar',
                role: 'paste'
            },
        ]
    },
    {
        label: 'Zoom',
        submenu: [
            {
                label: 'Aplicar zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzir',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar o zoom padrão',
                role: 'resetZoom'
            },
        ]
    },
    {
        label: 'Cor',
        submenu: [
            {
                label: 'Amarelo',
                click: () => win.webContents.send('set-color', "var(--amarelo)")
            },
            {
                label: 'Azul',
                click: () => win.webContents.send('set-color', "var(--azul)")
            },
            {
                label: 'Laranja',
                click: () => win.webContents.send('set-color', "var(--laranja)")
            },
            {
                label: 'Pink',
                click: () => win.webContents.send('set-color', "var(--pink)")
            },
            {
                label: 'Roxo',
                click: () => win.webContents.send('set-color', "var(--roxo)")
            },
            {
                label: 'Verde',
                click: () => win.webContents.send('set-color', "var(--verde)")
            },
            {
                type: 'separator'
            },
            {
                label: 'Restaurar a cor padrão',
                click: () => win.webContents.send('set-color', "var(--cinzaClaro)")
            },
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Repositório',
                click: () => shell.openExternal('https://github.com/emmanuel-lacerd4/minidev')
            },
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]

// Novo arquivo >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Passo 1: Criar a estrutura de um arquivo e setar o título
// Um arquivo inicia sem título, sem conteúdo, não está salvo e o local padrão vai ser a pasta documentos
function novoArquivo() {
    file = {
        name: "Sem título",
        content: "",
        saved: false,
        path: app.getPath('documents') + 'Sem título'
    }
    //console.log(file)
    // Enviar ao renderizador a estrutura de um novo arquivo e título
    win.webContents.send('set-file', file)
}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Abrir arquivo >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 2 funções abrirArquivo() e lerArquivo(caminho)
async function abrirArquivo() {
    // Usar um módulo do Electron para abrir o explorador de arquivos
    let dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path // Selecionar o arquivo no local dele
    })
    //console.log(dialogFile)
    // Validação do botão [Cancelar]
    if (dialogFile.canceled === true) {
        return false
    } else {
        // Abrir o arquivo
        file = {
            name: path.basename(dialogFile.filePaths[0]),
            content: lerArquivo(dialogFile.filePaths[0]),
            saved: true,
            path: dialogFile.filePaths[0]
        }
    }
    //console.log(file)
    // Enviar o arquivo para o renderizador
    win.webContents.send('set-file', file)
}

function lerArquivo(filePath) {
    // Usar o trycath sempre que trabalhar com arquivos
    try {
        // A linha abaixo usa a biblioteca fs para ler um arquivo, informando o caminho e o encoding do arquivo
        return fs.readFileSync(filePath, 'utf-8')
    } catch (error) {
        console.log(error)
        return ''
    }
}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Salvar e salvar como >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 3 funções 1-) Salvar como, 2-) Salvar e 3-) Salvar arquivo (fs)
async function salvarComo() {
    let dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path
    })
    //console.log(dialogFile)
    if (dialogFile.canceled === true) {
        return false
    } else {
        salvarArquivo(dialogFile.filePath)
    }
}

function salvar() {
    if (file.saved === true) {
        return salvarArquivo(file.path)
    } else {
        return salvarComo()
    }
}

function salvarArquivo(filePath) {
    console.log(filePath)
    try {
        // Uso da biblioteca fs para gravar um arquivo
        fs.writeFile(filePath, file.content, (error) => {
            file.path = filePath
            file.saved = true
            file.name = path.basename(filePath)
            // Alterar o título ao salvar um arquivo 
            win.webContents.send('set-file', file)
        })
    } catch (error) {
        console.log(error)
    }
}

// Atualização em tempo real do conteúdo object file
ipcMain.on('update-content', (event, value) => {
    file.content = value
})
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<