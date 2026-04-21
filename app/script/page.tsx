import type { Metadata } from "next";

export const metadata: Metadata = { title: "Call Script — ColdCallBase" };

export default function ScriptPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .ccs {
          --bg: #0f0f11;
          --surface: #17171a;
          --border: #2a2a30;
          --accent: #6ee7b7;
          --accent2: #fbbf24;
          --text: #e8e8ed;
          --muted: #7a7a8a;
          --red: #f87171;
          --blue: #93c5fd;
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          line-height: 1.7;
          padding: 40px 20px 80px;
          min-height: calc(100vh - 4rem);
        }
        .ccs .container { max-width: 780px; margin: 0 auto; }
        .ccs header { border-bottom: 1px solid var(--border); padding-bottom: 28px; margin-bottom: 40px; }
        .ccs .eyebrow { font-family: 'Syne', sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
        .ccs h1 { font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800; line-height: 1.15; }
        .ccs h1 span { color: var(--accent); }
        .ccs .subtitle { color: var(--muted); margin-top: 8px; font-size: 14px; }
        .ccs .pricing { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 40px; }
        .ccs .price-card { border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; background: var(--surface); }
        .ccs .price-card.featured { border-color: rgba(110,231,183,0.35); background: rgba(110,231,183,0.04); }
        .ccs .price-label { font-family: 'Syne', sans-serif; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
        .ccs .price-label.green { color: var(--accent); }
        .ccs .price-amount { font-family: 'Syne', sans-serif; font-size: 1.9rem; font-weight: 800; color: var(--text); line-height: 1; margin-bottom: 8px; }
        .ccs .price-amount span { font-size: 1rem; color: var(--muted); font-weight: 400; }
        .ccs .price-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }
        .ccs .section { margin-bottom: 28px; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .ccs .section-header { display: flex; align-items: center; gap: 12px; padding: 13px 20px; background: var(--surface); border-bottom: 1px solid var(--border); }
        .ccs .step-num { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--bg); background: var(--accent); border-radius: 4px; padding: 2px 7px; flex-shrink: 0; }
        .ccs .step-num.warn { background: var(--accent2); }
        .ccs .step-num.info { background: var(--blue); color: #0f0f11; }
        .ccs .section-title { font-family: 'Syne', sans-serif; font-size: 13.5px; font-weight: 700; color: var(--text); }
        .ccs .section-body { padding: 20px 22px; background: #131316; }
        .ccs .script-block { background: rgba(110,231,183,0.04); border: 1px solid rgba(110,231,183,0.18); border-radius: 8px; padding: 14px 16px; font-size: 15px; line-height: 1.7; margin-bottom: 12px; }
        .ccs .script-block:last-child { margin-bottom: 0; }
        .ccs .script-block .lbl { font-family: 'Syne', sans-serif; font-size: 9.5px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 6px; }
        .ccs .script-block em { color: var(--muted); font-style: italic; font-size: 13.5px; }
        .ccs .script-block strong { color: var(--accent2); font-weight: 500; }
        .ccs .obj { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .ccs .obj:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
        .ccs .obj-row { display: flex; gap: 10px; margin-bottom: 8px; align-items: flex-start; }
        .ccs .obj-row:last-child { margin-bottom: 0; }
        .ccs .obj-badge { font-family: 'Syne', sans-serif; font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; flex-shrink: 0; margin-top: 3px; }
        .ccs .obj-badge.q { background: rgba(248,113,113,0.15); color: var(--red); }
        .ccs .obj-badge.a { background: rgba(110,231,183,0.12); color: var(--accent); }
        .ccs .obj-text { font-size: 14px; line-height: 1.6; }
        .ccs .notes { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; list-style: none; padding: 0; }
        .ccs .notes li { display: flex; gap: 10px; font-size: 13.5px; color: var(--muted); }
        .ccs .notes li::before { content: '→'; color: var(--accent); flex-shrink: 0; }
        .ccs .notes li span { color: var(--text); }
        @media (max-width: 520px) {
          .ccs .pricing { grid-template-columns: 1fr; }
          .ccs h1 { font-size: 1.7rem; }
        }
      `}</style>

      <div className="ccs">
        <div className="container">
          <header>
            <div className="eyebrow">Cold Call Script — v2</div>
            <h1>
              Keep It <span>Simple</span>
            </h1>
            <p className="subtitle">
              Direct, friendly, and to the point — with pricing up front
            </p>
          </header>

          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Your Pricing
          </div>
          <div className="pricing">
            <div className="price-card">
              <div className="price-label">Static Site</div>
              <div className="price-amount">
                £500 <span>– £800</span>
              </div>
              <div className="price-desc">
                Clean, fast, mobile-friendly. Great for businesses that just
                need an online presence.
              </div>
            </div>
            <div className="price-card featured">
              <div className="price-label green">Dynamic / Reactive Site</div>
              <div className="price-amount">
                £800<span>+</span>
              </div>
              <div className="price-desc">
                Contact forms, booking systems, e-commerce, CMS — anything with
                moving parts.
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="step-num">01</span>
              <span className="section-title">The Opener</span>
            </div>
            <div className="section-body">
              <div className="script-block">
                <span className="lbl">You say</span>
                Hey, is that [Business Name]? Hi — is the owner around by any
                chance?
              </div>
              <ul className="notes">
                <li>
                  <span>
                    Keep it short — don&apos;t pitch yet, just get to the right
                    person.
                  </span>
                </li>
                <li>
                  <span>
                    If they ask what it&apos;s about — &ldquo;It&apos;s just a
                    quick call about your website, won&apos;t take long!&rdquo;
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="step-num">02</span>
              <span className="section-title">Get to the Owner</span>
            </div>
            <div className="section-body">
              <div className="script-block">
                <span className="lbl">
                  If you&apos;re speaking to the owner
                </span>
                Hi! My name&apos;s [Your Name] — I noticed you don&apos;t have a
                website and just wanted to reach out quickly. I build websites
                for local businesses — do you have 2 minutes?
              </div>
              <div className="script-block">
                <span className="lbl">
                  If it&apos;s a gatekeeper / member of staff
                </span>
                No worries — could I grab 2 minutes with them? It&apos;s just a
                quick call about the business&apos;s website.{" "}
                <em>
                  (If unavailable: &ldquo;When&apos;s a good time to catch
                  them?&rdquo; — note it down and call back.)
                </em>
              </div>
              <ul className="notes">
                <li>
                  <span>
                    Don&apos;t pitch to staff — they can&apos;t say yes and will
                    usually just say no on the owner&apos;s behalf.
                  </span>
                </li>
                <li>
                  <span>
                    If they say no / bad time — &ldquo;No worries, when&apos;s a
                    better time to call back?&rdquo;
                  </span>
                </li>
                <li>
                  <span>
                    If they have a site — &ldquo;Oh great! Is it getting you
                    much business at the moment?&rdquo;
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="step-num">03</span>
              <span className="section-title">The Pitch + Pricing</span>
            </div>
            <div className="section-body">
              <div className="script-block">
                <span className="lbl">You say</span>
                So basically — I make websites for small businesses in the area.
                Prices start from around{" "}
                <strong>£500–£800 for a straightforward static site</strong>, or{" "}
                <strong>£800+ if you need something more interactive</strong> —
                like online booking, a shop, or a contact form that actually
                does stuff.
                <br />
                <br />
                Either way, I can put together a{" "}
                <strong>free demo for you within a few days</strong> so you can
                actually see what it&apos;d look like before you commit to
                anything.
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="step-num">04</span>
              <span className="section-title">The Ask</span>
            </div>
            <div className="section-body">
              <div className="script-block">
                <span className="lbl">You say</span>
                Would it be alright if I put something together and gave you a
                call back in a couple of days to show you what I&apos;ve come up
                with? Totally free, no obligation — if you like it we can talk,
                if not, no worries at all.
              </div>
              <ul className="notes">
                <li>
                  <span>
                    If yes — get their name, email, and any info about the
                    business (what they do, any colours/style preferences).
                  </span>
                </li>
                <li>
                  <span>
                    If unsure — &ldquo;I&apos;ll keep it really quick, just 5
                    minutes — you can always say no after seeing it!&rdquo;
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="step-num warn">05</span>
              <span className="section-title">Common Objections</span>
            </div>
            <div className="section-body">
              <div className="obj">
                <div className="obj-row">
                  <span className="obj-badge q">Them</span>
                  <span className="obj-text">
                    &ldquo;We already have a website.&rdquo;
                  </span>
                </div>
                <div className="obj-row">
                  <span className="obj-badge a">You</span>
                  <span className="obj-text">
                    Oh nice — is it working well for you? Bringing in customers?
                    A lot of older sites aren&apos;t set up to show up on Google
                    properly or look good on phones. I could take a look and let
                    you know if there&apos;s anything worth improving — no
                    charge for that.
                  </span>
                </div>
              </div>

              <div className="obj">
                <div className="obj-row">
                  <span className="obj-badge q">Them</span>
                  <span className="obj-text">
                    &ldquo;How much does it cost?&rdquo;
                  </span>
                </div>
                <div className="obj-row">
                  <span className="obj-badge a">You</span>
                  <span className="obj-text">
                    So a basic site starts at £500–£800. If you need anything
                    more — like a shop or booking system — it&apos;d be £800+.
                    But honestly the easiest thing is for me to build you a
                    quick demo and give you a proper quote once I know what you
                    need. Sound fair?
                  </span>
                </div>
              </div>

              <div className="obj">
                <div className="obj-row">
                  <span className="obj-badge q">Them</span>
                  <span className="obj-text">
                    &ldquo;We can&apos;t afford it right now.&rdquo;
                  </span>
                </div>
                <div className="obj-row">
                  <span className="obj-badge a">You</span>
                  <span className="obj-text">
                    Totally fair — no pressure at all. Would it be alright if I
                    sent you something over email so you&apos;ve got my details
                    for when the time&apos;s right?
                  </span>
                </div>
              </div>

              <div className="obj">
                <div className="obj-row">
                  <span className="obj-badge q">Them</span>
                  <span className="obj-text">
                    &ldquo;Just send me an email.&rdquo;
                  </span>
                </div>
                <div className="obj-row">
                  <span className="obj-badge a">You</span>
                  <span className="obj-text">
                    Yeah of course! What&apos;s the best email? And just so I
                    can make it relevant — what does the business do mainly?{" "}
                    <em>(send a short, punchy email within the hour)</em>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="step-num info">06</span>
              <span className="section-title">Wrapping Up</span>
            </div>
            <div className="section-body">
              <div className="script-block">
                <span className="lbl">If they&apos;re interested</span>
                Amazing — I&apos;ll get started on something and give you a call
                back in a couple of days. What&apos;s the best number for you?
                Cheers, [Name] — speak soon!
              </div>
              <div className="script-block">
                <span className="lbl">If not right now</span>
                No worries at all — I&apos;ll drop you an email so you&apos;ve
                got my details. Hope business is going well, cheers!
              </div>
              <ul className="notes">
                <li>
                  <span>
                    Note down what they told you about the business before you
                    hang up.
                  </span>
                </li>
                <li>
                  <span>
                    Tell william (me) that you go a successful booking or sale
                    from the call.
                  </span>
                </li>
                <li>
                  <span>
                    Follow up exactly when you said you would — reliability
                    sells.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
