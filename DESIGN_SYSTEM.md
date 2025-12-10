# 🎨 LANDAHAN POS - VISUAL DESIGN GUIDE

## 📐 COMPONENT LIBRARY

---

## 1️⃣ BUTTONS

### Primary Button (Gradient)
```html
<button class="pos-payment-btn">
  <i class="fas fa-check"></i>
  Complete Transaction
</button>
```
**Styling:**
- Background: Linear gradient (#c7f52e → #38a169)
- Color: #1a202c (dark text on light background)
- Padding: 20px
- Border-radius: 16px
- Shadow: 0 4px 16px rgba(199, 245, 46, 0.3)
- Hover: Elevation with increased shadow

### Action Button
```html
<button class="pos-action-btn">
  <i class="fas fa-user-tie"></i>
  Select a Seller
</button>
```
**Styling:**
- Same as primary but smaller (16px padding)
- Shine effect animation on hover
- Smooth elevation

---

## 2️⃣ CARDS

### Transaction Card
```html
<section class="pos-card transaction-card">
  <div class="pos-card-header">
    <div class="card-icon">
      <i class="fas fa-credit-card"></i>
    </div>
    <h3>Transaction Details</h3>
  </div>
  <div class="pos-card-body">
    <!-- Card content -->
  </div>
</section>
```
**Styling:**
- Background: rgba(255, 255, 255, 0.9)
- Border: 2px solid rgba(199, 245, 46, 0.2)
- Border-radius: 24px
- Shadow: 0 8px 24px rgba(0, 0, 0, 0.08)
- Hover: translateY(-5px), enhanced shadow
- Right border accent: 4px solid gradient

### Metric Card
```html
<div class="metric-card">
  <i class="fas fa-box"></i>
  <div class="metric-info">
    <div class="metric-value">156</div>
    <div class="metric-label">Total Items</div>
  </div>
</div>
```
**Styling:**
- Background: rgba(255, 255, 255, 0.95)
- Border: 2px solid rgba(199, 245, 46, 0.2)
- Border-radius: 20px
- Icon background: Gradient (#c7f52e → #38a169)
- Icon color: white
- Hover: Elevation, border color change

---

## 3️⃣ INPUT FIELDS

### Standard Input
```html
<div class="input-group">
  <label for="quantity">
    <i class="fas fa-boxes"></i> Quantity:
  </label>
  <input type="number" id="quantity" class="pos-input" placeholder="0">
</div>
```
**Styling:**
- Background: #f7fafc (light gray)
- Border: 2px solid #e2e8f0
- Border-radius: 12px
- Padding: 16px 20px
- Font-size: 16px
- Focus: 
  - Border-color: #c7f52e
  - Box-shadow: 0 0 0 3px rgba(199, 245, 46, 0.1)

### Total Input (Read-only)
```html
<div class="input-group total-group">
  <label for="total">
    <i class="fas fa-calculator"></i> Total Cost:
  </label>
  <input type="text" id="total" class="pos-input total-input" readonly>
</div>
```
**Styling:**
- Background: Linear-gradient(rgba(199, 245, 46, 0.05), rgba(56, 161, 105, 0.05))
- Border-color: #c7f52e
- Font-size: 20px
- Font-weight: 700
- Color: #38a169

---

## 4️⃣ MODALS

### Modal Structure
```html
<div id="sellerModal" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h3><i class="fas fa-user-tie"></i> Select Seller</h3>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <!-- Modal content -->
    </div>
  </div>
</div>
```
**Styling:**
- Modal overlay: rgba(0, 0, 0, 0.5) with blur(12px)
- Modal content: Light background with green border
- Border: 2px solid rgba(199, 245, 46, 0.2)
- Border-radius: 24px
- Box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25)
- Animation: Scale from 0.95 to 1.0

### Modal Header
**Styling:**
- Background: Gradient (rgba(199, 245, 46, 0.08), rgba(56, 161, 105, 0.05))
- Border-bottom: 2px solid rgba(199, 245, 46, 0.15)
- Padding: 30px 35px
- Icon color: #38a169

### Modal Form Inputs
```html
<div class="modal-section">
  <div class="input-group">
    <label><i class="fas fa-user"></i> Seller Name</label>
    <input type="text" class="modal-input" placeholder="Enter name">
  </div>
</div>
```
**Styling:**
- Container background: rgba(199, 245, 46, 0.05)
- Container border: 2px solid rgba(199, 245, 46, 0.15)
- Input background: #ffffff
- Input border: 2px solid #e2e8f0
- Focus: Border #c7f52e, glow effect

---

## 5️⃣ TOGGLE SWITCH

### Husked/Unhusked Toggle
```html
<div class="product-toggle-container">
  <span class="toggle-label" id="unhuskedLabel">Unhusked</span>
  <label class="switch">
    <input type="checkbox" id="productTypeToggle">
    <span class="slider"></span>
  </label>
  <span class="toggle-label" id="huskedLabel">Husked</span>
</div>
```
**Styling:**
- Slider background (off): #cbd5e0 (gray)
- Slider background (on): #38a169 (green)
- Toggle size: 60px × 34px
- Transition: 0.4s smooth
- Thumb: white, rounded, smooth movement

---

## 6️⃣ HEADER

### Main Header
```html
<header class="glassmorphism">
  <div class="header-left">
    <div class="logo">
      <i class="fas fa-seedling"></i>
      <span>LANDAHAN</span>
    </div>
    <h1>Point of Sale</h1>
  </div>
  <div class="user-info">
    <div class="user-avatar">
      <i class="fas fa-user"></i>
    </div>
    <div class="user-details">
      <span class="greeting">Hello,</span>
      <span id="userName" class="user-name">User</span>
    </div>
    <button onclick="logout()" class="logout-btn">
      <i class="fas fa-sign-out-alt"></i>
      <span>Logout</span>
    </button>
  </div>
</header>
```
**Styling:**
- Background: rgba(255, 255, 255, 0.9) with blur
- Border: 1px solid rgba(199, 245, 46, 0.2)
- Border-radius: 16px
- Padding: 20px 30px
- Glassmorphism effect
- Logo icon color: #c7f52e

---

## 7️⃣ ANIMATIONS

### Pulse Animation (Decorative Dots)
```css
@keyframes pulse {
    0%, 100% {
        opacity: 0.6;
        transform: scale(1);
    }
    50% {
        opacity: 1;
        transform: scale(1.2);
    }
}
```
Used for: Decorative elements, status indicators

### Button Ripple Effect
```css
.btn-ripple {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
}
```
Used on: Primary buttons during hover

### Elevation Hover
```css
.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}
```
Used on: Cards, buttons, interactive elements

---

## 8️⃣ COLOR USAGE GUIDE

```
🟢 PRIMARY (#c7f52e) - Use for:
   • Primary buttons
   • Active states
   • Important highlights
   • Icons in headers

🟢 PRIMARY-DARK (#38a169) - Use for:
   • Hover states
   • Secondary buttons
   • Text links
   • Dark accents

⚫ TEXT-DARK (#1a202c) - Use for:
   • Body text
   • Button text (on light backgrounds)
   • Headings
   • Form labels

⚫ TEXT-LIGHT (#718096) - Use for:
   • Secondary text
   • Placeholders
   • Subtle information
   • Helper text

⚪ WHITE (#ffffff) - Use for:
   • Card backgrounds
   • Input backgrounds
   • Clean spaces

⚪ LIGHT-GRAY (#f7fafc) - Use for:
   • Alternate backgrounds
   • Input backgrounds
   • Subtle backgrounds
```

---

## 9️⃣ SPACING SYSTEM

```
xs:  0.25rem (4px)   - Minimal gaps
sm:  0.5rem  (8px)   - Small gaps
md:  1rem    (16px)  - Standard gaps
lg:  1.5rem  (24px)  - Large spaces
xl:  2rem    (32px)  - Extra large gaps
```

Used consistently across all components for harmony.

---

## 🔟 SHADOW SYSTEM

```
Shadow-SM:  0 1px 3px rgba(0, 0, 0, 0.1)
            → Subtle, close elevation

Shadow-MD:  0 4px 12px rgba(0, 0, 0, 0.15)
            → Medium elevation

Shadow-LG:  0 10px 30px rgba(0, 0, 0, 0.2)
            → Prominent elevation
```

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (1024px+)
- Full width layout
- Sidebar navigation
- 2-column grids

### Tablet (768px - 1023px)
- Balanced layout
- Adjusted spacing
- Single column grids (optional)

### Mobile (320px - 767px)
- Single column
- Bottom navigation
- Optimized touch targets
- Reduced padding

---

## 🎯 BEST PRACTICES

1. **Consistency**: Use the same button style throughout
2. **Feedback**: Always show hover/focus states
3. **Spacing**: Keep consistent margins and padding
4. **Color**: Use the defined palette
5. **Animations**: Keep transitions smooth (0.3s)
6. **Typography**: Maintain size hierarchy
7. **Accessibility**: Ensure good contrast
8. **Performance**: Use GPU-accelerated properties

---

## 📋 COMPONENT CHECKLIST

When creating new components, ensure:

- ✅ Uses defined color variables
- ✅ Proper border-radius (12px, 16px, or 20px)
- ✅ Appropriate shadow depth
- ✅ Smooth transitions (0.3s)
- ✅ Clear hover/focus states
- ✅ Responsive on mobile
- ✅ Good color contrast
- ✅ Consistent spacing

---

## 🚀 QUICK REFERENCE

**Primary Button:**
```html
<button class="pos-payment-btn">Action</button>
```

**Card:**
```html
<div class="pos-card">
  <div class="pos-card-header">Title</div>
  <div class="pos-card-body">Content</div>
</div>
```

**Input:**
```html
<input type="text" class="pos-input" placeholder="...">
```

**Modal:**
```html
<div class="modal" id="myModal">
  <div class="modal-content">Content</div>
</div>
```

---

**Design System v1.0 - LANDAHAN POS 🎉**
