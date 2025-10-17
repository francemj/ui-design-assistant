# UI Placement Assistant - Design Guidelines

## Design Approach

**System Selected:** Modern Productivity Tool Design (Linear/Vercel-inspired)

**Rationale:** This is a utility-focused analysis tool for designers and developers. It requires clarity, efficiency, and minimal visual distraction to let users focus on analyzing UI layouts. The interface should feel professional, fast, and trustworthy.

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Background Primary: 0 0% 100%
- Background Secondary: 240 5% 96%
- Border: 240 6% 90%
- Text Primary: 240 10% 4%
- Text Secondary: 240 5% 35%
- Accent: 221 83% 53% (blue for interactive elements)
- Success: 142 71% 45%
- Warning: 38 92% 50%

**Dark Mode:**
- Background Primary: 240 10% 4%
- Background Secondary: 240 6% 10%
- Border: 240 4% 16%
- Text Primary: 0 0% 98%
- Text Secondary: 240 5% 64%
- Accent: 221 83% 53%
- Success: 142 71% 45%
- Warning: 38 92% 50%

### B. Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) for UI elements and body text
- Monospace: 'JetBrains Mono' for technical content/code snippets

**Type Scale:**
- Heading Large: text-3xl font-semibold (30px)
- Heading Medium: text-xl font-semibold (20px)
- Body Large: text-base (16px)
- Body Regular: text-sm (14px)
- Caption: text-xs (12px)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Micro spacing (between related elements): p-2, gap-2
- Component padding: p-4, p-6
- Section spacing: p-8, py-12
- Page margins: p-16, p-24

**Container Strategy:**
- Main workspace: max-w-7xl mx-auto
- Content cards: max-w-4xl
- Form elements: max-w-2xl

---

## Component Library

### Navigation Header
- Height: h-16
- Background: Solid primary background with subtle border-b
- Logo: Left-aligned, text-lg font-semibold
- Simple, clean with no visual clutter

### Upload Zone
- Large, prominent dropzone: min-h-64 rounded-xl border-2 border-dashed
- Idle state: Subtle border color with upload icon and instructional text
- Drag-over state: Border accent color with background tint
- File preview: Thumbnail with filename and remove button

### Description Input
- Full-width textarea: min-h-32 rounded-lg
- Label above with clear hierarchy
- Character count indicator (text-xs text-secondary)
- Placeholder text: Actionable example ("e.g., Add a Save Draft button...")

### Analysis Results Display
- Two-column layout on desktop (grid-cols-1 lg:grid-cols-2)
- Left: Original + marked-up images in tabbed interface
- Right: Placement suggestions in card format

### Placement Cards
- White/dark cards with rounded-lg and subtle shadow
- Each card contains:
  - Bold region label (text-base font-medium)
  - Rationale text (text-sm text-secondary)
  - Visual indicator (colored dot or icon) for priority
- Spacing: gap-4 between cards

### Image Display
- Contained within rounded-lg border frames
- Max dimensions to prevent overflow
- Zoom/fullscreen capability indicator
- Side-by-side comparison view for original vs. marked-up

### Clarifying Questions Section
- Distinct visual treatment: bg-secondary rounded-lg p-6
- Icon indicator (question mark or info icon)
- Each question as a separate line item with bullet or numbering
- Call-to-action to refine the request

### Primary CTA Button
- Size: px-6 py-3 rounded-lg
- Accent color background with white text
- Solid, no gradients
- Clear hover state (slight brightness increase)
- Loading state: Spinner with "Analyzing..." text

### Status Indicators
- Processing: Animated spinner with "Analyzing your layout..."
- Success: Check icon with "Analysis complete"
- Error: Warning icon with clear error message
- Subtle, non-intrusive positioning

---

## Layout Structure

### Main Application Flow

**1. Upload State (Empty)**
- Centered vertical layout
- Large upload zone as focal point
- Description textarea below
- Primary CTA button at bottom
- Generous whitespace (py-12)

**2. Analysis State (Loading)**
- Keep upload context visible but reduced
- Prominent loading indicator in center
- Progress message or animation
- Maintain vertical rhythm

**3. Results State**
- Split-pane layout (images left, suggestions right)
- Sticky positioning for image reference while scrolling suggestions
- Clear hierarchy: Images → Placements → Questions
- Bottom action area for "Analyze Another" CTA

---

## Interactions & Microanimations

**Minimal Animation Philosophy:**
- Fade-in for results appearance (duration-200)
- Smooth height transitions for expanding sections
- Hover states: Subtle scale or brightness changes only
- No decorative animations or unnecessary motion
- Focus on instant feedback and responsiveness

---

## Accessibility

- High contrast ratios (4.5:1 minimum for text)
- Focus indicators on all interactive elements (ring-2 ring-accent)
- Clear labels for screen readers
- Keyboard navigation support
- Alt text for all images
- Loading states announced to screen readers

---

## Responsive Behavior

**Mobile (base - sm):**
- Single column stack layout
- Full-width upload zone (min-h-48)
- Results stack vertically
- Touch-optimized tap targets (min h-12)

**Tablet (md):**
- Maintain single column for clarity
- Increased padding and spacing
- Larger preview images

**Desktop (lg+):**
- Two-column results layout
- Sticky image reference panel
- Maximum container widths engaged
- Comfortable reading line lengths

---

## Visual Principles

1. **Clarity First:** Every element serves a purpose, no decorative clutter
2. **Consistent Spacing:** Maintain rhythm using the defined spacing primitives
3. **Subtle Depth:** Use borders and subtle shadows, not heavy elevation
4. **Purposeful Color:** Accent color only for primary actions and key information
5. **Readable Typography:** Generous line-height (1.6 for body text) and letter-spacing
6. **Professional Restraint:** Avoid flashy effects; prioritize function and speed perception