const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const searchForm = document.querySelector(".site-search");
const searchInput = document.querySelector("#site-search-input");
const searchStatus = document.querySelector(".search-status");
const serviceForm = document.querySelector("#service-request");
const serviceFormStatus = document.querySelector("#service-form-status");
const serviceConfirmation = document.querySelector("#service-confirmation");
const serviceConfirmationContinue = document.querySelector("#service-confirmation-continue");
const serviceConfirmationClose = document.querySelector("#service-confirmation-close");
let pendingServiceMailto = "";

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
  const matchingSection = [...document.querySelectorAll(".feature-copy, .about-contact-card, .team-card, .brand-card, .offer-brand-profile, .service-details, .advice-article, .faq-item")].find((section) => {
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
  const fieldsToValidate = [...serviceForm.querySelectorAll("input, select, textarea")];
  const invalidFields = [];

  fieldsToValidate.forEach((field) => {
    let error = "";
    if (field.required && !field.value.trim()) {
      error = "Toto pole je povinné.";
    } else if (field.type === "email" && field.value && field.validity.typeMismatch) {
      error = "Zadajte platnú e-mailovú adresu, napr. meno@email.sk.";
    } else if (field.id === "customer-phone" && field.value && !/^\d{9,15}$/.test(field.value)) {
      error = "Telefón zadajte ako 9 až 15 číslic bez medzier.";
    }

    let errorElement = field.parentElement.querySelector(".field-error");
    if (!errorElement) {
      errorElement = document.createElement("span");
      errorElement.className = "field-error";
      errorElement.id = `${field.id}-error`;
      field.parentElement.append(errorElement);
    }
    errorElement.textContent = error;
    field.setAttribute("aria-invalid", String(Boolean(error)));
    field.setAttribute("aria-describedby", errorElement.id);

    if (error) {
      invalidFields.push({ field, error });
    }
  });

  if (invalidFields.length) {
    serviceFormStatus.textContent = `Skontrolujte formulár: ${invalidFields.map(({ field, error }) => `${field.labels[0].textContent} – ${error}`).join(" ")}`;
    serviceFormStatus.classList.add("is-error");
    invalidFields[0].field.focus();
    return;
  }

  const fields = [...new FormData(serviceForm).entries()]
    .filter(([, value]) => String(value).trim())
    .map(([label, value]) => `${label}: ${value}`);
  const body = fields.join("\n");
  pendingServiceMailto = `mailto:motocentrumkm@gmail.com?subject=${encodeURIComponent("Žiadosť o servis motocykla")}&body=${encodeURIComponent(body)}`;

  serviceFormStatus.classList.remove("is-error");
  serviceFormStatus.textContent = "Skontrolujte dôležité upozornenie a pokračujte k e-mailu.";
  serviceConfirmation.showModal();
});

serviceConfirmationContinue?.addEventListener("click", () => {
  if (!pendingServiceMailto) {
    return;
  }

  serviceConfirmation.close();
  window.location.href = pendingServiceMailto;
  pendingServiceMailto = "";
});

serviceConfirmationClose?.addEventListener("click", () => {
  serviceConfirmation.close();
  pendingServiceMailto = "";
});

serviceConfirmation?.addEventListener("cancel", () => {
  pendingServiceMailto = "";
});

serviceForm?.querySelector("#customer-phone")?.addEventListener("input", (event) => {
  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
});

serviceForm?.querySelectorAll("#customer-name, #customer-surname").forEach((field) => {
  field.addEventListener("input", () => {
    field.value = field.value.replace(/[^\p{L}\s'-]/gu, "");
  });
});
