/**
 * FORNAP - Configuration Centralisée
 * Toutes les configurations Firebase et constantes de l'application
 */

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyALz161yfiLaOeHU82DQNJV4PkzAXO1wzM",
    authDomain: "nap-7aa80.firebaseapp.com",
    projectId: "nap-7aa80",
    storageBucket: "nap-7aa80.firebasestorage.app",
    messagingSenderId: "434731738248",
    appId: "1:434731738248:web:481644f3a6e809c06d2b3d",
    measurementId: "G-3HVC6HNG02"
};

// Configuration des forfaits
const MEMBERSHIP_PLANS = {
    mensuel: {
        id: 'mensuel',
        name: 'Membre Mensuel',
        price: 12,
        period: '/mois',
        level: 'monthly',
        amount: 12,
        loyaltyEnabled: false,
        features: [
            'Accès au lieu en journée (9h-19h)',
            'Réductions boutique (-10%)',
            'Réservation espaces coworking',
            'Participation aux événements',
            'Accès WiFi haut débit',
            'Café/thé à volonté'
        ]
    },
    annuel: {
        id: 'annuel',
        name: 'Membre Annuel', 
        price: 12,
        period: '/an',
        level: 'yearly',
        amount: 12,
        loyaltyEnabled: true,
        features: [
            'Tout du membre mensuel',
            '⭐ Programme de fidélité exclusif',
            '⭐ Accès anticipés aux événements',
            '⭐ Réductions supplémentaires (-20%)',
            '⭐ Avantages VIP et cadeaux',
            '⭐ Invité gratuit aux événements'
        ]
    },
    honneur: {
        id: 'honneur',
        name: 'Membre d\'Honneur',
        price: 'special',
        period: '',
        level: 'honor',
        amount: 0,
        loyaltyEnabled: true,
        features: [
            'Tout du membre annuel',
            '👑 Accès illimité 24/7',
            '👑 Services premium exclusifs',
            '👑 Soutien financier du lieu',
            '👑 Reconnaissance publique',
            '👑 Accès aux décisions importantes'
        ]
    }
};

// Messages d'erreur Firebase
const ERROR_MESSAGES = {
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Un compte existe déjà avec cet email',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
    'auth/invalid-email': 'Adresse email invalide',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre internet'
};

// Configuration de l'application
const APP_CONFIG = {
    name: 'FORNAP',
    version: '1.0.0',
    baseUrl: window.location.origin,
    debug: true,
    
    // URLs des pages
    pages: {
        home: 'index.html',
        membership: 'membership.html',
        payment: 'payment.html',
        profileSetup: 'profile-setup.html',
        congratulations: 'congratulations.html',
        dashboard: 'pages/dashboard.html'
    },
    
    // Messages par défaut
    messages: {
        loading: 'Chargement en cours...',
        success: 'Opération réussie !',
        error: 'Une erreur est survenue',
        sessionExpired: 'Session expirée',
        accessDenied: 'Accès non autorisé'
    }
};

// Export des configurations
window.FornapConfig = {
    firebase: firebaseConfig,
    membershipPlans: MEMBERSHIP_PLANS,
    errorMessages: ERROR_MESSAGES,
    app: APP_CONFIG
};

console.log('✅ Configuration FORNAP chargée'); 