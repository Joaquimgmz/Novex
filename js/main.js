/* ============================================================
   NEXORA AI — Interações do site
   ============================================================ */
(function () {
  "use strict";

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
