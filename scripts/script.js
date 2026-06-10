import { data } from "https://shoneal.github.io/rollingstone/scripts/data.js";

//
//
//
const section = "video-games"; // О чем сайт
const author = "Jerome Malone"; // Автор
const basicLink = `https://shoneal.github.io/rollingstone-best-${section}/images/`; // Главная ссылка
const authorWebsites = {
  "The Best Albums of the 21st Century So Far":
    "https://shoneal.github.io/rollingstone-best-albums/",
  'Screenshots database "Gargantua"': "https://shoneal.github.io/gargantua/",
  "The Best Movies of the 21st Century":
    "https://shoneal.github.io/best-movies/",
}; // Сайты с ссылками автора

//
const bodyElements = {
  header: document.querySelector("body > header"),
  navigation: document.querySelector(".nav-list"),
  titleCount: document.querySelector(".article-title .count"),
  authorSections: document.querySelectorAll(".author-name"),
  authorWebsitesList: document.querySelector(".author .nav-list"),
  headerImages: document.querySelector(".featured-media .figure"),
  headerImagesCaption: document.querySelector(".featured-media .figcaption"),
  gallery: document.querySelector(".gallery"),
  slideTemplate: document.getElementById("slide-template"),
}; // Элементы тела страницы
const kebabToCamel = (str) => {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}; // kebab-case в camelCase
const currentData = data[kebabToCamel(section)]; // Данные по имени секции
const dataLength = Object.keys(currentData).length; // Длина объекта
const textToSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/[.,:;]/g, " ")
    .replace(/iv/g, "4")
    .replace(/v/g, "5")
    .replace(/ii/g, "2")
    .trim()
    .replace(/\s+/g, "-");
}; // Трансформация текста
const showImage = (img) => {
  const onLoadOrError = () => {
    img.style.opacity = "1";
    img.removeEventListener("load", onLoadOrError);
    img.removeEventListener("error", onLoadOrError);
  };

  if (img.complete) {
    onLoadOrError();
  } else {
    img.addEventListener("load", onLoadOrError, { once: true });
    img.addEventListener("error", onLoadOrError, { once: true });
  }
}; // Функция для настройки загрузки изображения
const getImagePath = (folder, title) => {
  return `${basicLink}${folder}/${textToSlug(title)}.jpg`;
}; // Путь к изображению

//
//
//
const switchingStickinessHeader = () => {
  const { bottom } = bodyElements.headerImages.getBoundingClientRect();
  bodyElements.header.classList.toggle("sticky", bottom < 0);
}; // Липкий выезжающий header
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
      src: getImagePath("header/desktop", key),
      srcset: `${getImagePath("header/mobile", key)} 300w, ${getImagePath(
        "header/desktop",
        key,
      )} 2400w`,
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
    img.src = getImagePath("shots/872", key);
    img.srcset = `${getImagePath("shots/320", key)} 320w, ${getImagePath(
      "shots/640",
      key,
    )} 640w, ${getImagePath("shots/872", key)} 872w`;
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

//
//
//
function createNavigation() {
  const blocks = Array.from({ length: Math.ceil(dataLength / 5) }, (_, i) => {
    const start = i * 5 + 1;
    return { start, end: Math.min(start + 4, dataLength) };
  });

  if (blocks.length > 1 && blocks.at(-1).end - blocks.at(-1).start < 3) {
    const last = blocks.pop();
    blocks[blocks.length - 1].end = last.end;
  }

  const fragment = document.createDocumentFragment();
  blocks.reverse().forEach(({ start, end }) => {
    const link = Object.assign(document.createElement("a"), {
      href: `#${end}`,
      textContent: `${end}-${start}`,
    });
    link.dataset.start = start;
    link.dataset.end = end;
    fragment.appendChild(link);
  });
  bodyElements.navigation.appendChild(fragment);
} // Создание навигации
function updateActiveLink() {
  const links = bodyElements.navigation.querySelectorAll("a");
  const slides = document.querySelectorAll(".slide");

  const viewportTop = window.scrollY + window.innerHeight * 0.3;
  const viewportBottom = viewportTop + window.innerHeight * 0.4;

  let currentSlideId = null;

  for (let i = slides.length - 1; i >= 0; i--) {
    const slide = slides[i];
    const id = parseInt(slide.dataset.slideId, 10);
    const rect = slide.getBoundingClientRect();

    const top = rect.top + window.scrollY;
    const bottom = rect.bottom + window.scrollY;

    if (bottom > viewportTop && top < viewportBottom) {
      currentSlideId = id;
      break;
    }
  }

  if (currentSlideId) {
    links.forEach((link) => {
      const start = parseInt(link.dataset.start, 10);
      const end = parseInt(link.dataset.end, 10);
      link.classList.toggle(
        "active",
        currentSlideId >= start && currentSlideId <= end,
      );
    });
  }
} // Обновление навигации
bodyElements.navigation.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;

  e.preventDefault();

  const targetId = link.dataset.end;
  const targetSlide = document.querySelector(
    `.slide[data-slide-id="${targetId}"]`,
  );

  if (targetSlide) targetSlide.scrollIntoView();
}); // Обработчик кликов по навигации

//
//
//
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark")
    document.body.classList.add("dark-theme"); // Смена темы

  bodyElements.titleCount.textContent = dataLength; // Обновление числа в заголовке
  bodyElements.authorSections.forEach((e) => (e.textContent = author)); // Имя автора везде в HTML

  Object.entries(authorWebsites).forEach(([name, url]) => {
    const link = Object.assign(document.createElement("a"), {
      textContent: name,
      href: url,
      target: "_blank",
    });

    const item = document.createElement("li");
    item.appendChild(link);

    bodyElements.authorWebsitesList.appendChild(item);
  }); // Добавление ссылок в навигацию автора

  switchingStickinessHeader(); // Липкий выезжающий header
  initializeHeaderImages(
    currentData,
    bodyElements.headerImages,
    bodyElements.headerImagesCaption,
  ); // Создание картинки в шапке
  createNavigation(); // Создание навигации
  updateActiveLink(); // Обновление навигации
  renderSlides(currentData); // Вывод элементов в структуру HTML
});
let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      switchingStickinessHeader(); // Липкий выезжающий header
      updateActiveLink(); // Обновление навигации

      ticking = false;
    });
    ticking = true;
  }
}); // Обработчик скролла
const debounce = (func, delay) => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(func, delay);
  };
}; // Дебаунс для ресайза
window.addEventListener(
  "resize",
  debounce(() => {
    updateActiveLink(); // Обновление навигации
  }, 100),
);
