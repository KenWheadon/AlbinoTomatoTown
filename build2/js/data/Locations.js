const locations = {
  [GARDEN]: {
    description: "A lush garden filled with talking plants and hidden secrets.",
    characters: [ALBINO_TOMATO, CHATTY_DAISY],
    items: [OLD_BOOT, GARDEN_JOURNAL],
    locations: [GREENHOUSE, SHED, POND],
    background: "garden",
  },
  [GREENHOUSE]: {
    description: "A warm, humid greenhouse with exotic plants.",
    characters: [WISE_OAK],
    items: [RUSTY_KEY],
    locations: [GARDEN],
    background: "greenhouse",
  },
  [SHED]: {
    description: "An old garden shed filled with forgotten tools.",
    characters: [],
    items: [],
    locations: [GARDEN],
    background: "shed",
  },
  [POND]: {
    description: "A peaceful pond where lily pads float serenely.",
    characters: [WISE_FROG],
    items: [LILY_PAD],
    locations: [GARDEN],
    background: "pond",
  },
};
