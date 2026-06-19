import { data } from "https://shoneal.github.io/rollingstone/scripts/data.js";
import {
  listsLinks,
  coversLinks,
} from "https://shoneal.github.io/rollingstone/scripts/links.js";
import {
  changingTheme,
  switchingStickinessHeader,
  textToSlug,
  kebabToCamel,
  showImage,
  getImagePath,
  debounce,
} from "https://shoneal.github.io/rollingstone/scripts/utils.js";
import {
  initBodyElements,
  getSectionContext,
  createResponsiveImage,
  initializeHeaderImages,
  renderLastArticlesAndDate,
  createNavigation,
  updateActiveLink,
  handleNavigationClick,
  initApp,
} from "https://shoneal.github.io/rollingstone/scripts/utils-for-lists.js";

const section = "video-games"; // О чем сайт
const bodyElements = initBodyElements(); // Элементы тела страницы
const { basicLink, currentData, dataLength } = getSectionContext(
  bodyElements.url,
  section,
  data,
  kebabToCamel,
); // Главная ссылка, данные по имени секции и длина объекта
const renderSlides = (object) => {
  const variants = Object.keys(object)
    .flatMap((t) => {
      const base = t.replace(/\s+(\d+|[IVXLCDM]+)$/i, "").trim();
      return base === t ? [{ match: t }] : [{ match: t }, { match: base }];
    })
    .sort((a, b) => b.match.length - a.match.length);
  const regex = new RegExp(
    variants
      .map((v) => v.match.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"))
      .join("|"),
    "g",
  );

  const fragment = document.createDocumentFragment();
  const sorted = Object.entries(object).sort(
    ([, a], [, b]) => b.place - a.place,
  );

  for (const [key, data] of sorted) {
    const clone = bodyElements.slideTemplate.content.cloneNode(true);

    const [slide, place, title, platforms, img, description] = [
      clone.querySelector(".slide"),
      clone.querySelector(".slide-number"),
      clone.querySelector(".slide-title"),
      clone.querySelector(".slide-subtitle"),
      clone.querySelector(".slide-figure"),
      clone.querySelector(".slide-description"),
    ];

    slide.dataset.slideId = data.place;

    const { src, srcset } = createResponsiveImage(
      getImagePath,
      basicLink,
      key,
      "shots",
      872,
      [320, 640, 800, 1024, 1280],
    );

    img.style.opacity = "0";
    img.src = src;
    img.srcset = srcset;
    img.alt = key;
    showImage(img);

    place.textContent = data.place;
    title.textContent = `‘${key}’ (${data.year})`;
    platforms.textContent = data.platforms;

    const descFragment = document.createDocumentFragment();
    for (const text of data.description) {
      const paragraph = document.createElement("p");
      paragraph.className = "paragraph";
      paragraph.innerHTML = text.replace(regex, (m) => `<em>${m}</em>`);
      descFragment.appendChild(paragraph);
    }

    description.appendChild(descFragment);
    fragment.appendChild(clone);
  }

  bodyElements.gallery.appendChild(fragment);
}; // Вывод элементов в структуру HTML
bodyElements.navigation.addEventListener("click", handleNavigationClick); // Обработчик кликов по навигации
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add(section); // Название секции классом для body
  changingTheme(); // Смена темы
  switchingStickinessHeader(bodyElements.title, bodyElements.header); // Липкий выезжающий header

  initializeHeaderImages(
    getImagePath,
    basicLink,
    currentData,
    bodyElements.headerImages,
    bodyElements.headerImagesCaption,
    {
      getAuthor: (_, key) => key,
    },
  ); // Создание картинки в шапке

  renderSlides(currentData); // Вывод элементов в структуру HTML

  initApp(
    bodyElements,
    dataLength,
    renderLastArticlesAndDate,
    coversLinks,
    listsLinks,
    createNavigation,
    updateActiveLink,
  ); // Общая для всех инициализация
}); // Изначальная инициализация
let ticking = false; // Задержка для скролла
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      switchingStickinessHeader(bodyElements.title, bodyElements.header); // Липкий выезжающий header
      updateActiveLink(bodyElements.navigation); // Обновление навигации

      ticking = false;
    });
    ticking = true;
  }
}); // Обработчик скролла
window.addEventListener(
  "resize",
  debounce(() => {
    updateActiveLink(bodyElements.navigation); // Обновление навигации
  }, 100),
); // Обработчик ресайза
