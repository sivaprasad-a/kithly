import { z } from "zod";

export const EVENT_TYPES = {
  baby: { label: "Baby's Birthday", kicker: "First Birthday", favourites: true },
  birthday: { label: "Birthday", kicker: "Birthday Celebration", favourites: false },
  anniversary: { label: "Anniversary", kicker: "Anniversary Dinner", favourites: false },
  babyshower: { label: "Baby Shower", kicker: "Baby Shower", favourites: true },
  housewarming: { label: "Housewarming", kicker: "Housewarming", favourites: false },
  engagement: { label: "Engagement", kicker: "Engagement Celebration", favourites: false },
  naming: { label: "Naming Ceremony", kicker: "Naming Ceremony", favourites: true },
  gettogether: { label: "Get-together", kicker: "An Evening Together", favourites: false },
  other: { label: "Other", kicker: "You're Invited", favourites: false },
} as const;
export type EventType = keyof typeof EVENT_TYPES;
const eventTypeKeys = Object.keys(EVENT_TYPES) as [EventType, ...EventType[]];

export const TEMPLATE_IDS = ["midnight", "sage", "olive", "mist", "ivory", "custom"] as const;
export const FONT_IDS = ["classic", "modern", "script"] as const;
export const HERO_SHAPES = ["arch", "circle", "square"] as const;

const text = (max: number) => z.string().trim().max(max);
// Images are browser-compressed data URLs; keep them bounded.
const imageDataUrl = z
  .string()
  .max(400_000)
  .refine((s) => s === "" || /^data:image\/(webp|jpeg|png);base64,/.test(s), "Must be an image");

export const FavouritesSchema = z.object({
  colors: z.array(z.object({ hex: z.string().regex(/^#[0-9a-fA-F]{6}$/), name: text(40) })).max(5),
  toy: text(160),
  food: text(160),
  theme: text(120),
  gift: text(200),
});

/** Everything the host edits. Stored on the event document. */
export const InviteSchema = z.object({
  type: z.enum(eventTypeKeys),
  kicker: text(60),
  title: text(80).min(1, "Give your event a title"),
  honoree: text(80),
  from: text(80),
  message: text(600),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  start: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
  end: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
  dress: text(120),

  template: z.enum(TEMPLATE_IDS),
  font: z.enum(FONT_IDS),
  heroShape: z.enum(HERO_SHAPES),
  overlay: z.number().int().min(0).max(85),
  heroImage: imageDataUrl,
  bgImage: imageDataUrl,

  venue: text(120),
  address: text(300),
  mapUrl: z.string().trim().max(500).refine((s) => s === "" || /^https?:\/\//i.test(s), "Must start with http(s)://"),
  parking: text(400),

  veg: z.boolean(),
  nonveg: z.boolean(),
  menu: text(300),
  softDrinks: z.array(text(40).min(1)).max(15),
  alcoholOn: z.boolean(),
  alcohol: z.array(text(40).min(1)).max(15),

  favourites: FavouritesSchema,

  maxPerFamily: z.number().int().min(1).max(30),
  rsvpBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  kidsWelcome: z.boolean(),
});
export type Invite = z.infer<typeof InviteSchema>;

export const FamilySchema = z.object({
  id: z.string(),
  name: text(80).min(1),
  token: z.string(),
});
export type Family = z.infer<typeof FamilySchema>;

export type EventDoc = {
  id: string;
  ownerId: string;
  invite: Invite;
  families: Family[];
  /** Shared link anyone can open; they type their family name. */
  openToken: string;
  createdAt: number;
  updatedAt: number;
};

export const RSVP_STATUS = ["yes", "maybe", "no"] as const;
export type RsvpStatus = (typeof RSVP_STATUS)[number];

/** What a guest submits. Server re-validates against the event's limits. */
export const RsvpInputSchema = z.object({
  familyName: text(80).min(1, "Please add your family name"),
  contact: text(120),
  status: z.enum(RSVP_STATUS),
  adults: z.number().int().min(0).max(30),
  kids: z.number().int().min(0).max(30),
  veg: z.number().int().min(0).max(60),
  nonveg: z.number().int().min(0).max(60),
  softDrinks: z.array(text(40)).max(15),
  alcohol: z.array(text(40)).max(16),
  diet: text(300),
  note: text(600),
});
export type RsvpInput = z.infer<typeof RsvpInputSchema>;

export type RsvpDoc = RsvpInput & {
  id: string;
  eventId: string;
  familyId: string;
  submittedAt: number;
};

export function defaultInvite(): Invite {
  return {
    type: "baby",
    kicker: "First Birthday",
    title: "Aarav turns One",
    honoree: "Our little sunshine",
    from: "Priya & Rahul",
    message:
      "A small, cosy celebration with the people who matter most to us. Come for cake, giggles and lots of hugs.",
    date: "",
    start: "16:00",
    end: "20:00",
    dress: "",
    template: "midnight",
    font: "classic",
    heroShape: "arch",
    overlay: 45,
    heroImage: "",
    bgImage: "",
    venue: "Our Home",
    address: "",
    mapUrl: "",
    parking: "",
    veg: true,
    nonveg: true,
    menu: "",
    softDrinks: ["Mango lassi", "Fresh lime soda", "Coke", "Sprite", "Juice boxes"],
    alcoholOn: false,
    alcohol: ["Red wine", "White wine", "Beer"],
    favourites: { colors: [{ hex: "#DAA112", name: "Sunshine yellow" }], toy: "", food: "", theme: "", gift: "" },
    maxPerFamily: 4,
    rsvpBy: "",
    kidsWelcome: true,
  };
}

/** Guest-safe view of an event: never includes other families' tokens. */
export type PublicEvent = { id: string; invite: Invite };
