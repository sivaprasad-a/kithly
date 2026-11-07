import { describe, expect, it } from "vitest";
import { defaultInvite } from "@/lib/schemas";
import { mailtoHref, shareMessage, whatsappHref } from "@/lib/share";
import { fmtTime, mapsHref } from "@/lib/format";

describe("shareMessage", () => {
  const invite = { ...defaultInvite(), date: "2026-11-28", rsvpBy: "2026-11-20", address: "1 Main St\nPhoenix" };

  it("greets a family by name and includes the link", () => {
    const msg = shareMessage(invite, "https://x.app/i/abc", "The Sharmas");
    expect(msg.startsWith("Dear The Sharmas,")).toBe(true);
    expect(msg).toContain("Saturday, November 28, 2026");
    expect(msg).toContain("Kindly RSVP by Nov 20:");
    expect(msg.trim().endsWith("https://x.app/i/abc")).toBe(true);
    expect(msg).toContain("1 Main St, Phoenix");
  });

  it("encodes share links", () => {
    expect(whatsappHref("a b&c")).toBe("https://wa.me/?text=a%20b%26c");
    expect(mailtoHref("Hi there", "x")).toBe("mailto:?subject=Hi%20there&body=x");
  });
});

describe("format", () => {
  it("formats times", () => {
    expect(fmtTime("16:00")).toBe("4 PM");
    expect(fmtTime("09:30")).toBe("9:30 AM");
    expect(fmtTime("00:00")).toBe("12 AM");
  });
  it("prefers an explicit map link", () => {
    expect(mapsHref("https://maps.app/x", "addr")).toBe("https://maps.app/x");
    expect(mapsHref("", "1 Main St")).toContain("query=1%20Main%20St");
    expect(mapsHref("", "")).toBe("");
  });
});
