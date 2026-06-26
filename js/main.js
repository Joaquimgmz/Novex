/* ============================================================
   NOVEX AI — Interações do site
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Cubo 3D: gira seguindo o cursor + desmonta só os cubinhos próximos ---------- */
  (function cube3D() {
    const cube = document.getElementById("cube");
    const scene = document.querySelector(".hero-visual");
    if (!cube || !scene) return;

    // 1) Monta o cubo: n×n×n cubinhos
    const n = 4; // 4×4×4 = 64 cubinhos
    const cell = 34;
    const gap = 37;
    const half = cell / 2;
    const mid = (n - 1) / 2;
    const faces = [
      ["fz", "translateZ(" + half + "px)"],
      ["fzb", "rotateY(180deg) translateZ(" + half + "px)"],
      ["fx", "rotateY(90deg) translateZ(" + half + "px)"],
      ["fxb", "rotateY(-90deg) translateZ(" + half + "px)"],
      ["fy", "rotateX(90deg) translateZ(" + half + "px)"],
      ["fyb", "rotateX(-90deg) translateZ(" + half + "px)"],
    ];
    const cubelets = [];

    function place(c, x, y, z) {
      c.el.style.transform = "translate3d(" + x + "px," + y + "px," + z + "px)";
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          const el = document.createElement("div");
          el.className = "cubelet";
          const gx = i - mid, gy = j - mid, gz = k - mid;
          const data = { el: el, gx: gx, gy: gy, gz: gz, bx: gx * gap, by: gy * gap, bz: gz * gap };
          el.__data = data;
          faces.forEach(function (f) {
            const fe = document.createElement("span");
            fe.className = "face " + f[0];
            fe.style.transform = f[1];
            el.appendChild(fe);
          });
          cube.appendChild(el);
          cubelets.push(data);
          place(data, data.bx, data.by, data.bz);
        }
      }
    }

    // 2) Desmonta só os cubinhos próximos do que está exatamente sob o cursor
    const radius = 1.9;  // alcance, em "unidades de cubinho"
    const strength = 46; // px de empurrão
    function repel(focus) {
      for (let a = 0; a < cubelets.length; a++) {
        const c = cubelets[a];
        if (!focus) { place(c, c.bx, c.by, c.bz); continue; }
        const dx = c.gx - focus.gx, dy = c.gy - focus.gy, dz = c.gz - focus.gz;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > radius) { place(c, c.bx, c.by, c.bz); continue; }
        if (d === 0) { // o próprio cubinho dá um "pop" pra fora
          const cl = Math.sqrt(c.gx * c.gx + c.gy * c.gy + c.gz * c.gz) || 1;
          place(c, c.bx + (c.gx / cl) * strength * 0.6, c.by + (c.gy / cl) * strength * 0.6, c.bz + (c.gz / cl) * strength * 0.6);
          continue;
        }
        const f = (1 - d / radius) * 1.7; // quanto mais perto, mais empurra
        place(c, c.bx + (dx / d) * strength * f, c.by + (dy / d) * strength * f, c.bz + (dz / d) * strength * f);
      }
    }

    // 3) Giro: ocioso gira devagar; ao passar o cursor, gira na direção dele
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let curX = -24, curY = 0; // ângulos atuais (suavizados)
    let tgtX = -24, tgtY = 0; // ângulos alvo
    let autoY = 0;            // rotação automática quando ocioso
    let hovering = false;

    scene.addEventListener("pointerenter", function () { hovering = true; });
    scene.addEventListener("pointerleave", function () { hovering = false; autoY = curY; repel(null); });
    scene.addEventListener("pointermove", function (e) {
      const r = cube.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.28);
      const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.28);
      tgtY = Math.max(-70, Math.min(70, dx * 75));        // gira p/ os lados, seguindo o cursor
      tgtX = Math.max(-72, Math.min(22, -dy * 75 - 24));  // inclina p/ cima e p/ baixo

      // se o cursor está exatamente sobre um cubinho, desmonta só os próximos
      const t = e.target;
      const focus = t && t.classList && t.classList.contains("face") && t.parentNode.__data ? t.parentNode.__data : null;
      repel(focus);
    });

    (function frame() {
      if (!hovering) {
        if (!reduce) autoY += 0.22; // giro lento quando ocioso
        tgtY = autoY;
        tgtX = -24;
      }
      curX += (tgtX - curX) * 0.09;
      curY += (tgtY - curY) * 0.09;
      cube.style.transform = "rotateX(" + curX + "deg) rotateY(" + curY + "deg)";
      requestAnimationFrame(frame);
    })();
  })();

  /* ---------- Navbar: estado ao rolar ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 30);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = document.querySelector(".burger");
  const links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        burger.classList.remove("open");
        links.classList.remove("open");
      })
    );
  }

  /* ---------- Cursor glow (apenas em telas grandes) ---------- */
  const glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    });
  } else if (glow) {
    glow.style.display = "none";
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Contadores animados ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- FAQ acordeão ---------- */
  document.querySelectorAll(".faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const answer = item.querySelector(".faq-a");
      const isOpen = item.classList.toggle("open");
      answer.style.maxHeight = isOpen ? answer.scrollHeight + "px" : null;
    });
  });

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Formulário de contato ---------- */
  const form = document.querySelector("#contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    const btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status";
      const action = form.getAttribute("action") || "";

      // Se o Formspree ainda não foi configurado, usa o fallback de e-mail (mailto)
      if (action.includes("SEU_ID_FORMSPREE") || action.trim() === "") {
        const email = form.email.value;
        const message = form.message.value;
        const name = form.name ? form.name.value : "";
        const subject = encodeURIComponent("New contact from the website — " + (name || email));
        const body = encodeURIComponent(
          "Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message
        );
        window.location.href =
          "mailto:joaquimguerramartins6@gmail.com?subject=" + subject + "&body=" + body;
        status.classList.add("ok");
        status.textContent =
          "Opening your email app to send the message. If you prefer, reach us on WhatsApp.";
        return;
      }

      // Envio via Formspree (sem recarregar a página)
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending...";
      try {
        const res = await fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          form.reset();
          status.classList.add("ok");
          status.textContent =
            "✅ Message sent successfully! We'll be in touch soon.";
        } else {
          throw new Error("failed");
        }
      } catch (err) {
        status.classList.add("err");
        status.textContent =
          "❌ Couldn't send right now. Please try again or reach us on WhatsApp.";
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }
})();
