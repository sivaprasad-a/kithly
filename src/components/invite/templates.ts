import type { Invite } from "@/lib/schemas";

export const TEMPLATES: Array<{ id: Invite["template"]; name: string; swatch: string; ink: string }> = [
  { id: "midnight", name: "Midnight Gold", swatch: "radial-gradient(circle at 50% 0,#1C5254,#10383A 60%)", ink: "#DAA112" },
  { id: "sage", name: "Sage Linen", swatch: "linear-gradient(#EEF0E8,#E3E7DC)", ink: "#10383A" },
  { id: "olive", name: "Olive Grove", swatch: "linear-gradient(#717A5B,#4F5640)", ink: "#F0C24B" },
  { id: "mist", name: "Morning Mist", swatch: "linear-gradient(#8A9C99,#5E706E)", ink: "#fff" },
  { id: "ivory", name: "Gilded Ivory", swatch: "#FBF7EC", ink: "#B98608" },
  { id: "custom", name: "Your design", swatch: "repeating-linear-gradient(45deg,#E9E6DC 0 6px,#F5F2E9 6px 12px)", ink: "#666E51" },
];
