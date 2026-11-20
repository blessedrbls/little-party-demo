/*
 * Little Party Studio — усі дані сайту.
 * Ціни, набори, кольори, контакти редагуються тут
 * (або в Google Таблиці, якщо в script.js заповнено SHEET_URL — див. README).
 */
const SHOP = {
  name: "Little Party Studio",
  district: "Троєщина",
  city: "Київ",
  phones: ["+380934500805"],
  messengerPhone: "+380934500805", // Viber і Telegram
  instagram: "little_party_studio",
  pickupAddress: "вул. Градинська, 7",
  freeDeliveryFrom: 700, // грн, доставка по Троєщині
  hours: { from: "07:00", to: "22:00" }, // коли приймаємо замовлення

  // Таби в «Готових наборах»
  categories: [
    { id: "all", label: "Всі" },
    { id: "first", label: "На 1 рік" },
    { id: "boys", label: "Для хлопчиків" },
    { id: "newborn", label: "На виписку" },
    { id: "girls", label: "Для дівчат" },
    { id: "ceiling", label: "Під стелю" },
  ],

  // Приводи в конструкторі
  occasions: [
    { id: "first", label: "1 рік", emoji: "🎂" },
    { id: "newborn", label: "Виписка", emoji: "👶", shows: { item: "print", group: "newborn" } }, // при виборі розгортає малюнки «На виписку»
    { id: "birthday", label: "День народження", emoji: "🎉" },
    { id: "other", label: "Інше", emoji: "✨" },
  ],

  // Готові набори.
  // price — орієнтовна ціна, на сайті показуємо «від X грн». null — «ціна за запитом».
  // Як порахована кожна ціна — у prices-to-confirm.md.
  // occasion — який привід обрати в конструкторі по кнопці «Зібрати схожий».
  sets: [
    { id: "set-01", title: "Ведмедик і жирафа з цифрою 1", image: "images/set-01.jpg", categories: ["first"], occasion: "first", price: 1670 },
    { id: "set-02", title: "Блакитна одиничка із зайчиком", image: "images/set-02.jpg", categories: ["first"], occasion: "first", price: 1670 },
    { id: "set-03", title: "Фотозона «Сафарі» на 1 рік", image: "images/set-03.jpg", categories: ["first"], occasion: "first", price: null },
    { id: "set-04", title: "Хром і машинка-позашляховик з цифрою 1", image: "images/set-04.jpg", categories: ["first"], occasion: "first", price: 1350 },
    { id: "set-05", title: "Червона гоночна машинка з цифрою 4", image: "images/set-05.jpg", categories: ["boys"], occasion: "birthday", price: 1220 },
    { id: "set-06", title: "Чорно-білі кульки під стелю", image: "images/set-06.jpg", categories: ["ceiling"], occasion: "birthday", price: 1450 },
    { id: "set-07", title: "Футбольний набір з кубками", image: "images/set-07.jpg", categories: ["boys"], occasion: "birthday", price: 1455 },
    { id: "set-08", title: "Чорна цифра 9 з футбольним м'ячем", image: "images/set-08.jpg", categories: ["boys"], occasion: "birthday", price: 825 },
    { id: "set-09", title: "Футбольні м'ячі та зірка з написом", image: "images/set-09.jpg", categories: ["boys"], occasion: "birthday", price: 950 },
    { id: "set-10", title: "Три фонтани «Baby» з бантиком", image: "images/set-10.jpg", categories: ["newborn"], occasion: "newborn", price: 2800 },
    { id: "set-11", title: "Лелека з колясочкою на виписку", image: "images/set-11.jpg", categories: ["newborn"], occasion: "newborn", price: 2415 },
    { id: "set-12", title: "Пудрова стеля з великим бантом", image: "images/set-12.jpg", categories: ["newborn", "ceiling"], occasion: "newborn", price: 4130 },
    { id: "set-13", title: "Червоний бант між двома фонтанами", image: "images/set-13.jpg", categories: ["girls"], occasion: "birthday", price: 2970 },
    { id: "set-14", title: "Рожеве золото «18» з серцем", image: "images/set-14.jpg", categories: ["girls"], occasion: "birthday", price: 1990 },
    { id: "set-15", title: "Ніжно-рожеві «18» з конфетті", image: "images/set-15.jpg", categories: ["girls"], occasion: "birthday", price: 2560 },
    { id: "set-16", title: "Срібні «18» з пудровим бантом", image: "images/set-16.jpg", categories: ["girls"], occasion: "birthday", price: 3380 },
  ],

  setPriceLabel: "ціна за запитом",

  // ПРАЙС, грн за 1 шт.
  // from: true — показуємо «від», рахуємо за мінімальною ціною
  // palette — ключ у colors (клієнт обирає кольори кружечками)
  // inscription: true — є поле «Текст напису»
  latex: [
    { id: "plain", name: "Звичайні", price: 90, swatch: "plain", palette: "plain" },
    { id: "chrome", name: "Хром", price: 100, swatch: "chrome", palette: "chrome" },
    { id: "confetti", name: "З конфетті", price: 100, swatch: "confetti", palette: "confetti" },
    { id: "print", name: "З малюнком / написом", price: 95, swatch: "print", palette: "print", inscription: true },
    { id: "agate", name: "Агати", price: 110, swatch: "agate", palette: "agate" },
    { id: "brush", name: "Браш", price: 110, swatch: "brush", palette: "brush" },
  ],

  foil: [
    { id: "heart", name: "Серце / зірка без малюнка", price: 170, icon: "heart" },
    { id: "printed", name: "З малюнком", price: 190, priceTo: 230, from: true, icon: "printed" },
    { id: "figure", name: "Фігура", price: 300, from: true, icon: "figure" },
  ],

  // Бабли — завжди з індивідуальним написом
  bubbles: [
    { id: "feather", name: "Бабл з пір'ям / кульками / конфетті", size: "45–50 см", price: 900, icon: "bubble", inscription: true },
    { id: "mirror", name: "Дзеркальна куля", size: "55–60 см", price: 1400, icon: "mirror", inscription: true },
  ],

  numberSizes: [
    { id: "70", label: "70 см", price: 350 },
    { id: "100", label: "100 см", price: 450 },
  ],

  // Палітри кольорів і малюнків. Фото: colors/<folder>/sm/<id>.jpg (оригінали — colors/<folder>/<id>.jpg)
  // groups — підзаголовки всередині палітри; custom: true — плитка без фото («Свій напис», відкриває поле тексту)
  colors: {
    print: {
      folder: "malyunok",
      label: "Малюнки",
      pick: "Обрати малюнок",
      hint: "Натисніть на малюнок, щоб додати. Можна кілька.",
      groups: [
        { id: "newborn", label: "На виписку" },
        { id: "text", label: "З написом" },
        { id: "picture", label: "З малюнком" },
      ],
      items: [
        { id: "01", name: "Ми тебе дуже чекали", hex: "#f4f4f4", group: "newborn" },
        { id: "02", name: "Baby boy з ведмедиками", hex: "#cfe4f5", group: "newborn" },
        { id: "03", name: "Baby girl з ведмедиками", hex: "#f6d6df", group: "newborn" },
        { id: "04", name: "Хлопчик", hex: "#4f6fc8", group: "newborn" },
        { id: "05", name: "Дівчинка", hex: "#e86ab4", group: "newborn" },
        { id: "06", name: "Дякую за донечку / синочка", hex: "#c9ddf3", group: "newborn" },
        { id: "custom", name: "Свій напис", hex: "#fbf3ec", group: "text", custom: true },
        { id: "07", name: "З Днем народження, класичний", hex: "#f4f4f4", group: "text" },
        { id: "08", name: "З Днем народження з бантом, рожевий", hex: "#f6d9e3", group: "text" },
        { id: "09", name: "З Днем народження з бантом, кремовий", hex: "#f6ece3", group: "text" },
        { id: "10", name: "З Днем народження, золоті зірки", hex: "#f4f4f4", group: "text" },
        { id: "11", name: "З Днем народження з поцілунком", hex: "#f4f4f4", group: "text" },
        { id: "12", name: "З Днем народження, пастельний мікс", hex: "#e3d6f2", group: "text" },
        { id: "13", name: "З Днем народження, чорний із золотом", hex: "#1c1c1c", group: "text" },
        { id: "14", name: "З Днем народження, Красуня!", hex: "#f6d3df", group: "text" },
        { id: "15", name: "З днем народження, Королево!", hex: "#f6d3df", group: "text" },
        { id: "16", name: "Happy birthday, білий і чорний", hex: "#f4f4f4", group: "text" },
        { id: "17", name: "Happy Birthday to you, чорний", hex: "#1c1c1c", group: "text" },
        { id: "18", name: "Happy Birthday to you, білий", hex: "#f4f4f4", group: "text" },
        { id: "19", name: "Майнкрафт, Стів", hex: "#e9eef0", group: "picture" },
        { id: "20", name: "Майнкрафт, логотип", hex: "#2fb43a", group: "picture" },
        { id: "21", name: "Майнкрафт, Кріпер", hex: "#2fb43a", group: "picture" },
        { id: "22", name: "Майнкрафт, TNT з динамітом", hex: "#d42a2a", group: "picture" },
        { id: "23", name: "Майнкрафт, TNT", hex: "#d42a2a", group: "picture" },
        { id: "24", name: "Роблокс", hex: "#d42a2a", group: "picture" },
        { id: "25", name: "Щенячий патруль, червоний", hex: "#d42a2a", group: "picture" },
        { id: "26", name: "Щенячий патруль, жовтий", hex: "#f2c531", group: "picture" },
        { id: "27", name: "Щенячий патруль, синій", hex: "#3b6fc0", group: "picture" },
        { id: "28", name: "Щенячий патруль, рожевий", hex: "#e061ad", group: "picture" },
        { id: "29", name: "Гаррі Поттер", hex: "#2f8a4a", group: "picture" },
        { id: "30", name: "Стіч", hex: "#4a6fd0", group: "picture" },
      ],
    },
    plain: {
      folder: "zvychaini",
      items: [
        { id: "01", name: "Лавандовий", hex: "#a98bd0" },
        { id: "02", name: "Фуксія", hex: "#e8379b" },
        { id: "03", name: "Шавлія", hex: "#8fb08a" },
        { id: "04", name: "Бірюзовий", hex: "#1fa9cc" },
        { id: "05", name: "Сірий", hex: "#9a9d9f" },
        { id: "06", name: "Блакитний", hex: "#1e96dc" },
        { id: "07", name: "Рожевий", hex: "#e58ad8" },
        { id: "08", name: "Гірчичний", hex: "#e6b93c" },
        { id: "09", name: "Білий", hex: "#f6f7f7" },
        { id: "10", name: "Ніжно-рожевий", hex: "#f2c9d6" },
        { id: "11", name: "Кораловий", hex: "#f0634e" },
        { id: "12", name: "Слонова кістка", hex: "#ece6d6" },
        { id: "13", name: "Темно-зелений", hex: "#1f5e4a" },
        { id: "14", name: "Темно-синій", hex: "#2e3f73" },
        { id: "15", name: "Чорний", hex: "#1c1c1c" },
        { id: "16", name: "Синій", hex: "#2643c8" },
        { id: "17", name: "Світло-блакитний", hex: "#7cc6ea" },
        { id: "18", name: "Яскраво-синій", hex: "#1f6fd6" },
        { id: "19", name: "Фіолетовий", hex: "#6a3dc0" },
        { id: "20", name: "М'ятний", hex: "#86dcd6" },
        { id: "21", name: "Пастельно-зелений", hex: "#acd8b2" },
        { id: "22", name: "Пастельний бузковий", hex: "#c9c8ec" },
        { id: "23", name: "Персиковий", hex: "#f2d9b3" },
        { id: "24", name: "Небесно-блакитний", hex: "#2a8fe0" },
        { id: "25", name: "Салатовий", hex: "#5cd141" },
        { id: "26", name: "Ванільний", hex: "#e6eadc" },
        { id: "27", name: "Мокко", hex: "#9c6e5c" },
        { id: "28", name: "Зелений", hex: "#2f9a3a" },
        { id: "29", name: "Смарагдовий", hex: "#1fae5a" },
        { id: "30", name: "Пісочний", hex: "#cfccc0" },
        { id: "31", name: "Пастельно-жовтий", hex: "#e8eca8" },
        { id: "32", name: "Помаранчевий", hex: "#f39a1f" },
        { id: "33", name: "Пастельно-блакитний", hex: "#b4d4e2" },
        { id: "34", name: "Пудрово-рожевий", hex: "#f4dde4" },
        { id: "35", name: "Лаймовий", hex: "#b9e02a" },
        { id: "36", name: "Ніжно-блакитний", hex: "#9fdcf0" },
        { id: "37", name: "Морська хвиля", hex: "#14c2b0" },
        { id: "38", name: "Жовтий", hex: "#e3e02e" },
        { id: "39", name: "Червоний", hex: "#e3202f" },
        { id: "40", name: "Бузковий", hex: "#9b7ef0" },
      ],
    },
    chrome: {
      folder: "hrom",
      items: [
        { id: "01", name: "Рожеве золото", hex: "#b07a68" },
        { id: "02", name: "Золото", hex: "#b8913f" },
        { id: "03", name: "Смарагд", hex: "#3d8a73" },
        { id: "04", name: "Срібло", hex: "#a9afb2" },
        { id: "05", name: "Оливка", hex: "#7fa04c" },
        { id: "06", name: "Синій", hex: "#3f86b0" },
        { id: "07", name: "Графіт", hex: "#5e5e58" },
        { id: "08", name: "Рожевий", hex: "#b4727c" },
        { id: "09", name: "Старе золото", hex: "#a57a22" },
        { id: "10", name: "Бордовий", hex: "#a8322c" },
        { id: "11", name: "Фіолетовий", hex: "#6c4f9e" },
        { id: "12", name: "Шампань", hex: "#b9ac6f" },
        { id: "13", name: "Шоколад", hex: "#6e4c35" },
      ],
    },
    confetti: {
      folder: "konfeti",
      items: [
        { id: "01", name: "Фуксія, кружечки", hex: "#c0329a" },
        { id: "02", name: "Блакитні кружечки", hex: "#5fb0dc" },
        { id: "03", name: "Бордові сердечка", hex: "#a8244f" },
        { id: "04", name: "Зелені квадратики", hex: "#1f7a45" },
        { id: "05", name: "Срібні кружечки", hex: "#b9bcc0" },
        { id: "06", name: "Золоті квадратики", hex: "#d6a92c" },
        { id: "07", name: "Золоті кружечки", hex: "#d4b52e" },
        { id: "08", name: "Срібні квадратики", hex: "#c4c6c8" },
        { id: "09", name: "Рожеве золото, кружечки", hex: "#c9897a" },
        { id: "10", name: "Рожеве золото, квадратики", hex: "#d08a7c" },
        { id: "11", name: "Чорні кружечки", hex: "#1f1f1f" },
        { id: "12", name: "Сині кружечки", hex: "#1f62b8" },
        { id: "13", name: "Білі кружечки", hex: "#ffffff" },
        { id: "14", name: "Бірюзові кружечки", hex: "#1aa6c0" },
        { id: "15", name: "Червоні кружечки", hex: "#d0263f" },
        { id: "16", name: "Рожеві кружечки", hex: "#f29ab8" },
        { id: "17", name: "Фіолетові кружечки", hex: "#7a2cc4" },
      ],
    },
    agate: {
      folder: "agaty",
      items: [
        { id: "01", name: "Ніжний мікс (бузок, рожевий, блакитний)", hex: "#d9b8e2" },
        { id: "02", name: "Синій", hex: "#1fa6c1" },
        { id: "03", name: "Зелений", hex: "#3fb14c" },
        { id: "04", name: "Рожево-білий", hex: "#e8608f" },
        { id: "05", name: "Рожево-фіолетовий", hex: "#c967a5" },
        { id: "06", name: "Жовто-помаранчевий", hex: "#fbb52e" },
        { id: "07", name: "Червоно-помаранчевий", hex: "#ed5a32" },
      ],
    },
    brush: {
      folder: "brash",
      items: [
        { id: "01", name: "Мікс (бірюза, рожевий, бузок)", hex: "#c9a8e0" },
        { id: "02", name: "Ніжно-рожевий", hex: "#f3bcc6" },
        { id: "03", name: "Бузковий", hex: "#c3b4ef" },
        { id: "04", name: "Бірюзовий", hex: "#2cb6cf" },
        { id: "05", name: "Блакитний", hex: "#5cc1ea" },
        { id: "06", name: "Рожевий", hex: "#f08fae" },
        { id: "07", name: "Білий", hex: "#ffffff" },
      ],
    },
  },
};
