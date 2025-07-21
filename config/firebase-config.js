/* ========================================
   FORNAP - Configuration Firebase
   ======================================== */

// Configuration Firebase avec les vraies clés du projet
export const firebaseConfig = {
    apiKey: "AIzaSyALz161yfiLaOeHU82DQNJV4PkzAXO1wzM",
    authDomain: "nap-7aa80.firebaseapp.com",
    projectId: "nap-7aa80",
    storageBucket: "nap-7aa80.firebasestorage.app",
    messagingSenderId: "434731738248",
    appId: "1:434731738248:web:481644f3a6e809c06d2b3d",
    measurementId: "G-3HVC6HNG02"
};

// Configuration des collections Firestore
export const COLLECTIONS = {
    USERS: 'users',
    SUBSCRIPTIONS: 'subscriptions',
    PAYMENTS: 'payments',
    LOYALTY: 'loyalty_points',
    EVENTS: 'events',
    RESERVATIONS: 'reservations'
};

// Configuration des forfaits FORNAP
export const MEMBERSHIP_PLANS = {
    basique: {
        id: 'basique',
        name: 'Basique',
        price: 29,
        currency: 'EUR',
        interval: 'month',
        features: [
            'Accès au lieu en journée',
            'WiFi haut débit',
            'Espaces communs',
            'Support communauté',
            'Événements publics'
        ],
        loyaltyMultiplier: 1,
        shopDiscount: 0
    },
    premium: {
        id: 'premium',
        name: 'Premium', 
        price: 59,
        currency: 'EUR',
        interval: 'month',
        features: [
            'Accès 24/7',
            'Espaces de travail privés',
            '-10% boutique',
            'Salles de réunion',
            'Priorité événements',
            'Stockage personnel'
        ],
        loyaltyMultiplier: 1.5,
        shopDiscount: 10
    },
    vip: {
        id: 'vip',
        name: 'VIP',
        price: 99,
        currency: 'EUR',
        interval: 'month',
        features: [
            'Tous les avantages Premium',
            'Bureau privé dédié',
            '-20% boutique',
            'Conciergerie',
            'Accès VIP événements',
            'Services premium',
            'Coaching personnel'
        ],
        loyaltyMultiplier: 2,
        shopDiscount: 20
    }
};

// Configuration du programme de fidélité
export const LOYALTY_CONFIG = {
    levels: {
        bronze: { name: 'Bronze', minPoints: 0, color: '#CD7F32' },
        silver: { name: 'Argent', minPoints: 500, color: '#C0C0C0' },
        gold: { name: 'Or', minPoints: 1500, color: '#FFD700' },
        platinum: { name: 'Platine', minPoints: 3000, color: '#E5E4E2' }
    },
    pointsPerEuro: 1, // 1 point par euro dépensé
    pointsPerVisit: 10, // 10 points par visite
    pointsPerEvent: 25 // 25 points par événement
};

// Messages d'erreur traduits
export const ERROR_MESSAGES = {
    'auth/user-not-found': 'Aucun utilisateur trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
    'auth/invalid-email': 'Adresse email invalide',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
    'auth/network-request-failed': 'Erreur de réseau. Vérifiez votre connexion',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/operation-not-allowed': 'Opération non autorisée',
    'permission-denied': 'Permissions insuffisantes',
    'unavailable': 'Service temporairement indisponible'
};

// Configuration de l'environnement
export const APP_CONFIG = {
    name: 'FORNAP',
    version: '1.0.0',
    environment: 'production', // 'development' | 'staging' | 'production'
    debug: false,
    supportEmail: 'support@fornap.fr',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 heures
}; 