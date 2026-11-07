import type { CSSProperties, ReactNode } from "react";
import { EVENT_TYPES, type Invite } from "@/lib/schemas";
import { fmtShortDate, fmtTime, mapsHref, parseDate } from "@/lib/format";

type Props = {
  invite: Invite;
  /** Shows the empty photo frame so hosts know where the hero goes. */
  editing?: boolean;
  /** Narrower type scale for the phone preview. */
  compact?: boolean;
  /** RSVP button slot (a link, a scroll button, or nothing). */
  cta?: ReactNode;
};

const Spark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" />
  </svg>
);
const Pin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

/** The invitation itself. Pure and server-safe: used by the editor preview, the guest page and share images. */
export function InviteCard({ invite: e, editing, compact, cta }: Props) {
  const d = parseDate(e.date);
  const fav = e.favourites;
  const showFav =
    EVENT_TYPES[e.type].favourites && (fav.colors.length > 0 || fav.toy || fav.food || fav.theme);
  const map = mapsHref(e.mapUrl, e.address);
  const style = { "--ov": e.overlay / 100 } as CSSProperties;

  return (
    <article className={`inv t-${e.template} f-${e.font}${compact ? " compact" : ""}`} style={style}>
      {e.template === "custom" && e.bgImage && (
        <>
          <div className="bgimg" style={{ backgroundImage: `url(${e.bgImage})` }} />
          <div className="bgshade" />
        </>
      )}
      <div className="frame" />
      <div className="inv-in">
        {e.from && (
          <>
            <p className="eyebrow">Together with love</p>
            <p className="from">{e.from} invite you</p>
          </>
        )}

        {e.heroImage ? (
          <div className={`hero ${e.heroShape}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL from the host's upload */}
            <img src={e.heroImage} alt={e.honoree || e.title} />
          </div>
        ) : editing ? (
          <div className={`hero ${e.heroShape} empty`}>
            Hero photo
            <br />
            (optional)
          </div>
        ) : null}

        {e.kicker && <p className="kicker">{e.kicker}</p>}
        <h1>{e.title || "Your event"}</h1>
        {e.honoree && <p className="honoree">{e.honoree}</p>}
        {e.message && <p className="msg">{e.message}</p>}

        <div className="orn">
          <Spark />
        </div>

        {d && (
          <div className="when">
            <div className="side">{d.toLocaleDateString("en-US", { weekday: "long" })}</div>
            <div>
              <div className="day">{d.getDate()}</div>
              <div className="mon">
                {d.toLocaleDateString("en-US", { month: "long" })} {d.getFullYear()}
              </div>
            </div>
            <div className="side">
              {fmtTime(e.start)}
              {e.end && ` – ${fmtTime(e.end)}`}
            </div>
          </div>
        )}

        {(e.venue || e.address) && (
          <div className="blk">
            <h3>Where</h3>
            {e.venue && <p className="venue">{e.venue}</p>}
            {e.address && <p className="addr">{e.address}</p>}
            {map && (
              <a className="pill" href={map} target="_blank" rel="noopener noreferrer">
                <Pin /> Directions
              </a>
            )}
            {e.parking && (
              <div className="park">
                <span className="p">P</span>
                <div>{e.parking}</div>
              </div>
            )}
          </div>
        )}

        {e.dress && (
          <div className="blk">
            <h3>Dress code</h3>
            <p className="addr" style={{ color: "inherit" }}>
              {e.dress}
            </p>
          </div>
        )}

        {showFav && (
          <div className="blk">
            <h3>{e.type === "babyshower" ? "For the little one on the way" : "Little favourites"}</h3>
            <div className="grid2">
              {fav.colors.length > 0 && (
                <div className="tile full">
                  <small>Favourite colours</small>
                  <div className="dots">
                    {fav.colors.map((c, i) => (
                      <span key={i}>
                        <i style={{ background: c.hex }} />
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {fav.toy && (
                <div className="tile">
                  <small>Toys</small>
                  {fav.toy}
                </div>
              )}
              {fav.food && (
                <div className="tile">
                  <small>Treats</small>
                  {fav.food}
                </div>
              )}
              {fav.theme && (
                <div className="tile full">
                  <small>Theme</small>
                  {fav.theme}
                </div>
              )}
            </div>
            {fav.gift && (
              <p className="foot" style={{ marginTop: 12 }}>
                {fav.gift}
              </p>
            )}
          </div>
        )}

        {(e.veg || e.nonveg || e.menu || e.softDrinks.length > 0 || (e.alcoholOn && e.alcohol.length > 0)) && (
          <div className="blk">
            <h3>Food &amp; drinks</h3>
            {(e.veg || e.nonveg) && (
              <div className="diet">
                {e.veg && (
                  <span className="v">
                    <i />
                    Veg
                  </span>
                )}
                {e.nonveg && (
                  <span className="nv">
                    <i />
                    Non-veg
                  </span>
                )}
              </div>
            )}
            {e.menu && <p className="menu">{e.menu}</p>}
            {e.softDrinks.length > 0 && (
              <div className="tags">
                {e.softDrinks.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            )}
            {e.alcoholOn && e.alcohol.length > 0 && (
              <div className="tags bar" style={{ marginTop: 7 }}>
                {e.alcohol.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {cta && (
          <div className="cta">
            {cta}
            {e.rsvpBy && <div className="by">Kindly reply by {fmtShortDate(e.rsvpBy)}</div>}
          </div>
        )}
        <p className="foot">
          An intimate gathering for our closest circle · up to {e.maxPerFamily} per family
        </p>
      </div>
    </article>
  );
}
