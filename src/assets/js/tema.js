// Carregado no <head>, antes da pintura: aplica o tema salvo e marca que há JS.
// Sem escolha salva, nada é definido e o CSS segue o tema do sistema.
(function () {
  var raiz = document.documentElement;
  raiz.classList.add("js");
  try {
    var salvo = localStorage.getItem("tema");
    if (salvo === "claro" || salvo === "escuro") raiz.dataset.theme = salvo;
  } catch (e) {
    // Armazenamento bloqueado: segue o sistema.
  }
})();
