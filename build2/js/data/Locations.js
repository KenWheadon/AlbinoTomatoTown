const locations = {
  [TOWN_CENTER]: {
    description:
      "An old western town square nestled in a garden, with dusty paths between flower beds and saloon doors swinging in the breeze.",
    characters: [ALBINO_TOMATO],
    items: [RUSTY_KEY, OLD_BOOT],
    locations: [SALOON],
    background: "town_center",
  },
  [SALOON]: {
    description:
      "A rustic saloon with wooden tables scattered among potted plants, where the local vegetables gather to socialize.",
    characters: [CUCUMBER_GAL, GREEN_PEPPER_GAL],
    items: [BRASS_KNUCKLES],
    locations: [TOWN_CENTER, SALOON_BACKROOM],
    background: "saloon",
  },
  [SALOON_BACKROOM]: {
    description:
      "A quiet back room of the saloon, dimly lit with shelves of garden supplies and forgotten items.",
    characters: [PUMPKIN_PETE],
    items: [MAGAZINE],
    locations: [SALOON],
    background: "saloon_backroom",
  },
};
