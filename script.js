// Elementos do DOM
const sidebar = document.getElementById("sidebar")
const sidebarOverlay = document.getElementById("sidebarOverlay")
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const sidebarToggle = document.getElementById("sidebarToggle")
const sidebarLinks = document.querySelectorAll(".sidebar-menu a")

// Variáveis para terminais funcionais
let serverRunning = false
let clientRequests = []

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initializeSidebar()
  highlightActiveSection()
  initializeLazyLoading()
  setTimeout(initializeTerminals, 100) // Pequeno delay para garantir que o DOM está pronto
})

// Gerenciamento da sidebar
function initializeSidebar() {
  // Event listeners para abrir/fechar sidebar
  mobileMenuBtn.addEventListener("click", openSidebar)
  sidebarToggle.addEventListener("click", closeSidebar)
  sidebarOverlay.addEventListener("click", closeSidebar)

  // Event listeners para navegação
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("data-section")
      scrollToSection(targetId)

      // Fechar sidebar no mobile após clicar
      if (window.innerWidth < 768) {
        closeSidebar()
      }
    })
  })
}

function openSidebar() {
  sidebar.classList.add("active")
  sidebarOverlay.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeSidebar() {
  sidebar.classList.remove("active")
  sidebarOverlay.classList.remove("active")
  document.body.style.overflow = ""
}

// Navegação suave
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId)
  if (element) {
    const offsetTop = sectionId === "introducao" ? 0 : element.offsetTop - 20

    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    })
  }
}

// Copiar código
function copyCode(codeId = "codeBlock") {
  const codeBlock = document.getElementById(codeId)
  if (!codeBlock) {
    return
  }
  
  const text = codeBlock.textContent

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Código copiado com sucesso
      })
      .catch(() => {
        fallbackCopyTextToClipboard(text)
      })
  } else {
    fallbackCopyTextToClipboard(text)
  }
}

// Fallback para copiar texto (navegadores mais antigos)
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.style.top = "0"
  textArea.style.left = "0"
  textArea.style.position = "fixed"

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand("copy")
    // Código copiado com sucesso
  } catch (err) {
    // Erro ao copiar código
  }

  document.body.removeChild(textArea)
}

// Lazy loading de imagens
function initializeLazyLoading() {
  const images = document.querySelectorAll("img[data-src]")

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove("lazy")
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach((img) => imageObserver.observe(img))
  } else {
    // Fallback para navegadores sem suporte ao IntersectionObserver
    images.forEach((img) => {
      img.src = img.dataset.src
      img.classList.remove("lazy")
    })
  }
}

// Função para destacar a seção ativa
function highlightActiveSection() {
  const sections = document.querySelectorAll(".content-section, header")
  const scrollPos = window.pageYOffset + 100

  sections.forEach((section) => {
    const top = section.offsetTop
    const bottom = top + section.offsetHeight
    const id = section.getAttribute("id")

    if (scrollPos >= top && scrollPos <= bottom) {
      // Remove active class from all links
      sidebarLinks.forEach((link) => link.classList.remove("active"))

      // Add active class to current section link
      const activeLink = document.querySelector(`[data-section="${id}"]`)
      if (activeLink) {
        activeLink.classList.add("active")
      }
    }
  })
}

// Event listener para scroll
window.addEventListener("scroll", highlightActiveSection)

// Funcionalidade dos terminais interativos
function initializeTerminals() {
  // Verificar se os terminais existem na página
  const serverTerminal = document.querySelector('.terminal-section:first-of-type .terminal-header')
  const clientTerminal = document.querySelector('.terminal-section:last-of-type .terminal-header')
  
  if (!serverTerminal || !clientTerminal) {
    return // Não há terminais na página atual
  }
  
  // Adicionar botões de controle aos terminais
  addTerminalControls()
  
  // Limpar terminais inicialmente
  clearTerminals()
}

function addTerminalControls() {
  const serverTerminal = document.querySelector('.terminal-section:first-of-type .terminal-header')
  const clientTerminal = document.querySelector('.terminal-section:last-of-type .terminal-header')
  
  // Botão para o servidor
  const serverControls = document.createElement('div')
  serverControls.className = 'terminal-controls'
  serverControls.innerHTML = `
    <button class="terminal-btn" onclick="startServer()" id="startServerBtn">
      <i class="fas fa-play"></i> Iniciar
    </button>
    <button class="terminal-btn" onclick="stopServer()" id="stopServerBtn" disabled>
      <i class="fas fa-stop"></i> Parar
    </button>
  `
  
  // Botão para o cliente
  const clientControls = document.createElement('div')
  clientControls.className = 'terminal-controls'
  clientControls.innerHTML = `
    <button class="terminal-btn" onclick="runClient()" id="runClientBtn" disabled>
      <i class="fas fa-play"></i> Executar
    </button>
    <button class="terminal-btn" onclick="clearTerminals()" id="clearBtn">
      <i class="fas fa-trash"></i> Limpar
    </button>
  `
  
  serverTerminal.appendChild(serverControls)
  clientTerminal.appendChild(clientControls)
}

function clearTerminals() {
  const serverOutput = document.querySelector('.terminal-section:first-of-type .terminal-output')
  const clientOutput = document.querySelector('.terminal-section:last-of-type .terminal-output')
  
  if (serverOutput && clientOutput) {
    serverOutput.textContent = '$ python professor_servidor.py'
    clientOutput.textContent = '$ python aluno_cliente.py'
  }
  
  serverRunning = false
  clientRequests = []
  updateButtonStates()
}

function updateButtonStates() {
  const startBtn = document.getElementById('startServerBtn')
  const stopBtn = document.getElementById('stopServerBtn')
  const clientBtn = document.getElementById('runClientBtn')
  
  if (startBtn && stopBtn && clientBtn) {
    startBtn.disabled = serverRunning
    stopBtn.disabled = !serverRunning
    clientBtn.disabled = !serverRunning
  }
}

function startServer() {
  const serverOutput = document.querySelector('.terminal-section:first-of-type .terminal-output')
  
  if (!serverOutput) return
  
  serverOutput.textContent = '$ python professor_servidor.py'
  
  setTimeout(() => {
    serverOutput.textContent += '\nServidor do Professor online e aguardando chamadas RPC...'
    serverRunning = true
    updateButtonStates()
  }, 500)
}

function stopServer() {
  const serverOutput = document.querySelector('.terminal-section:first-of-type .terminal-output')
  
  if (!serverOutput) return
  
  serverOutput.textContent += '\n^C\nServidor interrompido pelo usuário.'
  serverRunning = false
  updateButtonStates()
}

function runClient() {
  if (!serverRunning) {
    return
  }
  
  const clientOutput = document.querySelector('.terminal-section:last-of-type .terminal-output')
  const serverOutput = document.querySelector('.terminal-section:first-of-type .terminal-output')
  
  if (!clientOutput || !serverOutput) return
  
  clientOutput.textContent = '$ python aluno_cliente.py'
  
  // Simular execução do cliente
  simulateClientExecution(clientOutput, serverOutput)
}

function simulateClientExecution(clientOutput, serverOutput) {
  const steps = [
    {
      delay: 500,
      client: '[ALUNO 1]: Preciso de ajuda do professor. Fazendo chamada RPC...',
      server: '[PROFESSOR]: Recebi uma solicitação de ajuda do Aluno 1.'
    },
    {
      delay: 2000,
      client: '',
      server: '[PROFESSOR]: Ajudei o Aluno 1. Enviando a resposta.'
    },
    {
      delay: 500,
      client: '[ALUNO 1]: Recebi a resposta remota: \'Ajuda concluída com sucesso para o Aluno 1.\'\n[ALUNO 1]: Tarefa finalizada.',
      server: ''
    },
    {
      delay: 1000,
      client: '[ALUNO 2]: Preciso de ajuda do professor. Fazendo chamada RPC...',
      server: '[PROFESSOR]: Recebi uma solicitação de ajuda do Aluno 2.'
    },
    {
      delay: 2000,
      client: '',
      server: '[PROFESSOR]: Ajudei o Aluno 2. Enviando a resposta.'
    },
    {
      delay: 500,
      client: '[ALUNO 2]: Recebi a resposta remota: \'Ajuda concluída com sucesso para o Aluno 2.\'\n[ALUNO 2]: Tarefa finalizada.',
      server: ''
    }
  ]
  
  let currentStep = 0
  
  function executeStep() {
    if (currentStep >= steps.length) return
    
    const step = steps[currentStep]
    
    setTimeout(() => {
      if (step.client) {
        clientOutput.textContent += '\n' + step.client
      }
      if (step.server) {
        serverOutput.textContent += '\n' + step.server
      }
      
      // Scroll para o final do terminal
      clientOutput.scrollTop = clientOutput.scrollHeight
      serverOutput.scrollTop = serverOutput.scrollHeight
      
      currentStep++
      executeStep()
    }, step.delay)
  }
  
  executeStep()
}
