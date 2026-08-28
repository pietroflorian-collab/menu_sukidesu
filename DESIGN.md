---
name: Umai Pulse
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#e3beba'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#aa8985'
  outline-variant: '#5b403e'
  surface-tint: '#ffb3ac'
  primary: '#ffb3ac'
  on-primary: '#680008'
  primary-container: '#b71f22'
  on-primary-container: '#ffccc7'
  inverse-primary: '#b81f22'
  secondary: '#ffb3b1'
  on-secondary: '#5f1319'
  secondary-container: '#802c2f'
  on-secondary-container: '#ff9e9c'
  tertiary: '#d1c4b9'
  on-tertiary: '#372f27'
  tertiary-container: '#665c53'
  on-tertiary-container: '#e3d5ca'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb3ac'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#93000f'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b1'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#7d2a2d'
  tertiary-fixed: '#eee0d5'
  tertiary-fixed-dim: '#d1c4b9'
  on-tertiary-fixed: '#211a14'
  on-tertiary-fixed-variant: '#4e453d'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
  sushi-white: '#FFFFFF'
  salmon-light: '#FFB2A6'
  wasabi-green: '#ACC677'
typography:
  headline-xl:
    fontFamily: Anybody
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Anybody
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Anybody
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  price-display:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 48px
  container-max-width: 1200px
---

## Brand & Style

The design system is built to evoke the vibrant energy of a modern Tokyo street market. It blends the warmth of traditional Japanese hospitality with a bold, contemporary "Pop-Art" aesthetic. The target audience is young, tech-savvy foodies looking for a fun, frictionless, and visually appetizing digital ordering experience.

The visual style is **High-Contrast / Bold** with elements of **Minimalism**. It uses heavy structural lines, high-impact typography, and a "Flat-Plus" approach where depth is created through vibrant color blocking rather than complex shadows. The brand personality is energetic, approachable, and playful, anchored by the presence of the sushi mascot to keep the experience friendly and human.

## Colors

The palette is a high-contrast interplay between tradition and modern energy.
- **Deep Red (#B71F22):** The primary driver, used for key actions and brand impact. It represents the "maguro" (tuna) and traditional lacquerware.
- **Sleek Black (#000000):** The foundation of the dark mode UI, providing a sophisticated, "midnight-diner" backdrop that makes food photography pop.
- **Soft Salmon (#D56D6D):** Used for secondary accents and lifestyle elements, softening the intensity of the deep red.
- **Warm Sand (#D5C8BD):** A neutral tone used for text on dark backgrounds or subtle dividers, inspired by light wood and tatami textures.

The design system defaults to **Dark Mode** to emphasize the vibrant colors of the sushi and the glowing red accents.

## Typography

Typography is designed to be expressive and functional. 
- **Anybody** is the headline workhorse, chosen for its variable weights and "billboard" presence. It should be used for menu categories and promotional banners.
- **Plus Jakarta Sans** provides a friendly, geometric balance for descriptions and long-form text, ensuring readability against dark backgrounds.
- **Space Grotesk** is used for technical data, such as prices, calorie counts, and button labels, providing a modern, technical edge to the "street" aesthetic.

For mobile, headlines scale down slightly but maintain their heavy weight to preserve the brand's energetic impact.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. Spacing follows an 8px base unit to ensure a tight, rhythmic alignment of menu items.

- **Menu Cards:** Should be arranged in a responsive masonry or tight grid layout (2 columns on mobile, 3-4 on desktop).
- **Safe Areas:** Generous side margins (20px on mobile) ensure the UI feels airy despite the heavy color palette.
- **Vertical Rhythm:** Use larger gaps (48px+) between menu categories (e.g., "Nigiri" vs "Special Rolls") to provide clear visual breaks.

## Elevation & Depth

Depth is primarily achieved through **Tonal Layers** and **Low-Contrast Outlines**.
- **Surfaces:** Use `#121212` (Off-black) for card backgrounds to distinguish them from the pure black `#000000` page background.
- **Borders:** Instead of heavy shadows, use 1px solid borders in `#B71F22` or `#D5C8BD` at low opacity (20%) to define element boundaries.
- **Interactive States:** When a card is hovered or pressed, it should lift slightly using a subtle "glow" effect (a soft, colored drop shadow matching the primary red) rather than a neutral gray shadow.

## Shapes

The shape language is **Rounded**, balancing the aggressive typography with a friendly, edible feel.
- Standard components (Buttons, Inputs) use a **0.5rem (8px)** radius.
- Large containers and Food Cards use a **1rem (16px)** radius to feel modern and premium.
- Category chips and price tags should be **Pill-shaped** to contrast against the more structural card layouts.

## Components

### Buttons
- **Primary:** Solid `#B71F22` with white text. Use `label-bold` typography.
- **Secondary:** Outlined with 2px `#D56D6D`.
- **Icon Buttons:** Circular with a subtle red tint background.

### Menu Cards
- Cards must feature high-quality, top-down or 45-degree food photography.
- The image should occupy the top 60% of the card, with a slight "zoom" transition on hover.
- Price tags are positioned in the top-right corner of the image area, styled as a pill with a black background and white `price-display` text.

### Category Navigation
- Use a horizontal scrolling list of chips at the top of the menu.
- Active states use the primary red background; inactive states use a dark-gray surface with sand-colored text.

### Mascot Integration
- The mascot should appear in "Empty States" (e.g., empty cart), loading screens, and occasionally peeking from the corner of promotional banners to maintain the "fun" brand personality.

### Input Fields
- Dark backgrounds with a 1px border that turns bright red when focused. Labels should be small and positioned above the field in `Space Grotesk`.