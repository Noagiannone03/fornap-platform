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
│   │   ├── journey-utils.js   # Journey/form mechanics (progress, navigation, validation)
│   │   ├── payment.js         # Payment page specific logic
│   │   └── app.js            # Legacy code (being migrated)
│   └── css/
│       ├── main.css          # Global styles + CSS variables
│       ├── components.css    # Reusable component styles
│       └── payment.css       # Payment page specific styles
├── pages/                    # Application pages (HTML structure only)
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
FornapAuth.getCurrentUser()               // Get current user (async)
```

### UI Components (`assets/js/components.js`)
```javascript
// Global factory: window.FornapComponents
FornapComponents.generateNavbar(activePage, basePath)  // Generate navigation
FornapComponents.generateFooter(basePath)              // Generate footer
FornapComponents.syncAuthState(isAuthenticated)        // Update UI state
FornapComponents.initNavbar(activePage, basePath, authCallbacks)  // Complete navbar setup
FornapComponents.initFooter(basePath)                  // Complete footer setup
FornapComponents.onAuthStateChanged(callback)          // Listen to auth changes
FornapComponents.updateAuthState(isAuthenticated)      // Update global auth state
```

### Utility Functions (`assets/js/utils.js`)
```javascript
// Global utilities: window.FornapUtils
FornapUtils.showMessage(type, message)    // Display success/error messages
FornapUtils.validateEmail(email)          // Email validation
FornapUtils.validatePassword(password)    // Password validation
FornapUtils.validatePhone(phone)          // Phone validation
```

### Journey Management (`assets/js/journey-utils.js`)
```javascript
// Form and navigation utilities
// Use for multi-step forms, progress tracking, validation flows
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

## Adding New Pages - Système LEGO 🧱

### Blocs Réutilisables Disponibles

**🎨 Composants UI (Lego visuels)**
- `FornapComponents.generateNavbar()` - Navigation complète avec auth
- `FornapComponents.generateFooter()` - Pied de page standard
- `FornapUtils.showMessage()` - Messages success/error standardisés

**🔧 Services (Lego fonctionnels)**
- `FornapAuth` - Authentification complète Firebase
- `FornapConfig` - Configuration centralisée
- `FornapUtils` - Validations et utilitaires

**📋 Formulaires (Lego interactifs)**
- `journey-utils.js` - Navigation multi-étapes, progress tracking

### Template pour Nouvelle Page

1. **Copier le template de base:**
```bash
cp pages/page-template.html pages/your-page.html
```

2. **Assembler les blocs CSS requis:**
```html
<!-- TOUJOURS inclure ces 2 fichiers de base -->
<link rel="stylesheet" href="../assets/css/main.css">
<link rel="stylesheet" href="../assets/css/components.css">
<!-- Ajouter CSS spécifique si nécessaire -->
<link rel="stylesheet" href="../assets/css/your-page.css">
```

3. **Assembler les blocs JS requis (ORDRE IMPORTANT):**
```html
<!-- BLOC 1: Configuration -->
<script src="../assets/js/config.js"></script>

<!-- BLOC 2: Utilitaires de base -->
<script src="../assets/js/utils.js"></script>

<!-- BLOC 3: Services d'authentification -->
<script src="../assets/js/auth-service.js"></script>

<!-- BLOC 4: Composants UI -->
<script src="../assets/js/components.js"></script>

<!-- BLOC 5: Utilitaires formulaires (si formulaire multi-étapes) -->
<script src="../assets/js/journey-utils.js"></script>

<!-- BLOC 6: Logique spécifique à votre page -->
<script src="../assets/js/your-page.js"></script>
```

4. **Pattern d'initialisation standard:**
```javascript
// Dans your-page.js
document.addEventListener('DOMContentLoaded', async () => {
    // ÉTAPE 1: Initialiser l'authentification
    await FornapAuth.init();
    
    // ÉTAPE 2: Injecter navbar et footer (composants Lego)
    document.getElementById('navbar-container').innerHTML = 
        FornapComponents.generateNavbar('your-page', '../');
    document.getElementById('footer-container').innerHTML = 
        FornapComponents.generateFooter('../');
    
    // ÉTAPE 3: Configurer la synchronisation d'état
    FornapComponents.onAuthStateChanged((isAuthenticated) => {
        // Logique selon état auth
    });
    
    // ÉTAPE 4: Votre logique spécifique
    initYourPageLogic();
});
```

### Patterns de Réutilisation Courants

**🔐 Page avec authentification requise:**
```javascript
FornapAuth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = '../login.html';
        return;
    }
    // Logique page protégée
});
```

**📝 Page avec formulaire:**
```javascript
// Utiliser les validations Lego
const isValidEmail = FornapUtils.validateEmail(email);
const isValidPhone = FornapUtils.validatePhone(phone);

// Afficher messages avec Lego UI  
FornapUtils.showMessage('success', 'Données sauvegardées !');
FornapUtils.showMessage('error', 'Erreur de validation');
```

**🎯 Page avec navigation dynamique:**
```javascript
// Navbar s'adapte automatiquement à la page active
FornapComponents.generateNavbar('current-page-name', '../');
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

## Code Conventions & Architecture LEGO

### Principes Fondamentaux
- **Modularité**: Chaque bloc LEGO a une responsabilité unique
- **Réutilisabilité**: Un bloc peut être utilisé sur plusieurs pages
- **Prédictibilité**: Même interface pour chaque type de bloc
- **Composition**: Assembler les blocs plutôt que recréer

### Conventions de Nommage
- **Language**: All code comments and documentation in French
- **JavaScript**: camelCase for variables/functions (`FornapAuth`, `generateNavbar`)  
- **CSS**: kebab-case for classes (`.fornap-navbar`, `.btn-primary`)
- **Global Objects**: All services exposed on `window` object with `Fornap` prefix
- **Console Logging**: Use emojis for easy debugging (✅ success, ❌ error, 📝 info)

### Architecture des Fichiers (LEGO System)
```
assets/js/
├── config.js          [LEGO CONFIG] Configuration centralisée
├── utils.js           [LEGO UTILS] Validations et utilitaires
├── auth-service.js    [LEGO AUTH] Service d'authentification
├── components.js      [LEGO UI] Composants navbar/footer
├── journey-utils.js   [LEGO FORMS] Gestion formulaires multi-étapes
└── [page-name].js     [LEGO PAGE] Logique spécifique à une page

assets/css/
├── main.css           [LEGO STYLES] Variables CSS et styles globaux
├── components.css     [LEGO UI] Styles des composants réutilisables  
└── [page-name].css    [LEGO PAGE] Styles spécifiques à une page
```

### Règles d'Architecture
- **NO ES6 modules**: Uses traditional script includes with global objects
- **NO inline code**: Separate HTML, CSS, and JavaScript into dedicated files
- **Page-specific files**: Each page should have its own JS and CSS files when needed
- **Reusable components**: Extract common mechanics into utility files
- **Clean HTML**: HTML files should contain only structure, no embedded styles or scripts
- **CSS**: Mobile-first responsive design with CSS Grid/Flexbox

### Pattern de Composition LEGO
```javascript
// ❌ MAUVAIS: Réécrire la navbar à chaque fois
function createCustomNavbar() {
    return '<nav>...</nav>'; // Code dupliqué
}

// ✅ BON: Réutiliser le bloc LEGO existant
const navbar = FornapComponents.generateNavbar('page-name', '../');
```

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