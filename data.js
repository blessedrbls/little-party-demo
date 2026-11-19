/*
 * Little Party Studio — усі дані сайту.
 * Ціни, набори, контакти редагуються тільки тут.
 */
const SHOP = {
  name: "Little Party Studio",
  district: "Троєщина",
  city: "Київ",
  phones: ["+380677817920", "+380634866561"],
  messengerPhone: "+380677817920", // Viber і Telegram
  instagram: "little_party_studio",
  freeDeliveryFrom: 700, // грн

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
    { id: "newborn", label: "Виписка", emoji: "👶" },
    { id: "birthday", label: "День народження", emoji: "🎉" },
    { id: "other", label: "Інше", emoji: "✨" },
  ],

  // Готові набори. occasion — який привід обрати в конструкторі по кнопці «Зібрати схожий»
  sets: [
    { id: "set-01", title: "Ведмедик і жирафа з цифрою 1", image: "images/set-01.jpg", categories: ["first"], occasion: "first" },
    { id: "set-02", title: "Блакитна одиничка із зайчиком", image: "images/set-02.jpg", categories: ["first"], occasion: "first" },
    { id: "set-03", title: "Фотозона «Сафарі» на 1 рік", image: "images/set-03.jpg", categories: ["first"], occasion: "first" },
    { id: "set-04", title: "Хром і машинка-позашляховик з цифрою 1", image: "images/set-04.jpg", categories: ["first"], occasion: "first" },
    { id: "set-05", title: "Червона гоночна машинка з цифрою 4", image: "images/set-05.jpg", categories: ["boys"], occasion: "birthday" },
    { id: "set-06", title: "Чорно-білі кульки під стелю", image: "images/set-06.jpg", categories: ["ceiling"], occasion: "birthday" },
    { id: "set-07", title: "Футбольний набір з кубками", image: "images/set-07.jpg", categories: ["boys"], occasion: "birthday" },
    { id: "set-08", title: "Чорна цифра 9 з футбольним м'ячем", image: "images/set-08.jpg", categories: ["boys"], occasion: "birthday" },
    { id: "set-09", title: "Футбольні м'ячі та зірка з написом", image: "images/set-09.jpg", categories: ["boys"], occasion: "birthday" },
    { id: "set-10", title: "Три фонтани «Baby» з бантиком", image: "images/set-10.jpg", categories: ["newborn"], occasion: "newborn" },
    { id: "set-11", title: "Лелека з колясочкою на виписку", image: "images/set-11.jpg", categories: ["newborn"], occasion: "newborn" },
    { id: "set-12", title: "Пудрова стеля з великим бантом", image: "images/set-12.jpg", categories: ["newborn", "ceiling"], occasion: "newborn" },
    { id: "set-13", title: "Червоний бант між двома фонтанами", image: "images/set-13.jpg", categories: ["girls"], occasion: "birthday" },
    { id: "set-14", title: "Рожеве золото «18» з серцем", image: "images/set-14.jpg", categories: ["girls"], occasion: "birthday" },
    { id: "set-15", title: "Ніжно-рожеві «18» з конфетті", image: "images/set-15.jpg", categories: ["girls"], occasion: "birthday" },
    { id: "set-16", title: "Срібні «18» з пудровим бантом", image: "images/set-16.jpg", categories: ["girls"], occasion: "birthday" },
  ],

  setPriceLabel: "ціна за запитом",

  // ПРАЙС, грн за 1 шт.
  // from: true — показуємо «від», рахуємо за мінімальною ціною
  latex: [
    { id: "plain", name: "Звичайні", price: 90, swatch: "plain" },
    { id: "chrome", name: "Хром", price: 100, swatch: "chrome" },
    { id: "confetti", name: "З конфетті", price: 100, swatch: "confetti" },
    { id: "print", name: "З малюнком / написом", price: 95, swatch: "print" },
    { id: "agate", name: "Агати", price: 110, swatch: "agate" },
    { id: "brush", name: "Браш", price: 110, swatch: "brush" },
  ],

  foil: [
    { id: "heart", name: "Серце / зірка без малюнка", price: 170, icon: "heart" },
    { id: "printed", name: "З малюнком", price: 190, priceTo: 230, from: true, icon: "printed" },
    { id: "figure", name: "Фігура", price: 300, from: true, icon: "figure" },
  ],

  numberSizes: [
    { id: "70", label: "70 см", price: 350 },
    { id: "100", label: "100 см", price: 450 },
  ],
};
