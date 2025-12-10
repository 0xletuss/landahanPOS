# Quick Customization Guide 🎨

A quick reference for common styling adjustments in LANDAHAN POS.

## Color Quick Changes

### Change Primary Green Color
**File**: `css/home.css`, `css/style.css`, `css/modal.css`

Find and replace:
- `#c7f52e` → Your new primary color
- `#38a169` → Your new dark variant
- `#a8e526` → Your new light variant

**Affected Elements**:
- Buttons, borders, accents
- Gradient overlays
- Icon colors
- Focus states

---

## Animation Speed Adjustments

### Make Animations Faster
Replace all `0.3s` with `0.2s` and `0.5s` with `0.3s`

**Files to Update**:
- `css/home.css` (most animations)
- `css/modal.css` (modal animations)

**Example**:
```css
/* Slower (default) */
transition: all 0.3s ease;

/* Faster */
transition: all 0.15s ease;
```

### Disable Animations Entirely
Add to your custom CSS:
```css
* {
    animation: none !important;
    transition: none !important;
}
```

---

## Font Customization

### Change Primary Font
**File**: `css/home.css` (Line 11)

```css
/* Default */
font-family: 'Inter', sans-serif;

/* Alternative: System fonts (no download needed) */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Alternative: Google Font */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap');
font-family: 'Poppins', sans-serif;
```

### Change Heading Font Weight
Replace `font-weight: 700` with:
- `500` - Light
- `600` - Normal
- `700` - Bold (default)
- `800` - Extra Bold
- `900` - Black

---

## Spacing Adjustments

### Increase/Decrease Padding
**Common padding values**:
```css
padding: 20px;      /* Compact */
padding: 30px;      /* Default */
padding: 40px;      /* Spacious */
padding: 50px;      /* Extra spacious */
```

**Files to check**:
- `.pos-card-body`: padding: 35px
- `.main-content`: padding: 40px
- `.pos-card-header`: padding: 28px 30px

### Adjust Border Radius
```css
border-radius: 8px;     /* Sharp */
border-radius: 12px;    /* Default */
border-radius: 20px;    /* Rounded */
border-radius: 50%;     /* Circle */
```

---

## Shadow Depth Control

### Lighter Shadows (Subtle)
Replace `0 10px 30px` with `0 4px 12px`

### Darker Shadows (Bold)
Replace `0 10px 30px` with `0 20px 50px`

### No Shadow
Replace `box-shadow: 0 10px 30px rgba(...)` with `box-shadow: none`

---

## Button Styling Changes

### Make Buttons More Rounded
Find `.payment-btn`, `.action-btn`, `.seller-btn`

Change:
```css
/* Before */
border-radius: 12px;

/* After */
border-radius: 25px;  /* Pill shape */
```

### Increase Button Size
```css
/* Default */
padding: 14px 28px;
font-size: 15px;

/* Larger */
padding: 16px 32px;
font-size: 16px;
```

### Change Button Hover Effect
**From elevation hover:**
```css
.payment-btn:hover {
    transform: translateY(-3px);  /* Lift up */
}
```

**To scale hover:**
```css
.payment-btn:hover {
    transform: scale(1.05);  /* Grow slightly */
}
```

---

## Input Field Customization

### Change Input Border Color on Focus
**File**: `css/home.css` (Input focus section)

```css
/* Before (green) */
border-color: #c7f52e;

/* After (your color) */
border-color: #3b82f6;  /* Blue example */
```

### Add Background Color on Focus
```css
/* Currently: white background */
background: #ffffff;

/* Could be: light color */
background: #f0f9ff;
```

### Remove Glow Effect on Focus
Replace:
```css
box-shadow: 0 0 0 4px rgba(199, 245, 46, 0.15), inset 0 0 0 1px rgba(199, 245, 46, 0.1);
```

With:
```css
box-shadow: none;
```

---

## Table Customization

### Change Table Header Color
**File**: `css/home.css` (Table header section)

```css
/* Current: Green gradient */
background: linear-gradient(135deg, #c7f52e 0%, #38a169 100%);

/* Alternative: Blue gradient */
background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);

/* Alternative: Solid color */
background: #2d3748;
```

### Adjust Table Row Hover Effect
```css
/* Current: slight scale */
transform: scale(1.01);

/* Alternative: no transform */
transform: none;

/* Alternative: larger scale */
transform: scale(1.03);
```

---

## Message/Notification Customization

### Change Message Background Color
Success message (green):
```css
/* Current */
background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);

/* Alternative: Light green */
background: #e8f5e9;

/* Alternative: Blue */
background: #dbeafe;
```

### Adjust Message Animation Speed
```css
/* Current */
animation: slideInUp 0.4s ease-out;

/* Faster */
animation: slideInUp 0.2s ease-out;

/* Slower */
animation: slideInUp 0.6s ease-out;
```

---

## Toggle Switch Customization

### Change Toggle Width
```css
/* Current */
width: 70px;

/* Smaller */
width: 60px;

/* Larger */
width: 80px;
```

### Change Toggle Slider Color
```css
/* Current: gradient */
background: linear-gradient(90deg, #c7f52e, #38a169);

/* Alternative: solid green */
background: #10b981;

/* Alternative: solid blue */
background: #3b82f6;
```

---

## Icon Customization

### Change Icon Font
Currently uses Font Awesome icons. To change:

1. **Replace with Emoji**:
```html
<!-- Before -->
<i class="fas fa-box"></i>

<!-- After -->
📦
```

2. **Use different icon set**:
   - Material Icons
   - Bootstrap Icons
   - Heroicons

### Change Icon Size
```css
/* Current */
font-size: 24px;

/* Smaller */
font-size: 18px;

/* Larger */
font-size: 32px;
```

---

## Dark Mode (Optional Addition)

Add this CSS to enable dark mode:

```css
@media (prefers-color-scheme: dark) {
    body {
        background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    }
    
    .main-content {
        background: rgba(30, 41, 59, 0.95);
        color: #f1f5f9;
    }
    
    .pos-input {
        background: #2d3748;
        color: #f1f5f9;
        border-color: #4b5563;
    }
}
```

---

## Responsive Design Adjustments

### Change Mobile Breakpoint
**File**: `css/home.css` (Bottom of file)

```css
/* Current breakpoint: 768px */
@media (max-width: 768px) {
    /* Mobile styles */
}

/* New breakpoint: 1024px */
@media (max-width: 1024px) {
    /* Tablet styles */
}
```

### Adjust Mobile Padding
```css
@media (max-width: 768px) {
    /* Default: 15px */
    .container { padding: 20px; }
}
```

---

## Common Issues & Fixes

### Text Is Too Small
Add to body:
```css
font-size: 16px;  /* Instead of 15px */
```

### Buttons Overflow on Mobile
Reduce padding in mobile styles:
```css
@media (max-width: 768px) {
    .payment-btn {
        padding: 10px 16px;
        font-size: 13px;
    }
}
```

### Colors Look Washed Out
Increase opacity:
```css
/* Before: low opacity */
background: rgba(199, 245, 46, 0.08);

/* After: higher opacity */
background: rgba(199, 245, 46, 0.15);
```

### Animations Cause Lag
Disable on mobile:
```css
@media (max-width: 768px) {
    * {
        animation: none !important;
    }
}
```

---

## Advanced: CSS Variables (Future Implementation)

To make customization easier, add at top of `css/home.css`:

```css
:root {
    /* Colors */
    --primary: #c7f52e;
    --primary-dark: #38a169;
    --primary-light: #a8e526;
    --text-dark: #2d3748;
    --text-light: #718096;
    --bg-light: #f8fafb;
    
    /* Spacing */
    --spacing-xs: 8px;
    --spacing-sm: 12px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* Timing */
    --transition-fast: 0.2s;
    --transition-normal: 0.3s;
    --transition-slow: 0.5s;
    
    /* Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 20px;
}
```

Then use throughout:
```css
.button {
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    background: var(--primary);
    transition: all var(--transition-normal);
}
```

---

## Testing Your Changes

### In Browser DevTools:
1. Press F12 to open DevTools
2. Click Elements/Inspector tab
3. Find the element you want to modify
4. Edit CSS in real-time to test
5. Once happy, apply changes to file

### Preview Changes:
1. Save CSS file
2. Hard refresh browser (Ctrl+Shift+R)
3. Check both desktop and mobile views
4. Test all interactive states (hover, focus, active)

---

## Exporting for Print/PDF

If you need print styles, add:

```css
@media print {
    body {
        background: white;
    }
    .pos-card {
        page-break-inside: avoid;
        box-shadow: none;
        border: 1px solid #ddd;
    }
}
```

---

**Questions?** Check VISUAL_ENHANCEMENTS_COMPLETE.md for full documentation.

**Need help?** Review CSS comments in the files - each section is well-documented.

---

*Last Updated: Session Complete*
*Version: 1.0*
*Status: ✅ Ready to Use*
