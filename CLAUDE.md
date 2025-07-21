# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Environment

This is a vanilla JavaScript web application (no build tools or frameworks). Development uses a local HTTP server:

```bash
# Start local development server
python -m http.server 8000
# Or
npx http-server
# Or use VS Code Live Server extension on index.html
```

Open `http://localhost:8000` in your browser.

## Architecture Overview

**FORNAP Platform** is a coworking space membership platform built with:
- **Frontend**: Vanilla JavaScript (ES5 classes), HTML5, CSS3
- **Backend**: Firebase (Authentication + Firestore)
- **Architecture**: Modular component-based design with global singletons

### Key Architectural Patterns

- **Singleton Pattern**: `FornapAuth` service is a global singleton (`window.FornapAuth`)
- **Factory Pattern**: `FornapComponents` generates reusable UI components
- **Observer Pattern**: Authentication state synchronization via callbacks
- **Module Pattern**: Configuration exposed as global `window.FornapConfig`

### Directory Structure

```
fornap-platform/
├── assets/
│   ├── js/
│   │   ├── config.js          # Firebase config + app constants
│   │   ├── auth-service.js    # Authentication singleton service
│   │   ├── components.js      # Reusable UI components (navbar/footer)
│   │   ├── utils.js           # Validation + utility functions
│   │   └── app.js            # Legacy code (being migrated)
│   └── css/
│       ├── main.css          # Page-specific styles + CSS variables
│       └── components.css    # Reusable component styles
├── pages/                    # Application pages
├── docs/                     # Comprehensive French documentation
└── index.html               # Landing page
```

## Core Modules (Global Singletons)

### Configuration (`assets/js/config.js`)
```javascript
// Access via window.FornapConfig
window.FornapConfig.firebase          // Firebase configuration
window.FornapConfig.membershipPlans   // Membership plan definitions
window.FornapConfig.errorMessages     // Localized error messages
window.FornapConfig.app               // App settings + page URLs
```

### Authentication Service (`assets/js/auth-service.js`)
```javascript
// Global singleton: window.FornapAuth
await FornapAuth.init()                    // Initialize Firebase
await FornapAuth.signIn(email, password)  // Sign in user
await FornapAuth.signUp(email, password)  // Create account
FornapAuth.onAuthStateChanged(callback)   // Listen for auth changes
```

### UI Components (`assets/js/components.js`)
```javascript
// Global factory: window.FornapComponents
FornapComponents.generateNavbar(activePage, basePath)  // Generate navigation
FornapComponents.generateFooter(basePath)              // Generate footer
FornapComponents.syncAuthState(isAuthenticated)        // Update UI state
```

## User Flow

1. **Landing** (`index.html`) → **Membership Selection** (`pages/membership.html`)
2. **Authentication & Payment** (`pages/payment.html`)
3. **Profile Setup** (`pages/profile-setup.html`) → **Congratulations** (`pages/congratulations.html`)
4. **Member Dashboard** (`pages/dashboard.html`)

## Firebase Integration

### Firestore Collections
- `users/` - User profiles and membership data
- `members/` - Legacy membership information (being migrated to `users/`)

### Authentication Flow
- Email/password authentication via Firebase Auth
- User profiles automatically created in Firestore on signup
- Session persistence managed by Firebase
- Real-time auth state synchronization across components

## CSS Architecture

Uses CSS custom properties (variables) design system:

```css
:root {
    --noir-principal: #000000;
    --blanc-principal: #FFFFFF;
    --gris-tres-clair: #F8F9FA;
    --succes: #28A745;
    --erreur: #DC3545;
}
```

**Always include both CSS files:**
```html
<link rel="stylesheet" href="../assets/css/main.css">
<link rel="stylesheet" href="../assets/css/components.css">
```

## Adding New Pages

Use the template system:
1. Copy `pages/page-template.html`
2. Include required modules in order:
```html
<script src="../assets/js/config.js"></script>
<script src="../assets/js/utils.js"></script>
<script src="../assets/js/auth-service.js"></script>
<script src="../assets/js/components.js"></script>
```
3. Initialize services:
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    await FornapAuth.init();
    // Your page logic here
});
```

## State Management

- **Session Storage**: Temporary data during payment flow (`selectedPlan`, `userFormData`)
- **Global Objects**: Configuration and services available on `window`
- **Firebase Auth**: Persistent user authentication state
- **Component Sync**: UI components automatically sync with auth state

## Error Handling

Centralized error messages in French via `FornapConfig.errorMessages`. Use utility functions:
```javascript
FornapUtils.showMessage('error', 'Your error message');
FornapUtils.showMessage('success', 'Success message');
```

## Code Conventions

- **Language**: All code comments and documentation in French
- **Naming**: camelCase for JavaScript, kebab-case for CSS classes
- **Global Objects**: All services exposed on `window` object with `Fornap` prefix
- **Console Logging**: Use emojis for easy debugging (✅ success, ❌ error, 📝 info)
- **No ES6 modules**: Uses traditional script includes with global objects
- **CSS**: Mobile-first responsive design with CSS Grid/Flexbox

## Testing Approach

Manual testing workflow:
1. Test all pages individually for responsive design
2. Test complete user flows (new user signup → profile setup → dashboard)
3. Test authentication states (logged in/out) across all pages
4. Verify error handling with invalid inputs
5. Test Firebase integration in browser dev tools

## Migration Notes

- Legacy `app.js` file contains old code being migrated to new modular structure
- Some pages may still use old patterns - should be updated to use new modules
- Collection `members/` being migrated to `users/` in Firestore
- All new code should follow the modular architecture patterns

## Documentation

Extensive French documentation in `docs/`:
- `README-TECHNIQUE.md` - Technical overview
- `ARCHITECTURE.md` - Detailed architecture guide  
- `GUIDE-UTILISATION.md` - Usage guide for modules
- `METHODOLOGIE-IA.md` - Methodology guide for AI development

Always consult these docs when making significant changes to understand the intended architectural patterns and user experience goals.