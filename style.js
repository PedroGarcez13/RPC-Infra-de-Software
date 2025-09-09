// Elementos do DOM
const sidebar = document.getElementById("sidebar")
const sidebarOverlay = document.getElementById("sidebarOverlay")
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const sidebarToggle = document.getElementById("sidebarToggle")
const sidebarLinks = document.querySelectorAll(".sidebar-menu a")

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initializeSidebar()
  highlightActiveSection()
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
function copyCode() {
  const codeBlock = document.getElementById("codeBlock")
  const text = codeBlock.textContent

  navigator.clipboard
    .then(() => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast("Código copiado para a área de transferência!")
        })
        .catch(() => {
          fallbackCopyTextToClipboard(text)
        })
    })
    .catch(() => {
      fallbackCopyTextToClipboard(text)
    })
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
    showToast("Código copiado para a área de transferência!")
  } catch (err) {
    showToast("Erro ao copiar código")
  }

  document.body.removeChild(textArea)
}

// Sistema de toast/notificação
function showToast(message) {
  // Remove toast existente se houver
  const existingToast = document.querySelector(".toast")
  if (existingToast) {
    existingToast.remove()
  }

  // Criar novo toast
  const toast = document.createElement("div")
  toast.className = "toast"
  toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `

  // Estilos do toast
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        box-shadow: var(--shadow);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        font-size: 0.9rem;
        font-weight: 500;
    `

  document.body.appendChild(toast)

  // Remover toast após 3 segundos
  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease-out"
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

// Adicionar animações CSS para o toast
const toastStyles = document.createElement("style")
toastStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`
document.head.appendChild(toastStyles)

// Fechar sidebar ao redimensionar para desktop
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) {
    closeSidebar()
  }
})

// Navegação por teclado
document.addEventListener("keydown", (e) => {
  // ESC para fechar sidebar
  if (e.key === "Escape") {
    closeSidebar()
  }
})

// Lazy loading para melhor performance
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

// Inicializar lazy loading quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", initializeLazyLoading)

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