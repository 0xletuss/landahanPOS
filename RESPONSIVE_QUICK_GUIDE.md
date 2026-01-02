# 📱 Quick Responsive Design Reference

## Media Query Breakpoints

```css
/* Mobile (default & up to 768px) */
@media (max-width: 768px) { }

/* Tablet (769px to 1024px) */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop (1025px and up) */
@media (min-width: 1025px) { }

/* Extra Small (480px and below) */
@media (max-width: 480px) { }
```

---

## Device Size Guidelines

| Device Type | Width | Device Examples |
|---|---|---|
| **Extra Small** | ≤ 480px | iPhone SE, Galaxy S21 |
| **Small Mobile** | 481 - 600px | iPhone 12/13/14 |
| **Large Mobile** | 601 - 768px | iPhone Plus, Galaxy Note |
| **Tablet Portrait** | 769 - 900px | iPad, Samsung Tab |
| **Tablet Landscape** | 901 - 1024px | iPad Landscape |
| **Desktop** | ≥ 1025px | Laptops, Desktops |

---

## Responsive Units to Use

### ✅ **Preferred**
```css
/* Use relative units for responsiveness */
padding: 1rem;           /* Scales with base font size */
width: 100%;            /* Full available width */
margin: var(--space-md); /* CSS variables */
font-size: clamp(0.875rem, 2vw, 1rem); /* Fluid scaling */
```

### ❌ **Avoid**
```css
/* Fixed units don't scale */
padding: 20px;
width: 500px;
font-size: 14px;
```

---

## Common Responsive Patterns

### **Flex Layout**
```css
/* Mobile: Stack vertically */
.container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Tablet/Desktop: Side by side */
@media (min-width: 769px) {
    .container {
        flex-direction: row;
    }
}
```

### **Grid Layout**
```css
/* Mobile: Single column */
.grid {
    display: grid;
    grid-template-columns: 1fr;
}

/* Tablet: Two columns */
@media (min-width: 769px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop: Three+ columns */
@media (min-width: 1025px) {
    .grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
}
```

### **Responsive Typography**
```css
/* Scales between 12px and 24px based on viewport */
h1 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
}

/* Scales padding proportionally */
section {
    padding: clamp(1rem, 4vw, 2rem);
}
```

---

## Component Sizing Guidelines

### **Touch Targets** (Minimum)
```css
/* All interactive elements must be at least 44x44px */
button {
    padding: 12px 20px; /* Min ~44px height */
}

.icon-button {
    width: 44px;
    height: 44px;
}
```

### **Mobile Margins/Padding**
```css
/* Mobile: Reduced spacing */
.container {
    padding: 12px;
}

/* Tablet: Medium spacing */
@media (min-width: 769px) {
    .container {
        padding: 18px;
    }
}

/* Desktop: Full spacing */
@media (min-width: 1025px) {
    .container {
        padding: 30px;
    }
}
```

### **Font Sizes**
```css
/* Mobile: Smaller fonts */
body { font-size: 14px; }
h1 { font-size: 1.5rem; }

/* Tablet: Medium fonts */
@media (min-width: 769px) {
    body { font-size: 15px; }
    h1 { font-size: 2rem; }
}

/* Desktop: Full size */
@media (min-width: 1025px) {
    body { font-size: 16px; }
    h1 { font-size: 2.5rem; }
}
```

---

## Navigation Patterns Used

### **Mobile Bottom Navigation**
```css
.navbar {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding-bottom: 85px; /* Space for navbar */
}
```

### **Desktop Sidebar Navigation**
```css
.navbar {
    position: fixed;
    left: 0;
    top: 0;
    width: 70px;
    transition: width 0.3s ease;
}

.navbar:hover {
    width: 240px;
}

body {
    margin-left: 70px;
}
```

---

## Viewport Meta Tag

✅ **Already in use:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

This must be in the `<head>` of every HTML file for responsive design to work!

---

## Testing Commands

### **Chrome DevTools**
```
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select device or custom dimensions
4. Check each breakpoint
```

### **Test Breakpoints**
```
1. 320px - Extra small phone
2. 480px - Small phone
3. 768px - Large phone
4. 900px - Tablet
5. 1024px - Large tablet
6. 1920px - Desktop
```

---

## Files Affected

| File | Breakpoints Added |
|---|---|
| `index.html` | 769px, 480px |
| `css/home.css` | 769px, 480px |
| `css/inventory.css` | 769px, 480px |
| `css/seller.css` | 769px, 480px |
| `css/profit.css` | 769px, 480px |
| `css/navbar.css` | 769px, 480px |

---

## Common Issues & Fixes

### **Issue: Content overflows on mobile**
```css
/* Fix: Ensure width is 100%, not fixed */
.container {
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
}
```

### **Issue: Text too small on mobile**
```css
/* Fix: Use fluid font sizing */
h1 {
    font-size: clamp(1.25rem, 4vw, 2.5rem);
}
```

### **Issue: Buttons not clickable**
```css
/* Fix: Ensure 44x44px minimum */
button {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 20px;
}
```

### **Issue: Layout breaks on tablet**
```css
/* Fix: Add tablet breakpoint */
@media (min-width: 769px) and (max-width: 1024px) {
    /* Tablet-specific styles */
}
```

---

## Performance Tips

- ✅ Use CSS Grid/Flexbox (modern & efficient)
- ✅ Minimize repaints with `transform` instead of `left/top`
- ✅ Group media queries by breakpoint
- ✅ Avoid deep nesting in responsive code
- ✅ Test on real devices for actual performance

---

## Browser DevTools Shortcuts

| Action | Shortcut |
|---|---|
| Open DevTools | F12 / Ctrl+Shift+I |
| Toggle Device Mode | Ctrl+Shift+M |
| Inspect Element | Ctrl+Shift+C |
| Console | F12 → Console |
| Network Tab | F12 → Network |

---

## CSS Variables Used

```css
:root {
    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    
    /* Border Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    
    /* Colors */
    --color-primary: #F8A055;
    --color-text: #2D2D2D;
    --color-border: #E5E5E5;
}
```

---

## Useful Links

- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [CSS Tricks: A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [CSS Tricks: A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

---

## Quick Checklist When Adding New Features

- [ ] Mobile layout tested (≤768px)
- [ ] Tablet layout tested (769px-1024px)
- [ ] Desktop layout tested (≥1025px)
- [ ] Touch targets ≥44x44px
- [ ] Text readable on mobile (≥12px)
- [ ] Images scale properly
- [ ] Forms work on mobile
- [ ] No horizontal scroll
- [ ] Navigation accessible on all sizes
- [ ] Tested on real device if possible

---

**Last Updated**: January 2025
**Status**: ✅ All devices responsive
