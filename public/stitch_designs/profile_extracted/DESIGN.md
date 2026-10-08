---
name: Warband Hearth
colors:
  surface: '#1e100a'
  surface-dim: '#1e100a'
  surface-bright: '#48352e'
  surface-container-lowest: '#180b06'
  surface-container-low: '#271812'
  surface-container: '#2c1c16'
  surface-container-high: '#37261f'
  surface-container-highest: '#43312a'
  on-surface: '#fadcd2'
  on-surface-variant: '#d3c4b7'
  inverse-surface: '#fadcd2'
  inverse-on-surface: '#3e2c25'
  outline: '#9c8e83'
  outline-variant: '#4f453c'
  surface-tint: '#edbe91'
  primary: '#f4c497'
  on-primary: '#462a09'
  primary-container: '#d6a97e'
  on-primary-container: '#5d3d1b'
  inverse-primary: '#7b5733'
  secondary: '#fdb78f'
  on-secondary: '#4f2508'
  secondary-container: '#6b3a1c'
  on-secondary-container: '#eaa67f'
  tertiary: '#ffbdb2'
  on-tertiary: '#690000'
  tertiary-container: '#ff9484'
  on-tertiary-container: '#8e0000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcbe'
  primary-fixed-dim: '#edbe91'
  on-primary-fixed: '#2c1600'
  on-primary-fixed-variant: '#60401e'
  secondary-fixed: '#ffdbc9'
  secondary-fixed-dim: '#fdb78f'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#6b3a1c'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#930000'
  background: '#1e100a'
  on-background: '#fadcd2'
  surface-variant: '#43312a'
typography:
  headline-xl:
    fontFamily: Anybody
    fontSize: 40px
    fontWeight: '900'
    lineHeight: 48px
    letterSpacing: 0.02em
  headline-xl-mobile:
    fontFamily: Anybody
    fontSize: 28px
    fontWeight: '900'
    lineHeight: 34px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Anybody
    fontSize: 32px
    fontWeight: '900'
    lineHeight: 38px
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Anybody
    fontSize: 24px
    fontWeight: '900'
    lineHeight: 30px
    letterSpacing: 0.01em
  headline-md:
    fontFamily: Anybody
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 30px
    letterSpacing: 0.01em
  headline-sm:
    fontFamily: Anybody
    fontSize: 18px
    fontWeight: '800'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-lg:
    fontFamily: Anybody
    fontSize: 14px
    fontWeight: '800'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Anybody
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system translates the heavy, tactile grandeur of classic mid-core fantasy strategy games into a modern, lightning-fast communications platform. It bridges the visceral delight of carved wooden planks, hammered bronze brackets, and battle banners with the responsive speed and clear typography required for high-frequency guild messaging, clan war coordination, and raid briefings.

The visual style is **Tactile / Skeuomorphic Modernism**. Rather than relying on flat digital abstractions or ephemeral glass surfaces, interfaces feel physical, grounded, and constructed from physical campaign gear: sturdy timber beams, parchment speech scrolls, and iron-studded frames. 

The emotional tone balances camaraderie, wartime urgency, and hearty tavern warmth. The interface feels like an illuminated war table map room lit by hearthfire:
- **Hefty & Clickable:** Components look physically punchy with deep lower-edge beveled drops, inset debossed text fields, and tactile push states that sink under finger presses.
- **Battlefield Legibility:** While framing and header chrome evoke hefty medieval masonry and woodwork, active messaging streams remain hyper-legible, avoiding heavy background noise within high-density reading areas.
- **Heraldic Motifs:** Shield emblems, crossed battle banners, speech bubbles with sword-tip tails, and metallic rivet studs anchor navigation and clan status indicators.

## Colors

The palette draws directly from campaign war tables, tanned leather map scrolls, dark ironwood beams, and blazing war banners.

- **Primary (`#D6A97E`) — Hearth Stone / Sandstone:** The core foundational tone used for container backgrounds, interactive card surfaces, message bubble backings, and structural tabs.
- **Secondary (`#895333`) — Carved Timber:** Structural containment color applied to headers, navigation sidebars, panel trims, and dimensional chassis edges.
- **Tertiary (`#D50000`) — War Red:** Reserved exclusively for high-urgency callouts, attack notifications, war declaration alerts, destructive actions, and unread notification pips.
- **Neutral (`#24150F`) — Darkest Hearth Charcoal:** The deepest foundation tone representing recessed bedrock, screen backdrops, and deep drop-shadow perimeters.

### Semantic & Accent Extensions
- **Surface Highlight Cream (`#F6E7D0`):** Used for elevated message parchment cards, active selected states, and crisp badge counters.
- **Deep Muted Ironwood (`#6E4A35`):** Serves as an intermediate trim and secondary text element on sand-toned surfaces.
- **Text & Ink (`#2B1A12`):** Rich espresso-tinted black for primary body copy on sand and cream surfaces, preserving maximum contrast without sterile pure blacks.
- **Torch White Highlight (`#FFF8EF`):** Specular rim lighting, top-edge button bevels, and crisp light pips.
- **Clan Gold (`#D4A72C`):** Clan leader insignias, trophy counts, league tiers, and gold resource callouts.
- **Troop Green (`#4E8B3A`):** Active clan member presence, online status pips, and confirmed raid check-ins.

## Typography

The type system blends arcade-fantasy impact with legible real-time communication:

- **Display & Headings (`Anybody`):** Rendered in ultra-heavy weights (800–900). For prominent titles, titles receive a dimensional game-style visual treatment: uppercase lettering, a 1px top stroke highlight (`#FFF8EF`), a crisp 2px dark drop shadow (`#24150F`), and an optional dark rim stroke.
- **Body & Chat Streams (`Plus Jakarta Sans`):** Selected for its friendly rounded terminals and open apertures that mirror the chunky playfulness of the headers while providing fast legibility in compact mobile chat views. Body copy avoids heavy faux-medieval decorative typefaces to keep long tactical messages and rapid clan chats fatigue-free.
- **Labels & Callouts (`Anybody` uppercase & `Plus Jakarta Sans` bold):** Used for tactical countdown timers, member roles (Leader, Elder, Member), attack buttons, and channel tags.

## Layout & Spacing

Layouts follow a structured multi-tier chassis system inspired by game-screen HUDs:

- **The Shell Canvas:** A deep `#24150F` dark ground. Desktop and tablet environments frame the viewport inside carved vertical timber struts (`#895333`), while mobile views use edge-to-edge content chambers.
- **Three-Tier Spatial Hierarchy:**
  1. *Guild Navigation Column:* Compact 72px rail (desktop) or sticky bottom timber dock (mobile) featuring round embossed crests.
  2. *Channel/Room Sidebar:* 280px fixed-width timber panel (`#6E4A35` to `#895333`) housing clan topics, war rooms, and voice chambers.
  3. *Main War Theatre (Chat stream & Stage):* Fluid pane flanked by top battle status headers and bottom debossed message entry trench.
- **Responsive Adaptations:**
  - **Desktop (1024px+):** Full 3-column command center with persistent war status panel on the right.
  - **Tablet (768px - 1023px):** Collapsible clan channel drawer; chat stream and active battlefield take center focus.
  - **Mobile (<768px):** Single-column stacked chamber. Channels swipe in via heavy parchment drawer; battle alerts lock to a compact sticky top bar.

## Elevation & Depth

Visual depth is achieved through physical beveling, inset trenches, and directional torchlight highlights rather than diffuse multi-color ambient glows.

- **Light Angle:** All lighting originates strictly from top-center (representing an overhead chandelier or raised war torch).
- **Physical Bevels (The "Chunky Game Slab" Rule):** 
  - Raised interactive components (buttons, badges, active tabs) feature a sharp 1px top highlight border (`rgba(255, 248, 239, 0.45)`) and a deep solid 3px to 5px bottom edge drop (`#24150F` or `#4A2A1A`) to simulate thickness.
  - Active/pressed states collapse this bottom thickness from 4px to 1px while shifting content 2px down along the Y-axis.
- **Recessed Containers (Trenches & Inputs):** 
  - Chat logs, input boxes, and list viewports are recessed into the timber framework using an inset shadow (`inset 0 3px 6px rgba(36, 21, 15, 0.6)`) and a subtle dark top inner lip.
- **Layer Stacking (Bottom to Top):**
  1. *Foundation Chassis:* Dark bedrock timber (`#24150F`).
  2. *Wall Framing:* Carved structural panels (`#895333`) with corner bronze rivets.
  3. *Scroll & Message Tiles:* Warm sandy tan surface plates (`#D6A97E`) and parchment items (`#F6E7D0`).
  4. *Overlays & War Modals:* Thick timber-framed dialogue boxes with backdrop scrim (`rgba(36, 21, 15, 0.8)`).

## Shapes

The shape vocabulary uses the `roundedness: 2` scale (0.5rem base, 1rem large, 1.5rem extra-large) augmented by physical gaming flourishes:

- **Shield and Banner Cutouts:** Profile badges, clan insignias, and notification ribbons utilize subtle angled corners or clipped chevron bases.
- **Chunky Tablets:** Interactive containers and message bubbles feature stout 8px (`0.5rem`) to 16px (`1rem`) border radii, steering clear of ultra-thin pills or pin-sharp brutalist squares.
- **Rivet Anchors:** Important modals, action headers, and timber dividers feature simulated 6px circular bronze studs positioned at structural corners.
- **Speech Bubble Pointers:** Sent and received message containers feature bold 8px directional wedges that tuck neatly against sender avatar shields.

## Components

### Buttons
- **Primary Battle CTA (Attack / War Declaration / Send):** Heavy `#D50000` vermilion core, 1px top highlight (`#FFF8EF`), 4px dark shadow rim (`#700000`), bold white uppercase `Anybody` label, 8px corner radius. On active press: transforms `translateY(3px)` with bottom rim reducing to 1px.
- **Secondary Guild Button (Inspect / Join / Settings):** Warm timber tone (`#895333`) or polished stone (`#D6A97E`) with `#2B1A12` debossed label, 3px solid underside shadow.
- **Icon / Emote Buttons:** Rounded square shields with inset icon graphics and raised bevel borders.

### Chat Message Bubbles
- **Clan Member (Incoming):** Warm sand tone (`#D6A97E`), solid 2px outline in `#895333`, dark brown ink (`#2B1A12`), left-aligned pointer tip. Includes member rank tag (e.g., "CO-LEADER" in `#D4A72C` pill).
- **Player (Outgoing):** Light parchment cream (`#F6E7D0`), solid 2px outline in `#895333`, right-aligned pointer tip, with subtle gold or warm sand drop bevel.
- **System / War Event Banner:** Centered full-width wooden plank container (`#6E4A35`) with bronze stud accents, gold text (`#D4A72C`), and shield insignia representing battle outcomes or troop donations.

### Input Fields
- **Message Field:** Sunken trench aesthetic. Background `#24150F` with `#D6A97E` inner borders, inset top shadow (`inset 0 3px 5px rgba(0,0,0,0.5)`), `#F6E7D0` text, and integrated right-side sword-hilt or red battle CTA send button.
- **Search & Filters:** Recessed timber pill with subtle parchment placeholder typography.

### Badges, Unread Pills & Status Markers
- **Unread Notification Pip:** Intense `#D50000` circle or rounded badge with white bold numeral, framed by a 1.5px `#FFF8EF` outline and heavy drop shadow.
- **Troop Presence (Online):** 10px `#4E8B3A` emerald pip with a bright lime specular core, enclosed in a 2px `#24150F` border.
- **League Rank / Clan Role:** Shield-shaped badge in `#D4A72C` with embossed heraldic iconography.

### Cards & War Boards
- **War Matchup Card:** Divided stone & wood split-card. Left side shows friendly clan crest with parchment stats; right side displays rival clan over a battle-red tint (`#5A1616`).
- **Troop Donation Drawer:** Horizontal slide-out panel finished like an open field chest, featuring slot cards for barbarians, archers, and siege engines with quantity badges.

### Lists & Channel Groups
- Channel categories use uppercase timber header strips punctuated by a mini crossed-swords or horn icon. Active channel item highlighted with an inset parchment background plate (`#D6A97E`) and dark espresso typography.