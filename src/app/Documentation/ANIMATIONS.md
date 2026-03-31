# Animation System

This project uses simple, clean CSS animations for a polished user experience.

## Available Animation Classes

### Entrance Animations
- `animate-fade-in` - Simple fade in (300ms)
- `animate-fade-in-up` - Fade in with upward motion (400ms)
- `animate-fade-in-down` - Fade in with downward motion (300ms)
- `animate-scale-in` - Fade in with scale effect (200ms)
- `animate-slide-in-right` - Slide in from left (300ms)

### Continuous Animations
- `animate-float` - Gentle floating effect (3s loop)
- `animate-pulse-subtle` - Subtle pulse effect (2s loop)

### Interactive Effects
- `hover-lift` - Lift up on hover with shadow
- `hover-glow` - Blue glow effect on hover
- `press-effect` - Scale down slightly on click

### Timing Utilities
- `animation-delay-100` through `animation-delay-500` - Stagger animations
- `transition-smooth` - Smooth transitions for all properties

### Card Styling
- `shadow-card` - Subtle card shadow
- `shadow-card-hover` - Enhanced shadow on hover

## Usage Examples

```tsx
// Simple fade in
<div className="animate-fade-in">Content</div>

// Staggered entrance
<div className="animate-fade-in-up animation-delay-200">Item 1</div>
<div className="animate-fade-in-up animation-delay-300">Item 2</div>

// Interactive button
<button className="hover-lift press-effect">Click Me</button>

// Card with hover effect
<div className="shadow-card shadow-card-hover">Card content</div>
```

## Design Principles

1. **Subtle** - Animations are smooth and don't distract
2. **Fast** - Most animations complete in 200-400ms
3. **Purposeful** - Each animation has a clear UX benefit
4. **Consistent** - Same animation patterns throughout the app
