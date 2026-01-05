export function generateOutfitIdeas(recommendedColors = []) {
  if (!recommendedColors.length) return [];

  /* ---------- Helpers ---------- */
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- Safe Bottoms ---------- */
  const safeBottoms = [
    { name: "White Trousers", hex: "#FFFFFF" },
    { name: "Beige Pants", hex: "#E6D5B8" },
    { name: "Black Jeans", hex: "#000000" },
    { name: "Blue Denim Jeans", hex: "#2F4F6F" },
    { name: "Neutral Tailored Pants", hex: "#B0A99F" }
  ];

  /* ---------- Event-based Rules ---------- */

  const eventRules = {
  casual: {
    footwear: [
      "White sneakers",
      "Canvas sneakers",
      "Nude flats",
      "Ballet flats",
      "Minimal sandals",
      "Slide sandals",
      "Espadrilles"
    ],
    layers: [
      "Light cardigan",
      "Denim jacket",
      "Cotton overshirt",
      "Soft shrug",
      "Light hoodie",
      "No outer layer"
    ],
    jewelry: [
      "Gold minimal jewelry",
      "Silver accents",
      "Delicate chain necklace",
      "Small hoop earrings",
      "Stud earrings",
      "Beaded bracelet"
    ],
    bottoms: [
      "Blue Denim Jeans",
      "Black Jeans",
      "Beige Pants",
      "Relaxed fit trousers",
      "Casual linen pants"
    ]
  },

  work: {
    footwear: [
      "Brown loafers",
      "Black loafers",
      "Nude flats",
      "Pointed flats",
      "Low block heels",
      "Classic pumps"
    ],
    layers: [
      "Structured blazer",
      "Light cardigan",
      "Tailored vest",
      "Formal shrug"
    ],
    jewelry: [
      "Gold minimal jewelry",
      "Silver accents",
      "Pearl earrings",
      "Thin bangle",
      "Minimal pendant necklace"
    ],
    bottoms: [
      "Neutral Tailored Pants",
      "Beige Pants",
      "Black Jeans",
      "Cigarette trousers",
      "Straight fit formal pants"
    ]
  },

  evening: {
    footwear: [
      "Black boots",
      "Ankle boots",
      "Heels",
      "Strappy heels",
      "Minimal sandals",
      "Pointed toe heels"
    ],
    layers: [
      "Structured blazer",
      "Soft shrug",
      "Silk wrap",
      "Longline coat",
      "No outer layer"
    ],
    jewelry: [
      "Statement earrings",
      "Pearl earrings",
      "Bold cuff bracelet",
      "Layered necklaces",
      "Chandelier earrings"
    ],
    bottoms: [
      "Black Jeans",
      "White Trousers",
      "Neutral Tailored Pants",
      "Satin trousers",
      "Wide-leg evening pants"
    ]
  }
};


  /* ---------- Outfit Builder ---------- */
  const buildOutfit = (outfitName, ruleKey) => {
    const rules = eventRules[ruleKey];

    const topColor = pickRandom(recommendedColors);

    const bottom = pickRandom(
      safeBottoms.filter((b) => rules.bottoms.includes(b.name))
    );

    return {
      outfitName,

      /* ---------- Text Only ---------- */
      top: `${topColor.name}`,
      bottom: bottom.name,
      footwear: pickRandom(rules.footwear),
      layer: pickRandom(rules.layers),
      jewelry: pickRandom(rules.jewelry),

      /* ---------- Swatches ---------- */
      colors: [
        topColor, 
        bottom    
      ]
    };
  };

  /* ---------- Final Output ---------- */
  return [
    buildOutfit("Casual Everyday Look", "casual"),
    buildOutfit("Smart Casual / Work Look", "work"),
    buildOutfit("Evening / Elevated Look", "evening")
  ];
}
