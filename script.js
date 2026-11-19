const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const searchForm = document.querySelector(".site-search");
const searchInput = document.querySelector("#site-search-input");
const searchStatus = document.querySelector(".search-status");
const serviceForm = document.querySelector("#service-request");
const serviceFormStatus = document.querySelector("#service-form-status");

function closeNavigation() {
  menuToggle.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeNavigation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
  }
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();

  if (!query) {
    searchStatus.textContent = "Zadajte výraz, ktorý chcete vyhľadať.";
    searchInput.focus();
    return;
  }

  const normalizedQuery = query
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("sk");
  const matchingSection = [...document.querySelectorAll(".feature-copy, .about-contact-card, .team-card, .brand-card, .service-details, .advice-article, .faq-item")].find((section) => {
    const sectionText = section.textContent
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase("sk");
    return sectionText.includes(normalizedQuery);
  });

  if (!matchingSection) {
    searchStatus.textContent = `Pre výraz „${query}“ sme nič nenašli.`;
    return;
  }

  const sectionName = matchingSection.querySelector(".section-label, h1, h2, h3, summary").textContent;
  searchStatus.textContent = `Zobrazená sekcia: ${sectionName}.`;
  matchingSection.scrollIntoView({ behavior: "smooth", block: "center" });
});

serviceForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = [...new FormData(serviceForm).entries()]
    .filter(([, value]) => String(value).trim())
    .map(([label, value]) => `${label}: ${value}`);
  const body = fields.join("\n");
  const mailto = `mailto:servis@motocentrumkm.sk?subject=${encodeURIComponent("Žiadosť o servis motocykla")}&body=${encodeURIComponent(body)}`;

  serviceFormStatus.textContent = "V e-mailovom programe skontrolujte a odošlite pripravenú žiadosť.";
  window.location.href = mailto;
});
