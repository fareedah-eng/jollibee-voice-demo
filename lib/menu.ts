export type CategoryId =
  | "combos"
  | "chicken"
  | "burgers"
  | "spaghetti-palabok"
  | "ricemeals"
  | "sandwiches"
  | "sides"
  | "desserts"
  | "beverages"
  | "kids";

export interface Category {
  id: CategoryId;
  label: string;
  labelTl: string;
}

export interface MenuItem {
  id: string;
  name: string;
  nameTl?: string;
  description: string;
  category: CategoryId;
  price: number;
  image: string;
  tags?: Array<"bestseller" | "new" | "spicy">;
  /** Addon ids suggested when this item is ordered (grounds upsell offers). */
  addonIds?: string[];
  /** Can be upgraded into a combo/meal by adding a drink + side. */
  comboEligible?: boolean;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  category: "drink" | "side" | "dessert" | "upsize";
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  price: number;
  image: string;
  tags?: Array<"bestseller" | "new">;
}

export const CATEGORIES: Category[] = [
  { id: "combos", label: "Combos & Meals", labelTl: "Mga Combo" },
  { id: "chicken", label: "Chickenjoy", labelTl: "Chickenjoy" },
  { id: "burgers", label: "Burgers", labelTl: "Burger" },
  { id: "spaghetti-palabok", label: "Spaghetti & Palabok", labelTl: "Spaghetti't Palabok" },
  { id: "ricemeals", label: "Rice Meals", labelTl: "Rice Meals" },
  { id: "sandwiches", label: "Sandwiches", labelTl: "Sandwiches" },
  { id: "sides", label: "Fries & Sides", labelTl: "Fries at Sides" },
  { id: "desserts", label: "Desserts & Pies", labelTl: "Panghimagas" },
  { id: "beverages", label: "Beverages", labelTl: "Inumin" },
  { id: "kids", label: "Kids Meal", labelTl: "Kids Meal" },
];

export const ADDONS: Addon[] = [
  { id: "addon-coke-regular", name: "Coke Regular", price: 45, category: "drink" },
  { id: "addon-coke-float", name: "Coke Float", price: 60, category: "drink" },
  { id: "addon-iced-tea", name: "Iced Tea", price: 45, category: "drink" },
  { id: "addon-fries-regular", name: "Regular Fries", price: 55, category: "side" },
  { id: "addon-gravy", name: "Extra Gravy", price: 25, category: "side" },
  { id: "addon-peach-mango-pie", name: "Peach-Mango Pie", price: 45, category: "dessert" },
  { id: "addon-sundae-chocolate", name: "Chocolate Sundae", price: 49, category: "dessert" },
  { id: "addon-upsize-drink", name: "Upsize Drink", price: 15, category: "upsize" },
];

export const MENU_ITEMS: MenuItem[] = [
  // Chickenjoy
  {
    id: "chickenjoy-1pc-solo",
    name: "1-pc Chickenjoy Solo",
    nameTl: "1-pc Chickenjoy",
    description: "Jollibee's signature crispy-juicy fried chicken, one piece.",
    category: "chicken",
    price: 98,
    image: "/menu/chickenjoy-1pc-solo.png",
    tags: ["bestseller"],
    addonIds: ["addon-fries-regular", "addon-coke-regular", "addon-gravy"],
    comboEligible: true,
  },
  {
    id: "chickenjoy-2pc-solo",
    name: "2-pc Chickenjoy Solo",
    description: "Two pieces of Jollibee's crispy-juicy fried chicken.",
    category: "chicken",
    price: 189,
    image: "/menu/chickenjoy-2pc-solo.png",
    addonIds: ["addon-fries-regular", "addon-coke-regular"],
    comboEligible: true,
  },
  {
    id: "chickenjoy-1pc-rice",
    name: "1-pc Chickenjoy w/ Rice",
    description: "One piece Chickenjoy served with a cup of steamed rice and gravy.",
    category: "chicken",
    price: 116,
    image: "/menu/chickenjoy-1pc-rice.png",
    tags: ["bestseller"],
    addonIds: ["addon-coke-regular", "addon-gravy"],
    comboEligible: true,
  },
  // Burgers
  {
    id: "yumburger",
    name: "Yumburger",
    description: "Jollibee's classic burger with savory beef patty and sweet-style sauce.",
    category: "burgers",
    price: 39,
    image: "/menu/yumburger.png",
    addonIds: ["addon-fries-regular", "addon-coke-regular"],
    comboEligible: true,
  },
  {
    id: "cheesy-yumburger",
    name: "Cheesy Yumburger",
    description: "The Yumburger topped with a slice of melted cheese.",
    category: "burgers",
    price: 59,
    image: "/menu/cheesy-yumburger.png",
    tags: ["bestseller"],
    addonIds: ["addon-fries-regular", "addon-coke-regular"],
    comboEligible: true,
  },
  {
    id: "champ",
    name: "Champ Burger",
    description: "A big, juicy 100% pure beef burger stacked with fresh lettuce and tomato.",
    category: "burgers",
    price: 135,
    image: "/menu/champ.png",
    addonIds: ["addon-fries-regular", "addon-coke-regular", "addon-upsize-drink"],
    comboEligible: true,
  },
  // Spaghetti & Palabok
  {
    id: "jolly-spaghetti-solo",
    name: "Jolly Spaghetti Solo",
    description: "Sweet-style spaghetti with chunky ham, ground beef, and hotdog slices.",
    category: "spaghetti-palabok",
    price: 65,
    image: "/menu/jolly-spaghetti-solo.png",
    tags: ["bestseller"],
    addonIds: ["addon-coke-regular", "addon-peach-mango-pie"],
    comboEligible: true,
  },
  {
    id: "palabok-fiesta-solo",
    name: "Palabok Fiesta Solo",
    description: "Rice noodles in a savory shrimp-flavored sauce, topped with egg and chicharon.",
    category: "spaghetti-palabok",
    price: 68,
    image: "/menu/palabok-fiesta-solo.png",
    addonIds: ["addon-coke-regular"],
    comboEligible: true,
  },
  // Rice meals
  {
    id: "burger-steak-1pc-rice",
    name: "1-pc Burger Steak w/ Rice",
    description: "Beef patty smothered in mushroom gravy, served with rice.",
    category: "ricemeals",
    price: 99,
    image: "/menu/burger-steak-1pc-rice.png",
    addonIds: ["addon-coke-regular", "addon-gravy"],
    comboEligible: true,
  },
  {
    id: "chicken-fillet-rice",
    name: "Chicken Fillet w/ Rice",
    description: "Breaded chicken fillet steak, served with rice and gravy.",
    category: "ricemeals",
    price: 109,
    image: "/menu/chicken-fillet-rice.png",
    addonIds: ["addon-coke-regular"],
    comboEligible: true,
  },
  // Sandwiches
  {
    id: "chicken-sandwich",
    name: "Crunchy Chicken Sandwich",
    description: "Crispy breaded chicken fillet on a toasted bun with mayo.",
    category: "sandwiches",
    price: 79,
    image: "/menu/chicken-sandwich.png",
    tags: ["new"],
    addonIds: ["addon-fries-regular", "addon-coke-regular"],
    comboEligible: true,
  },
  {
    id: "jolly-hotdog",
    name: "Cheesy Classic Jolly Hotdog",
    description: "All-beef hotdog on a soft bun, topped with cheese sauce.",
    category: "sandwiches",
    price: 55,
    image: "/menu/jolly-hotdog.png",
    addonIds: ["addon-fries-regular", "addon-coke-regular"],
    comboEligible: true,
  },
  // Sides
  {
    id: "fries-regular",
    name: "Regular Fries",
    description: "Crispy golden fries, lightly salted.",
    category: "sides",
    price: 55,
    image: "/menu/fries-regular.png",
  },
  {
    id: "chicken-nuggets-6pc",
    name: "6-pc Chicken Nuggets",
    description: "Bite-sized breaded chicken nuggets, served with gravy dip.",
    category: "sides",
    price: 99,
    image: "/menu/chicken-nuggets-6pc.png",
    addonIds: ["addon-gravy"],
  },
  {
    id: "mashed-potato",
    name: "Mashed Potato",
    description: "Creamy mashed potato topped with savory gravy.",
    category: "sides",
    price: 49,
    image: "/menu/mashed-potato.png",
  },
  // Desserts
  {
    id: "peach-mango-pie",
    name: "Peach-Mango Pie",
    description: "Crispy fried pie filled with sweet peach-mango filling.",
    category: "desserts",
    price: 45,
    image: "/menu/peach-mango-pie.png",
    tags: ["bestseller"],
  },
  {
    id: "halo-halo",
    name: "Halo-Halo",
    description: "Shaved ice dessert with mixed sweet beans, fruits, leche flan, and ube ice cream.",
    category: "desserts",
    price: 89,
    image: "/menu/halo-halo.png",
    tags: ["new"],
  },
  {
    id: "chocolate-sundae",
    name: "Chocolate Sundae",
    description: "Soft-serve vanilla ice cream topped with rich chocolate syrup.",
    category: "desserts",
    price: 49,
    image: "/menu/chocolate-sundae.png",
  },
  // Beverages
  {
    id: "coke-regular",
    name: "Coke Regular",
    description: "Ice-cold Coca-Cola.",
    category: "beverages",
    price: 45,
    image: "/menu/coke-regular.png",
  },
  {
    id: "coke-float",
    name: "Coke Float",
    description: "Coca-Cola topped with a scoop of soft-serve vanilla ice cream.",
    category: "beverages",
    price: 60,
    image: "/menu/coke-float.png",
    tags: ["bestseller"],
  },
  {
    id: "iced-tea",
    name: "Iced Tea",
    description: "House-blend iced tea.",
    category: "beverages",
    price: 45,
    image: "/menu/iced-tea.png",
  },
  // Kids
  {
    id: "kids-meal-chickenjoy",
    name: "Kids Meal: 1-pc Chickenjoy",
    description: "1-pc Chickenjoy with rice, a small drink, and a toy.",
    category: "kids",
    price: 129,
    image: "/menu/kids-meal-chickenjoy.png",
  },
  {
    id: "kids-meal-spaghetti",
    name: "Kids Meal: Jolly Spaghetti",
    description: "Jolly Spaghetti with a small drink and a toy.",
    category: "kids",
    price: 109,
    image: "/menu/kids-meal-spaghetti.png",
  },
];

export const COMBOS: Combo[] = [
  {
    id: "combo-chickenjoy-1pc",
    name: "1-pc Chickenjoy Combo",
    description: "1-pc Chickenjoy w/ Rice, Regular Fries, and a Coke Regular.",
    itemIds: ["chickenjoy-1pc-rice", "fries-regular", "coke-regular"],
    price: 179,
    image: "/menu/combo-chickenjoy-1pc.png",
    tags: ["bestseller"],
  },
  {
    id: "combo-chickenjoy-2pc",
    name: "2-pc Chickenjoy Combo",
    description: "2-pc Chickenjoy Solo, Regular Fries, and a Coke Regular.",
    itemIds: ["chickenjoy-2pc-solo", "fries-regular", "coke-regular"],
    price: 259,
    image: "/menu/combo-chickenjoy-2pc.png",
  },
  {
    id: "combo-cheesy-yumburger",
    name: "Cheesy Yumburger Combo",
    description: "Cheesy Yumburger, Regular Fries, and a Coke Regular.",
    itemIds: ["cheesy-yumburger", "fries-regular", "coke-regular"],
    price: 129,
    image: "/menu/combo-cheesy-yumburger.png",
    tags: ["bestseller"],
  },
  {
    id: "combo-champ",
    name: "Champ Combo",
    description: "Champ Burger, Regular Fries, and a Coke Regular.",
    itemIds: ["champ", "fries-regular", "coke-regular"],
    price: 199,
    image: "/menu/combo-champ.png",
  },
  {
    id: "combo-jolly-spaghetti",
    name: "Jolly Spaghetti Combo",
    description: "Jolly Spaghetti, a slice of Peach-Mango Pie, and a Coke Regular.",
    itemIds: ["jolly-spaghetti-solo", "peach-mango-pie", "coke-regular"],
    price: 139,
    image: "/menu/combo-jolly-spaghetti.png",
    tags: ["new"],
  },
  {
    id: "combo-chicken-sandwich",
    name: "Crunchy Chicken Sandwich Combo",
    description: "Crunchy Chicken Sandwich, Regular Fries, and a Coke Regular.",
    itemIds: ["chicken-sandwich", "fries-regular", "coke-regular"],
    price: 159,
    image: "/menu/combo-chicken-sandwich.png",
    tags: ["new"],
  },
];

export function findMenuItem(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((item) => item.id === id);
}

export function findCombo(id: string): Combo | undefined {
  return COMBOS.find((combo) => combo.id === id);
}

export function findAddon(id: string): Addon | undefined {
  return ADDONS.find((addon) => addon.id === id);
}

/** Any orderable line — a single item or a combo — looked up by id. */
export function findOrderable(
  id: string
): { kind: "item"; data: MenuItem } | { kind: "combo"; data: Combo } | { kind: "addon"; data: Addon } | undefined {
  const item = findMenuItem(id);
  if (item) return { kind: "item", data: item };
  const combo = findCombo(id);
  if (combo) return { kind: "combo", data: combo };
  const addon = findAddon(id);
  if (addon) return { kind: "addon", data: addon };
  return undefined;
}
