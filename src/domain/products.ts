export interface Product {
  HS2: string;
  "HS2 ID": number;
  HS4: string;
  "HS4 ID": number;
  Section: string;
  "Section ID": number;
  "Trade Value": number;
}

interface SectionColor {
  [key: number]: string | undefined;
}

export const sectionColors: SectionColor = {
  1: "#F2AA86", // Animal Products
  2: "#F4CE0F", // Vegetable Products
  3: "#EDB73E", // Animal and Vegetable Bi-Products
  4: "#A0D447", // Foodstuffs
  5: "#A53200", // Mineral Products
  6: "#ED40F2", // Chemical Products
  7: "#FF73FF", // Plastics and Rubbers
  8: "#6DF2B0", // Animal Hides
  9: "#DD0E31", // Wood Products
  10: "#EFDC81", // Paper Goods
  11: "#02A347", // Textiles
  12: "#2CBA0F", // Footwear and Headwear
  13: "#F46D2A", // Stone And Glass
  14: "#892EFF", // Precious Metals
  15: "#AA7329", // Metals
  16: "#2E97FF", // Machines
  17: "#69C8ED", // Transportation
  18: "#9E0071", // Instruments
  19: "#9CF2CF", // Weapons
  20: "#9C9FB2", // Miscellaneous
  21: "#847290", // Arts and Antiques
  22: "red",
};
