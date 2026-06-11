import { data } from "https://shoneal.github.io/rollingstone/scripts/data.js";
import { allLinks } from "https://shoneal.github.io/rollingstone/scripts/links.js";
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
  renderAuthorLinks,
  createNavigation,
  updateActiveLink,
  handleNavigationClick,
  initApp,
} from "https://shoneal.github.io/rollingstone/scripts/utils-for-lists.js";

const section = "video-games"; // О чем сайт
const bodyElements = initBodyElements(); // Элементы тела страницы
const { basicLink, currentData, dataLength } = getSectionContext(
  section,
  data,
  kebabToCamel,
); // Главная ссылка, данные по имени секции и длина объекта
const initializeHeaderImages = (data, container, caption) => {
  const elements = Object.keys(data);

  const randomElements = [];
  while (randomElements.length < 3) {
    const key = elements[Math.floor(Math.random() * elements.length)];
    if (!randomElements.includes(key)) randomElements.push(key);
  }

  let loaded = 0;
  const complete = () => ++loaded === 3 && (container.style.opacity = "1");
  const fragment = document.createDocumentFragment();

  [...randomElements].forEach((key) => {
    const img = Object.assign(document.createElement("img"), {
      src: getImagePath(basicLink, "header/desktop", key),
      srcset: `${getImagePath(
        basicLink,
        "header/mobile",
        key,
      )} 300w, ${getImagePath(basicLink, "header/desktop", key)} 2400w`,
      sizes: "100vw",
      alt: key,
      onload: complete,
    });

    const wrapper = document.createElement("div");
    wrapper.appendChild(img);
    fragment.appendChild(wrapper);
  });

  container.appendChild(fragment);

  caption.textContent = `${[...randomElements].join(", ")}`;
}; // Создание картинки в шапке
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

    img.style.opacity = "0";
    img.src = getImagePath(basicLink, "shots/872", key);
    img.srcset = `${getImagePath(
      basicLink,
      "shots/320",
      key,
    )} 320w, ${getImagePath(basicLink, "shots/640", key)} 640w, ${getImagePath(
      basicLink,
      "shots/800",
      key,
    )} 800w, ${getImagePath(
      basicLink,
      "shots/1024",
      key,
    )} 1024w, ${getImagePath(basicLink, "shots/1280", key)} 1280w`;
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
  changingTheme(); // Смена темы
  switchingStickinessHeader(bodyElements.title, bodyElements.header); // Липкий выезжающий header

  initializeHeaderImages(
    currentData,
    bodyElements.headerImages,
    bodyElements.headerImagesCaption,
  ); // Создание картинки в шапке

  renderSlides(currentData); // Вывод элементов в структуру HTML

  initApp(
    bodyElements,
    dataLength,
    renderAuthorLinks,
    allLinks,
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
