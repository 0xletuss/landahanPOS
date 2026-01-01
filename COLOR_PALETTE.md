# 🎨 LANDAHAN COLOR PALETTE - QUICK REFERENCE

## Primary Colors

### Orange Gradient (Main Action)
```
Primary Orange:  #F8A055
Primary Peach:   #F5C9A8

Usage: Buttons, Links, Active States, Key CTAs
Gradient: linear-gradient(135deg, #F8A055, #F5C9A8)
```
**Example:** "Add to Cart" button, Primary navigation indicator

---

## Background Colors

### Warm Tropical Palette
```
Cream:         #FAF7F4  (Primary background)
Light Beige:   #F9F5F1  (Secondary background)
Light Yellow:  #FFF8E1  (Accent background)
White:         #FFFFFF  (Cards & surfaces)

Gradient: linear-gradient(135deg, #FAF7F4, #F9F5F1, #FFF8E1)
```
**Usage:** Page backgrounds, empty spaces, breathing room

---

## Text Colors

### Typography Scale
```
Dark Text:      #2D2D2D  (Primary - High Contrast)
Gray Text:      #666666  (Secondary - Good Contrast)
Light Gray:     #999999  (Tertiary - Placeholder/Helper)
```
**Usage:** 
- Dark: Headings, main body text
- Gray: Secondary information, labels
- Light: Placeholders, disabled states

---

## Accent Colors (Coconut Theme)

### Earth Tones
```
Coconut Brown:   #8B6F47  (Secondary Actions, Structure)
Coconut Shell:   #6B5744  (Dark Accents, Hover States)

Usage: Secondary buttons, borders, decorative elements
```

### Natural Elements
```
Leaf Green:      #B8C5A0  (Success, Natural)
Tropical Green:  #9DB88F  (Decorative, Relaxing)
Map Green:       #A8D5A3  (Status, Growth)

Usage: Success badges, positive indicators, nature elements
```

### Decorative
```
Cream Drip:      #E8DFD6  (Smooth transitions)
Milk Drip:       #F0E9E1  (Soft effects)
Accent Yellow:   #E8D68A  (Highlights, Warnings)

Usage: Dividers, subtle separators, warning states
```

---

## Shadow System

### Depth Shadows
```
Soft Shadow:     rgba(0, 0, 0, 0.08)     (Cards at rest)
Medium Shadow:   rgba(0, 0, 0, 0.12)     (Hover states)
Large Shadow:    rgba(0, 0, 0, 0.15)     (Elevation)

CSS:
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);     /* soft */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);    /* medium */
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);   /* large */
```

### Orange Glow
```
Light Glow:      rgba(248, 160, 85, 0.1)  (Subtle)
Medium Glow:     rgba(248, 160, 85, 0.25) (Normal)
Strong Glow:     rgba(248, 160, 85, 0.4)  (Focus/Hover)

Usage: Focus rings on inputs, button hover states
```

---

## Component Usage Guide

### Buttons

**Primary Button** (Orange Gradient)
```html
<button class="btn btn-primary">Primary Action</button>

CSS:
background: linear-gradient(135deg, #F8A055, #F5C9A8);
color: white;
box-shadow: 0 4px 12px rgba(248, 160, 85, 0.25);
```

**Secondary Button** (Brown)
```html
<button class="btn btn-secondary">Secondary Action</button>

CSS:
background: #8B6F47;
color: white;
box-shadow: 0 4px 12px rgba(139, 111, 71, 0.2);
```

**Ghost Button** (Outline)
```html
<button class="btn btn-ghost">Ghost Button</button>

CSS:
background: transparent;
color: #F8A055;
border: 2px solid #F8A055;
```

---

### Badges & Status

**Success** (Green)
```html
<span class="badge badge-success">In Stock</span>

Background: rgba(168, 213, 163, 0.2)
Color: #A8D5A3
```

**Warning** (Yellow)
```html
<span class="badge badge-warning">Low Stock</span>

Background: rgba(232, 214, 138, 0.2)
Color: #E8D68A
```

**Error** (Red)
```html
<span class="badge badge-error">Out of Stock</span>

Background: rgba(225, 112, 85, 0.2)
Color: #E17055
```

---

### Cards

**Standard Card**
```html
<div class="card">Content here</div>

Background: #FFFFFF
Border: 1px solid #E5E5E5
Shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
Border-radius: 20px
```

**Premium Card** (With Peach Tint)
```html
<div class="card card-premium">Premium content</div>

Background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,201,168,0.05))
Border: 1.5px solid rgba(248, 160, 85, 0.15)
Shadow: 0 4px 12px rgba(0, 0, 0, 0.12)
```

---

### Input Fields

**Default State**
```css
border: 2px solid #E5E5E5;
background: #FFFFFF;
color: #2D2D2D;
```

**Focus State**
```css
border-color: #F8A055;
box-shadow: 0 0 0 3px rgba(248, 160, 85, 0.1);
outline: none;
```

**Placeholder Text**
```css
color: #999999;
```

---

### Navigation

**Active Navigation Item**
```css
color: #F8A055;
border-bottom: 2px solid #F8A055;
```

**Hover Navigation Item**
```css
color: #F8A055;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

**Bottom Navigation**
```css
background: rgba(45, 45, 45, 0.95);
border-top: 1px solid rgba(248, 160, 85, 0.15);

Active indicator: #F8A055
Inactive: #999999
Hover: #F8A055
```

---

## Gradient Examples

### Tropical Gradient (Backgrounds)
```css
background: linear-gradient(135deg, #FAF7F4 0%, #F9F5F1 50%, #FFF8E1 100%);
```

### Accent Gradient (Buttons)
```css
background: linear-gradient(135deg, #F8A055, #F5C9A8);
```

### Earth Gradient (Headers)
```css
background: linear-gradient(135deg, #8B6F47, #6B5744);
```

### Text Gradient (Headings)
```css
background: linear-gradient(135deg, #2D2D2D 0%, #F8A055 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

---

## Spacing Scale (For Layout)

```
xs: 0.25rem (4px)
sm: 0.5rem  (8px)
md: 1rem    (16px)
lg: 1.5rem  (24px)
xl: 2rem    (32px)
2xl: 3rem   (48px)
```

---

## Border Radius Scale

```
sm:   8px
md:   12px
lg:   16px
xl:   20px
full: 9999px (Circular)
```

---

## Typography

### Font Family
```
Primary: 'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif
Mono: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace
```

### Font Weights
```
Light:      300
Normal:     400
Medium:     500
Semibold:   600
Bold:       700
```

### Font Sizes
```
xs:  0.75rem   (12px)
sm:  0.875rem  (14px)
base: 1rem     (16px)
lg:  1.125rem  (18px)
xl:  1.5rem    (24px)
2xl: 2rem      (32px)
```

---

## Animation Timings

```
Fast:  0.15s cubic-bezier(0.4, 0, 0.2, 1)
Base:  0.3s  cubic-bezier(0.4, 0, 0.2, 1)
Slow:  0.5s  cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Quick Copy-Paste Code

### Orange Button with Hover
```html
<button class="btn btn-primary">Click Me</button>
```

### Status Badge
```html
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Inactive</span>
```

### Card Component
```html
<div class="card">
  <h3 class="text-primary">Title</h3>
  <p class="text-gray">Description</p>
</div>
```

### Input with Focus State
```html
<input type="text" placeholder="Enter text..." class="input">
```

---

## Design System Files Location

- **Color Variables**: `css/design-theme.css` (`:root`)
- **Utility Classes**: `css/design-theme.css`
- **Component Styles**: Individual CSS files (home.css, modal.css, etc.)
- **Base Styles**: `css/style.css`

---

## Browser Support

✅ Chrome/Edge (Latest)
✅ Firefox (Latest)
✅ Safari (Latest)
✅ Mobile Browsers

All CSS variables are supported in modern browsers. For older browser support, add fallback values.

---

**Last Updated:** 2026
**Version:** 1.0
**Theme:** Tropical Coconut 🥥
