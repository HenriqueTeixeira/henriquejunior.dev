// Interações do cabeçalho: alternar tema e abrir o menu em telas estreitas.

const raiz = document.documentElement;
const escuroDoSistema = window.matchMedia("(prefers-color-scheme: dark)");

function temaAtual() {
  return raiz.dataset.theme || (escuroDoSistema.matches ? "escuro" : "claro");
}

function iniciarTema() {
  const botao = document.querySelector(".tema");
  if (!botao) return;

  const atualizarRotulo = () => {
    const escuro = temaAtual() === "escuro";
    botao.setAttribute("aria-label", escuro ? botao.dataset.rotuloClaro : botao.dataset.rotuloEscuro);
  };

  botao.addEventListener("click", () => {
    const novo = temaAtual() === "escuro" ? "claro" : "escuro";
    raiz.dataset.theme = novo;
    try {
      localStorage.setItem("tema", novo);
    } catch {
      // Armazenamento bloqueado: a escolha vale só nesta página.
    }
    atualizarRotulo();
  });

  escuroDoSistema.addEventListener("change", atualizarRotulo);
  atualizarRotulo();
}

function iniciarMenu() {
  const botao = document.querySelector(".nav__alternar");
  const lista = document.getElementById("nav-lista");
  if (!botao || !lista) return;

  const definir = (aberto) => {
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? botao.dataset.rotuloFechar : botao.dataset.rotuloAbrir);
  };

  botao.addEventListener("click", () => definir(botao.getAttribute("aria-expanded") !== "true"));

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && botao.getAttribute("aria-expanded") === "true") {
      definir(false);
      botao.focus();
    }
  });
}

iniciarTema();
iniciarMenu();
