const achievements = {
  [GRILLED_TOMATO]: {
    title: "Grilled Tomato",
    description: "What are you - a cop or something?",
    hint: "Ask Albino Tomato about his criminal past...",
    characterId: ALBINO_TOMATO,
    triggerKeywords: ["grilled_cheese"], // Single entry - normalization handles all cases
    isUnlocked: false,
  },
  [GALS_BEST_FRIEND]: {
    title: "Gals Best Friend",
    description: "What gal doesn't like a friendly pickle?",
    hint: "Get Cucumber Gal to talk about her dog Pickle...",
    characterId: CUCUMBER_GAL,
    triggerKeywords: ["pickle_perfect"],
    isUnlocked: false,
  },
  [THE_COLOR_OF_ENVY]: {
    title: "The Color of Envy",
    description:
      "Also the color of money, which Cucumber Gal is making more of as well.",
    hint: "Get Green Pepper Gal to admit her true feelings about Cucumber Gal...",
    characterId: GREEN_PEPPER_GAL,
    triggerKeywords: ["green_with_envy"],
    isUnlocked: false,
  },
  [PUMPKIN_PALS]: {
    title: "Pumpkin Pals",
    description: "Helping people never goes out of style.",
    hint: "Help Pumpkin Pete with his problem...",
    characterId: PUMPKIN_PETE,
    triggerKeywords: ["pumpkin_spice"],
    isUnlocked: false,
  },
};
