import { defaultInvite } from "@/lib/schemas";

/** A trimmed showcase invite used on marketing surfaces (landing, sign-in). */
export const sampleInvite = {
  ...defaultInvite(),
  kicker: "You're Invited",
  title: "A Little Celebration",
  honoree: "",
  from: "The Family",
  message: "A small, cosy gathering with the people who matter most to us. Come for food, laughter and good company.",
  date: "2026-11-28",
  venue: "Willow Creek Backyard",
  address: "Phoenix, AZ",
  menu: "Biryani, paneer tikka & a mango cake",
  favourites: { colors: [], toy: "", food: "", theme: "", gift: "" },
};
