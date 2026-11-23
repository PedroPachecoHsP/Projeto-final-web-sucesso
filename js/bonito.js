
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  iniciarTema();
  iniciarBusca();
  iniciarCalculadora();
  iniciarVoltarAoTopo();
  iniciarMenuMobile();

  document.getElementById("ano").textContent = new Date().getFullYear();
});

function comportamentoRolagem() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

function iniciarTema() {
  const CHAVE = "na-passada-tema";
  const html = document.documentElement;
  const botao = document.getElementById("alternarTema");
  const icone = botao.querySelector("i");

  let salvo = null;
  try {
    salvo = localStorage.getItem(CHAVE);
  } catch (erro) {

  }

  const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
  aplicarTema(salvo || (prefereEscuro ? "dark" : "light"));

  botao.addEventListener("click", () => {
    const novo = html.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    aplicarTema(novo);
    try {
      localStorage.setItem(CHAVE, novo);
    } catch (erro) {
      
    }
  });

  function aplicarTema(tema) {
    const escuro = tema === "dark";
    html.setAttribute("data-bs-theme", tema);
    icone.className = escuro ? "fa-solid fa-sun" : "fa-solid fa-moon";
    botao.setAttribute("aria-pressed", String(escuro));
    botao.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
  }
}

function normalizar(texto) {
  
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function iniciarBusca() {
  const form = document.getElementById("formBusca");
  const campo = document.getElementById("busca");
  const itens = document.querySelectorAll("[data-busca]");
  const aviso = document.getElementById("semResultado");

  function filtrar() {
    const termo = normalizar(campo.value.trim());
    let visiveis = 0;

    itens.forEach((item) => {
      const aparece = termo === "" || normalizar(item.textContent).includes(termo);
      item.classList.toggle("d-none", !aparece);
      if (aparece) visiveis++;
    });

    aviso.classList.toggle("d-none", visiveis > 0);
  }

  campo.addEventListener("input", filtrar);

  form.addEventListener("submit", (evento) => {
    evento.preventDefault(); 
    filtrar();
    document
      .getElementById("treinos")
      .scrollIntoView({ behavior: comportamentoRolagem() });
  });
}

const DISTANCIAS_TABELA = [
  { rotulo: "5 km", km: 5 },
  { rotulo: "10 km", km: 10 },
  { rotulo: "Meia maratona (21,1 km)", km: 21.0975 },
  { rotulo: "Maratona (42,2 km)", km: 42.195 },
];
const VAZIO = "–:––";

function formatarTempo(totalSegundos) {
  const arredondado = Math.round(totalSegundos);
  const horas = Math.floor(arredondado / 3600);
  const minutos = Math.floor((arredondado % 3600) / 60);
  const segundos = arredondado % 60;
  const ss = String(segundos).padStart(2, "0");

  if (horas > 0) {
    return `${horas}:${String(minutos).padStart(2, "0")}:${ss}`;
  }
  return `${minutos}:${ss}`;
}

function iniciarCalculadora() {
  const form = document.getElementById("formRitmo");
  const selDistancia = document.getElementById("distancia");
  const campoHoras = document.getElementById("horas");
  const campoMin = document.getElementById("minutos");
  const campoSeg = document.getElementById("segundos");
  const erro = document.getElementById("erroRitmo");
  const saidaPace = document.getElementById("paceKm");
  const saidaVelocidade = document.getElementById("velocidade");
  const tabela = document.getElementById("tabelaEstimativas");

  mostrarResultado(null); 

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    limparErro();

    const distanciaKm = Number(selDistancia.value);
    const horas = Number(campoHoras.value || 0);
    const minutos = Number(campoMin.value || 0);
    const segundos = Number(campoSeg.value || 0);

    // Validação
    const valores = [horas, minutos, segundos];
    if (valores.some((v) => !Number.isFinite(v) || v < 0)) {
      return mostrarErro("Use apenas números positivos no tempo.", campoHoras);
    }
    if (minutos >= 60) {
      return mostrarErro("Os minutos devem ficar entre 0 e 59.", campoMin);
    }
    if (segundos >= 60) {
      return mostrarErro("Os segundos devem ficar entre 0 e 59.", campoSeg);
    }
    const total = horas * 3600 + minutos * 60 + segundos;
    if (total === 0) {
      return mostrarErro("Informe um tempo maior que zero.", campoMin);
    }

        const paceSegPorKm = total / distanciaKm;
    const velocidade = distanciaKm / (total / 3600);

    mostrarResultado({ paceSegPorKm, velocidade });
  });

  form.addEventListener("reset", () => {
    limparErro();
    mostrarResultado(null);
  });

  function mostrarResultado(dados) {
    if (dados === null) {
      saidaPace.textContent = VAZIO;
      saidaVelocidade.textContent = "–";
      tabela.innerHTML = DISTANCIAS_TABELA.map(
        (d) => `<tr><td>${d.rotulo}</td><td class="text-end">${VAZIO}</td></tr>`
      ).join("");
      return;
    }

    saidaPace.textContent = formatarTempo(dados.paceSegPorKm);
    saidaVelocidade.textContent = dados.velocidade.toFixed(1).replace(".", ",");
    tabela.innerHTML = DISTANCIAS_TABELA.map((d) => {
      const tempo = dados.paceSegPorKm * d.km;
      return `<tr><td>${d.rotulo}</td><td class="text-end">${formatarTempo(tempo)}</td></tr>`;
    }).join("");
  }

  function mostrarErro(mensagem, campo) {
    erro.textContent = mensagem;
    campo.classList.add("is-invalid");
    campo.focus();
  }

  function limparErro() {
    erro.textContent = "";
    [campoHoras, campoMin, campoSeg].forEach((c) => c.classList.remove("is-invalid"));
  }
}

function iniciarVoltarAoTopo() {
  const botao = document.getElementById("voltarTopo");

  window.addEventListener(
    "scroll",
    () => botao.classList.toggle("visivel", window.scrollY > 400),
    { passive: true }
  );

  botao.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: comportamentoRolagem() });
  });
}

function iniciarMenuMobile() {
  const menu = document.getElementById("navbarSupportedContent");

  document.querySelectorAll("#navbarSupportedContent .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (menu.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });
}