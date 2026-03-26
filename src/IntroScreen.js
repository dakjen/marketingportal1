import React from 'react';
import { useNavigate } from 'react-router-dom';
import './IntroScreen.css';
const DjCreativeLogo = require('./assets/djcreative-logo.png');
const HoughHero = require('./assets/4928004112513198779.jpg');
const HoughAngle2 = require('./assets/5352902128820436453.jpg');
const HoughAngle3 = require('./assets/6129611180776508136.jpg');
const FamilyPhoto = require('./assets/national-cancer-institute-VJVsEnR_vNE-unsplash.jpg');
const KeysPhoto = require('./assets/jakub-zerdzicki-Vg96IZTFubo-unsplash.jpg');
const ColorfulHousing = require('./assets/roger-starnes-sr-fIq3FoU8e8U-unsplash.jpg');

function IntroScreen() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <img src={DjCreativeLogo} alt="DJC Marketing" className="landing-nav-logo" />
          <div className="landing-nav-brand-text">
            <span className="landing-nav-name">DJC Marketing</span>
            <span className="landing-nav-sub">DakJen Creative LLC</span>
          </div>
        </div>
        <div className="landing-nav-links">
          <a href="https://dakjencreative.com" target="_blank" rel="noopener noreferrer">dakjencreative.com</a>
          <a href="mailto:marketing@dakjencreative.com">marketing@dakjencreative.com</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero" style={{ backgroundImage: `url(${HoughHero})` }}>
        <div className="landing-hero-content">
          <p className="landing-hero-eyebrow">Lease-Up Marketing for Affordable &amp; Workforce Housing</p>
          <h1 className="landing-hero-headline">
            We don't just market units —<br />
            <span className="landing-hero-accent">we move developments forward.</span>
          </h1>
          <p className="landing-hero-sub">
            DJC Marketing is a results-driven lease-up marketing firm specializing in affordable and workforce housing developments. We help properties achieve faster stabilization by driving qualified leads, supporting applicants through the process, and maintaining clear communication between owners, property managers, and prospective residents.
          </p>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="landing-stats-bar">
        <div className="landing-stats-bar-inner">
          <div className="landing-stat-item">
            <div className="landing-stat-num">470+</div>
            <div className="landing-stat-lbl">Applications Generated</div>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat-item">
            <div className="landing-stat-num">2,000+</div>
            <div className="landing-stat-lbl">Inquiries to Date</div>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat-item">
            <div className="landing-stat-num">&gt;20%</div>
            <div className="landing-stat-lbl">Reapplication Rate</div>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat-item">
            <div className="landing-stat-num">36.2%</div>
            <div className="landing-stat-lbl">Qualification Rate*</div>
          </div>
        </div>
        <p className="landing-stats-footnote">*9410 Hough Avenue, Cleveland, OH — 13.7 points above industry average for dual income-restricted properties.</p>
      </div>

      {/* ABOUT */}
      <section className="landing-section landing-section--light">
        <div className="landing-container landing-about-split">
          <div>
            <p className="landing-section-eyebrow">About Us</p>
            <h2 className="landing-section-title">An insider perspective other agencies don't have</h2>
            <div className="landing-about-body">
              <p>With deep roots in real estate development and community engagement, we bring an insider perspective that typical marketing agencies simply don't have. We understand the regulatory environment, the income-eligibility mechanics, the community dynamics, and the reporting expectations that matter to developers, investors, and property managers — and we build every campaign around them.</p>
              <p className="landing-about-callout">Delayed lease-up creates delayed revenue and increased investor risk. We exist to close that gap.</p>
            </div>
          </div>
          <div className="landing-about-photo">
            <img src={FamilyPhoto} alt="Residents at home" />
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="landing-section landing-section--dark">
        <div className="landing-container">
          <p className="landing-section-eyebrow landing-section-eyebrow--light">The Problem We Solve</p>
          <h2 className="landing-section-title landing-section-title--light">Delayed Lease-Up = Delayed Revenue</h2>
          <p className="landing-problem-intro">Affordable housing developments face a distinct set of lease-up challenges that standard marketing agencies aren't equipped to handle. Income eligibility requirements narrow the qualified applicant pool. Application platforms create friction. Community awareness takes time to build. And property management teams are often stretched too thin to run outreach on their own.</p>
          <div className="landing-problem-grid">
            <div className="landing-problem-col">
              <h3>Common Challenges</h3>
              <ul className="landing-check-list landing-check-list--red">
                <li>Low application conversion rates</li>
                <li>Slow leasing velocity</li>
                <li>Limited property management staff capacity</li>
                <li>Poor community awareness</li>
                <li>Gaps in transparency and reporting to investors</li>
                <li>Reputational and investor confidence risk</li>
              </ul>
            </div>
            <div className="landing-problem-col landing-problem-col--accent">
              <h3>The DJC Difference</h3>
              <ul className="landing-check-list landing-check-list--green">
                <li>Targeted outreach to income-qualified audiences</li>
                <li>Active applicant follow-up and support</li>
                <li>Grassroots community and employer outreach</li>
                <li>Multi-channel paid and organic campaigns</li>
                <li>Transparent biweekly reporting to stakeholders</li>
                <li>Development-industry expertise built in</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="landing-section landing-section--light">
        <div className="landing-container">
          <p className="landing-section-eyebrow">Our Services</p>
          <h2 className="landing-section-title">Three Tiers. One Goal: Full Occupancy.</h2>
          <p className="landing-services-intro">Every property is different. We offer three service tiers so you can match the level of support to your project's needs, timeline, and budget.</p>

          <div className="landing-tiers">
            <div className="landing-tier">
              <div className="landing-tier-label">Tier 1</div>
              <h3>Online &amp; Social Campaign</h3>
              <p className="landing-tier-tagline">Digital lead generation across paid and organic channels.</p>
              <ul>
                <li>Targeted social media ads on Facebook, Instagram, Google, and LinkedIn</li>
                <li>Organic content creation and scheduling</li>
                <li>Email outreach to community partners and organizations</li>
                <li>Strategic apartment listings and digital placement</li>
                <li>Biweekly performance tracking reports</li>
              </ul>
            </div>
            <div className="landing-tier landing-tier--featured">
              <div className="landing-tier-badge">Most Popular</div>
              <div className="landing-tier-label">Tier 2</div>
              <h3>Total Marketing Package</h3>
              <p className="landing-tier-tagline">Everything in Tier 1, plus traditional media and expanded community outreach.</p>
              <ul>
                <li>All Tier 1 digital and social services</li>
                <li>Billboard and job site banner coordination</li>
                <li>Radio, newspaper, and podcast placements</li>
                <li>Agency, nonprofit, and employer partnership outreach</li>
                <li>Printed flyer and poster distribution in target neighborhoods</li>
                <li>On-site activation and signage coordination</li>
                <li>Ongoing stakeholder communication and reporting</li>
              </ul>
            </div>
            <div className="landing-tier">
              <div className="landing-tier-label">Tier 3</div>
              <h3>Full Boat</h3>
              <p className="landing-tier-tagline">All Channels + Community Engagement. Our most comprehensive, hands-on approach.</p>
              <ul>
                <li>Everything in Tier 2</li>
                <li>Direct grassroots neighborhood engagement and canvassing</li>
                <li>Model unit staging — design, procurement, delivery, and photography</li>
                <li>Optional 50% furniture donation perk through affiliated nonprofit</li>
                <li>Application support: follow-up, re-review, document assistance</li>
                <li>Full applicant pool analysis and eligibility reporting</li>
              </ul>
            </div>
          </div>

          <h3 className="landing-addons-title">Add-On Services</h3>
          <div className="landing-addons">
            <div className="landing-addon">
              <h4>Application Support</h4>
              <p>Per-applicant review, follow-up by phone, email, and text, and document coordination. Proven to recover 20%+ of initially rejected applicants.</p>
            </div>
            <div className="landing-addon">
              <h4>Model Unit Staging</h4>
              <p>Full design, procurement, delivery, and staging of a tour-ready model unit. Includes professional photography for all marketing materials.</p>
            </div>
            <div className="landing-addon">
              <h4>Applicant Pool Reporting</h4>
              <p>Deep-dive eligibility analysis, qualification tier breakdowns, Section 8 tracking, and benchmark comparisons. Delivered to your stakeholder team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO BANNER */}
      <div className="landing-photo-banner">
        <img src={KeysPhoto} alt="Keys to a new home" className="landing-photo-banner-img landing-photo-banner-img--keys" />
        <img src={ColorfulHousing} alt="Affordable housing development" className="landing-photo-banner-img" />
        <img src={HoughAngle2} alt="9410 Hough Avenue" className="landing-photo-banner-img" />
      </div>

      {/* APPROACH */}
      <section className="landing-section landing-section--dark">
        <div className="landing-container">
          <p className="landing-section-eyebrow landing-section-eyebrow--light">Our Approach</p>
          <h2 className="landing-section-title landing-section-title--light">A Phased, Data-Driven Campaign</h2>
          <p className="landing-approach-intro">We structure every engagement in two phases to maximize lead volume at launch and convert qualified applicants as the campaign matures.</p>
          <div className="landing-phases">
            <div className="landing-phase">
              <div className="landing-phase-header">
                <span className="landing-phase-num">Phase 1</span>
                <h3>Ramp-Up &amp; Launch <span className="landing-phase-period">(Month 1)</span></h3>
                <p className="landing-phase-objective">Objective: Establish positioning, create visibility, generate strong lead flow.</p>
              </div>
              <ul>
                <li>Strategy session with property team</li>
                <li>Core collateral: flyer, one-pager, 5 social posts</li>
                <li>Photography session</li>
                <li>Launch paid and organic digital campaigns</li>
                <li>Community and employer outreach begins</li>
                <li>Flyer distribution in target neighborhoods</li>
                <li>On-site activation and signage</li>
                <li>Biweekly performance tracking delivered to client</li>
              </ul>
            </div>
            <div className="landing-phase">
              <div className="landing-phase-header">
                <span className="landing-phase-num">Phase 2</span>
                <h3>Follow-Through &amp; Re-Orientation <span className="landing-phase-period">(Months 2–3)</span></h3>
                <p className="landing-phase-objective">Objective: Convert leads, re-engage prospects, refine strategy based on data.</p>
              </div>
              <ul>
                <li>Prospect follow-up via phone, email, and text</li>
                <li>Retargeting and conversion-focused digital campaigns</li>
                <li>Messaging adjustments based on application trends</li>
                <li>Re-prioritization of highest-performing channels</li>
                <li>Targeted outreach to close remaining units</li>
                <li>"Limited Availability" positioning for final push</li>
                <li>Lead conversion and campaign optimization reporting</li>
                <li>Final lease-up performance summary delivered</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDY */}
      <section className="landing-section landing-section--light">
        <div className="landing-container">
          <p className="landing-section-eyebrow">Proven Results</p>
          <h2 className="landing-section-title">Case Study: 9410 Hough Avenue, Cleveland, OH</h2>
          <p className="landing-case-desc">116-unit mixed-income affordable housing development. Full Boat package — 6-month lease-up campaign, application support, and model unit staging.</p>

          <div className="landing-case-photos">
            <img src={HoughHero} alt="9410 Hough Avenue - street view" />
            <img src={HoughAngle2} alt="9410 Hough Avenue - parking lot view" />
            <img src={HoughAngle3} alt="9410 Hough Avenue - front view" />
          </div>

          <div className="landing-case-stats">
            <div className="landing-case-stat">
              <div className="landing-case-stat-num">400</div>
              <div className="landing-case-stat-lbl">Inquiries in First 48 Hours</div>
            </div>
            <div className="landing-case-stat">
              <div className="landing-case-stat-num">150</div>
              <div className="landing-case-stat-lbl">Applications Opened in First 48 Hours</div>
            </div>
            <div className="landing-case-stat">
              <div className="landing-case-stat-num">470+</div>
              <div className="landing-case-stat-lbl">Total Applications to Date</div>
            </div>
            <div className="landing-case-stat">
              <div className="landing-case-stat-num">&gt;20%</div>
              <div className="landing-case-stat-lbl">Reapplication Rate via Applicant Follow-Up</div>
            </div>
          </div>

          <div className="landing-case-body">
            <div className="landing-case-pool">
              <h3>Applicant Pool Performance <span>(March 2026)</span></h3>
              <ul>
                <li>224 total completed applications reviewed</li>
                <li>81 applicants met income eligibility criteria <strong>(36.2% qualification rate)</strong></li>
                <li>42 strong candidates qualify at 3x rent — nearly 2x industry average</li>
                <li>Only 5 applicants (2.2%) disqualified for exceeding income cap vs. 5–15% industry average</li>
                <li>25 applicants flagged for income verification; 8 estimated to qualify upon confirmation</li>
                <li>15 estimated Section 8/HCVP voucher holders in the pool</li>
              </ul>
            </div>
            <div className="landing-case-benchmark">
              <h3>DJC vs. Industry Benchmark</h3>
              <table className="landing-benchmark-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>DJC</th>
                    <th>Industry Avg</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Qualification Rate</td>
                    <td className="landing-benchmark-win">36.2%</td>
                    <td>~22.5%</td>
                  </tr>
                  <tr>
                    <td>Strong Candidate Rate</td>
                    <td className="landing-benchmark-win">18.8%</td>
                    <td>~10–12%</td>
                  </tr>
                  <tr>
                    <td>Over-Income Disqualifications</td>
                    <td className="landing-benchmark-win">2.2%</td>
                    <td>5–15%</td>
                  </tr>
                  <tr>
                    <td>Income Too Low</td>
                    <td className="landing-benchmark-win">57.6%</td>
                    <td>70–85%</td>
                  </tr>
                  <tr>
                    <td>Section 8 Representation</td>
                    <td>6.7%</td>
                    <td>Healthy range</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="landing-section landing-section--dark">
        <div className="landing-container">
          <p className="landing-section-eyebrow landing-section-eyebrow--light">Meet the Founder</p>
          <h2 className="landing-section-title landing-section-title--light">Dakotah Jennifer — Founder &amp; Project Lead</h2>
          <p className="landing-founder-intro">Most marketing agencies learn affordable housing from the outside. Dakotah learned it from the inside.</p>
          <p className="landing-founder-body">With over five years of experience embedded in the real estate development industry, Dakotah Jennifer brings a perspective that is genuinely rare in the marketing world: she understands not just how to generate leads, but why lease-up campaigns succeed or fail at a structural level. She has worked alongside developers, property managers, and community organizations — giving her fluency in the language, incentives, and pressure points that define the affordable housing development process.</p>
          <h3 className="landing-founder-why-title">What Makes Dakotah Uniquely Positioned for This Work</h3>
          <ul className="landing-check-list landing-check-list--pink landing-founder-list">
            <li>5+ years of hands-on experience in the real estate development industry — not as an observer, but as an active participant in the process from project launch through occupancy.</li>
            <li>Deep understanding of affordable housing regulatory structures, AMI thresholds, income eligibility mechanics, and Section 8/HCVP dynamics — the complexity other marketers try to work around, Dakotah works within.</li>
            <li>Community trust and grassroots outreach expertise, with a demonstrated ability to reach income-qualified residents in underserved neighborhoods through authentic, on-the-ground engagement.</li>
            <li>Data-fluent reporting and analysis capabilities, producing applicant pool breakdowns, qualification tier reports, and benchmark comparisons that give developers and investors the transparency they need.</li>
            <li>Creative marketing instincts paired with development-sector discipline — campaigns that are not only compelling but strategically aligned with project timelines, compliance requirements, and leasing goals.</li>
            <li>Founder-led accountability: Dakotah is not a sales contact handing off work to a junior team. She is the strategist, the project lead, and the person who picks up the phone.</li>
          </ul>
        </div>
      </section>

      {/* TEAM */}
      <section className="landing-section landing-section--light">
        <div className="landing-container">
          <p className="landing-section-eyebrow">The Team</p>
          <h2 className="landing-section-title">Built for This Work</h2>
          <p className="landing-team-intro">DJC is a small, specialized team — chosen for their expertise and their shared commitment to moving developments forward.</p>
          <div className="landing-team-grid">
            <div className="landing-team-card">
              <div className="landing-team-initials">DJ</div>
              <h3>Dakotah Jennifer</h3>
              <p className="landing-team-role">Founder &amp; Project Lead</p>
              <p>Campaign strategy, client relationship management, applicant pool analysis, reporting, and overall project oversight. The creative and operational engine behind every DJC engagement.</p>
            </div>
            <div className="landing-team-card">
              <div className="landing-team-initials">OB</div>
              <h3>Olivia Blumenshine</h3>
              <p className="landing-team-role">Digital Marketing &amp; Ads Coordinator</p>
              <p>Paid digital advertising across Facebook, Instagram, Google, and LinkedIn. Ad strategy, targeting, budget optimization, and campaign performance tracking.</p>
            </div>
            <div className="landing-team-card">
              <div className="landing-team-initials">JF</div>
              <h3>Jarea Fang</h3>
              <p className="landing-team-role">Marketing Coordinator</p>
              <p>Collateral creation, content development, social media management, listing coordination, and community outreach logistics.</p>
            </div>
            <div className="landing-team-card">
              <div className="landing-team-initials">BH</div>
              <h3>Brittni Hardie</h3>
              <p className="landing-team-role">Communications Manager</p>
              <p>Applicant communications, partner outreach, email campaigns, stakeholder updates, and on-the-ground community engagement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY DJC */}
      <section className="landing-section landing-section--dark">
        <div className="landing-container">
          <p className="landing-section-eyebrow landing-section-eyebrow--light">Why DJC</p>
          <h2 className="landing-section-title landing-section-title--light">What Sets Us Apart</h2>
          <div className="landing-why-grid">
            <div className="landing-why-card">
              <h3>Development Insider Knowledge</h3>
              <p>We don't just understand marketing — we understand how affordable housing deals work, what investors expect, and what property managers actually need from a marketing partner.</p>
            </div>
            <div className="landing-why-card">
              <h3>Income-Qualified Audience Focus</h3>
              <p>Every campaign is built to reach residents who actually qualify. We don't generate noise — we generate applicants who can sign leases.</p>
            </div>
            <div className="landing-why-card">
              <h3>Transparent, Data-Rich Reporting</h3>
              <p>Biweekly reports, applicant pool analytics, benchmark comparisons, and qualification tier breakdowns. You always know exactly where the campaign stands.</p>
            </div>
            <div className="landing-why-card">
              <h3>Active Applicant Support</h3>
              <p>We follow up. We re-review flagged applications. We help qualified residents complete the process — recovering leads that would otherwise be lost.</p>
            </div>
            <div className="landing-why-card">
              <h3>Multi-Channel Execution</h3>
              <p>Digital, traditional, grassroots, employer, and community channels — all coordinated by one team with one strategy.</p>
            </div>
            <div className="landing-why-card">
              <h3>Founder-Led Accountability</h3>
              <p>Dakotah is personally invested in every project. Small enough to care, experienced enough to deliver.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="landing-cta-section">
        <div className="landing-container landing-cta-inner">
          <h2>Ready to accelerate your path to full occupancy?</h2>
          <p>Let's talk about your property.</p>
          <div className="landing-cta-contacts">
            <a href="mailto:marketing@dakjencreative.com" className="landing-cta-link">marketing@dakjencreative.com</a>
            <a href="https://dakjencreative.com" target="_blank" rel="noopener noreferrer" className="landing-cta-link">dakjencreative.com</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <img src={DjCreativeLogo} alt="DakJen Creative" className="landing-footer-logo" />
        <p className="landing-footer-copy">© {new Date().getFullYear()} DakJen Creative LLC. All rights reserved.</p>
        <button className="landing-footer-login" onClick={() => navigate('/login')}>
          Staff Login
        </button>
      </footer>

    </div>
  );
}

export default IntroScreen;
