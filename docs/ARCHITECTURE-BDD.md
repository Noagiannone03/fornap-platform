# Documentation de l'Architecture Base de Données - FORNAP Platform

## Vue d'Ensemble

La plateforme FORNAP utilise **Firebase Firestore** comme base de données principale avec **Firebase Storage** pour les médias. L'architecture suit un modèle de collections NoSQL optimisé pour les performances et la scalabilité.

## Collections Principales

### 1. Collection `users` 
*Collection principale pour les utilisateurs de la plateforme*

```javascript
{
  id: "user_uid", // UID Firebase Auth
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+33123456789",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Informations de profil (ajoutées après inscription)
  city: "Paris",
  profession: "Développeur",
  motivation: "Améliorer mes compétences",
  discovery: "Réseaux sociaux",
  
  // Abonnement et membership
  subscription: {
    plan: "premium", // "basic" | "premium" | "pro"
    status: "active", // "active" | "inactive" | "cancelled"
    startDate: Timestamp,
    endDate: Timestamp,
    paymentMethod: "card"
  },
  
  // Préférences utilisateur
  preferences: {
    notifications: true,
    newsletter: false,
    interests: ["développement", "design"]
  },
  
  // Métadonnées d'activité
  lastLogin: Timestamp,
  loginCount: 12,
  isActive: true
}
```

### 2. Collection `members` (Legacy)
*Collection héritée - en cours de migration vers `users`*

```javascript
{
  id: "user_uid",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+33123456789",
  createdAt: Timestamp,
  // Structure similaire à users mais moins complète
}
```

### 3. Collection `admins`
*Administrateurs de la plateforme avec permissions*

```javascript
{
  id: "admin_uid", // UID Firebase Auth
  email: "admin@fornap.com",
  firstName: "Jane",
  lastName: "Admin",
  role: "super_admin", // "super_admin" | "admin" | "moderator"
  
  // Permissions spécifiques
  permissions: [
    "users.read", "users.write", "users.delete",
    "events.read", "events.write", "events.delete",
    "statistics.read", "admin.read"
  ],
  // ou ["*"] pour super_admin
  
  // Métadonnées
  createdAt: Timestamp,
  createdBy: "creator_uid",
  lastLogin: Timestamp,
  loginCount: 45,
  isActive: true
}
```

### 4. Collection `events`
*Événements et activités de l'espace de coworking*

```javascript
{
  id: "auto_generated",
  title: "Concert Jazz au FORNAP",
  description: "Une soirée musicale exceptionnelle...",
  category: "musique", // "musique" | "conference" | "atelier" | "networking" | "formation" | "expo" | "autre"
  
  // Planning
  date: "2024-03-15",
  startTime: "19:00",
  endTime: "22:00",
  
  // Lieu
  location: "Salle principale FORNAP",
  address: "123 Rue Example, Paris",
  
  // Participation
  attendees: 25, // nombre actuel de participants
  maxAttendees: 50,
  price: 15.00, // Prix en euros
  
  // Média
  imageUrl: "https://firebasestorage.../image.jpg", // URL Firebase Storage
  tags: ["jazz", "musique", "soirée"],
  
  // Statut et métadonnées
  status: "published", // "draft" | "published" | "cancelled" | "completed"
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "admin_uid"
}
```

### 5. Collection `event_registrations`
*Inscriptions aux événements*

```javascript
{
  id: "auto_generated",
  eventId: "event_id",
  userId: "user_uid",
  registeredAt: Timestamp,
  status: "confirmed", // "pending" | "confirmed" | "cancelled"
  paymentStatus: "paid", // "pending" | "paid" | "refunded"
  amount: 15.00
}
```

### 6. Collection `payments`
*Historique des paiements*

```javascript
{
  id: "auto_generated",
  userId: "user_uid",
  type: "subscription", // "subscription" | "event" | "service"
  amount: 99.00,
  currency: "EUR",
  status: "completed", // "pending" | "completed" | "failed" | "refunded"
  paymentMethod: "card",
  stripePaymentId: "pi_xxxxx", // ID Stripe
  createdAt: Timestamp,
  
  // Contexte du paiement
  relatedId: "subscription_id", // ID de l'abonnement ou événement
  description: "Abonnement Premium - Mars 2024"
}
```

### 7. Collection `subscriptions`
*Abonnements et memberships détaillés*

```javascript
{
  id: "user_uid", // Même ID que l'utilisateur
  userId: "user_uid",
  plan: "premium",
  status: "active",
  
  // Dates importantes
  startDate: Timestamp,
  endDate: Timestamp,
  nextBillingDate: Timestamp,
  
  // Paiement
  amount: 99.00,
  currency: "EUR",
  billingPeriod: "monthly", // "monthly" | "yearly"
  
  // Intégration Stripe
  stripeCustomerId: "cus_xxxxx",
  stripeSubscriptionId: "sub_xxxxx",
  
  // Historique
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastPaymentDate: Timestamp
}
```

### 8. Collection `loyalty_points`
*Système de points de fidélité*

```javascript
{
  id: "user_uid",
  userId: "user_uid",
  totalPoints: 450,
  availablePoints: 200,
  usedPoints: 250,
  
  // Historique des transactions
  transactions: [
    {
      type: "earned", // "earned" | "spent" | "expired"
      points: 50,
      reason: "Participation événement",
      date: Timestamp,
      relatedId: "event_id"
    }
  ],
  
  // Niveau de fidélité
  tier: "gold", // "bronze" | "silver" | "gold" | "platinum"
  nextTierAt: 500,
  
  updatedAt: Timestamp
}
```

## Architecture Firebase Storage

### Structure des dossiers

```
/events/
  ├── {timestamp}_{filename} # Images d'événements
  └── thumbnails/
      └── {timestamp}_{filename} # Vignettes auto-générées

/users/
  ├── profiles/
  │   └── {user_uid}_{timestamp}.jpg # Photos de profil
  └── documents/
      └── {user_uid}/ # Documents utilisateur

/admin/
  ├── exports/ # Fichiers d'export générés
  └── uploads/ # Médias uploadés par les admins
```

## Relations et Index

### Index Firestore Recommandés

```javascript
// Collection 'users'
users.createdAt.desc() // Liste chronologique
users.subscription.status.asc() // Filtrage par statut d'abonnement
users.isActive.asc() // Utilisateurs actifs

// Collection 'events' 
events.date.asc() // Événements par date
events.status.asc() // Événements par statut
events.category.asc() // Événements par catégorie
events.createdAt.desc() // Derniers événements créés

// Collection 'event_registrations'
event_registrations.eventId.asc() // Participants par événement
event_registrations.userId.asc() // Événements par utilisateur
event_registrations.registeredAt.desc() // Inscriptions récentes

// Collection 'payments'
payments.userId.asc() // Paiements par utilisateur
payments.createdAt.desc() // Paiements chronologiques
payments.status.asc() // Paiements par statut
```

### Règles de Sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Utilisateurs - lecture/écriture de son propre profil uniquement
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins - accès restreint aux admins authentifiés
    match /admins/{adminId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Événements - lecture publique, écriture admin
    match /events/{eventId} {
      allow read: if true; // Public
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Inscriptions événements - gestion utilisateur
    match /event_registrations/{registrationId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId ||
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }
  }
}
```

## Patterns de Requêtes Courantes

### 1. Chargement Utilisateurs avec Abonnements

```javascript
// Admin Panel - Module Utilisateurs
const usersSnapshot = await db.collection('users')
  .orderBy('createdAt', 'desc')
  .limit(50)
  .get();

// Enrichir avec les données d'abonnement
const users = await Promise.all(
  usersSnapshot.docs.map(async (doc) => {
    const userData = { id: doc.id, ...doc.data() };
    
    // Charger l'abonnement si disponible
    try {
      const subscriptionDoc = await db.collection('subscriptions').doc(doc.id).get();
      userData.subscription = subscriptionDoc.exists ? subscriptionDoc.data() : null;
    } catch (error) {
      userData.subscription = null;
    }
    
    return userData;
  })
);
```

### 2. Événements avec Participants

```javascript
// Dashboard Admin - Vue événement détaillée
const eventDoc = await db.collection('events').doc(eventId).get();
const eventData = { id: eventDoc.id, ...eventDoc.data() };

// Charger la liste des participants
const registrationsSnapshot = await db.collection('event_registrations')
  .where('eventId', '==', eventId)
  .where('status', '==', 'confirmed')
  .get();

eventData.participants = await Promise.all(
  registrationsSnapshot.docs.map(async (regDoc) => {
    const regData = regDoc.data();
    const userDoc = await db.collection('users').doc(regData.userId).get();
    return {
      registration: regData,
      user: userDoc.data()
    };
  })
);
```

### 3. Statistiques Agrégées

```javascript
// Dashboard - Calcul des métriques
const [usersSnapshot, eventsSnapshot, paymentsSnapshot] = await Promise.all([
  db.collection('users').get(),
  db.collection('events').where('status', '==', 'published').get(),
  db.collection('payments').where('status', '==', 'completed').get()
]);

const stats = {
  totalUsers: usersSnapshot.size,
  activeUsers: usersSnapshot.docs.filter(doc => 
    doc.data().subscription?.status === 'active'
  ).length,
  totalEvents: eventsSnapshot.size,
  totalRevenue: paymentsSnapshot.docs.reduce((sum, doc) => 
    sum + (doc.data().amount || 0), 0
  )
};
```

## Migration et Maintenance

### Migration `members` → `users`

```javascript
// Script de migration (admin-panel/setup-admin.js)
async function migrateMembersToUsers() {
  const membersSnapshot = await db.collection('members').get();
  
  for (const memberDoc of membersSnapshot.docs) {
    const memberData = memberDoc.data();
    
    // Vérifier si l'utilisateur existe déjà dans users
    const userExists = await db.collection('users').doc(memberDoc.id).get();
    
    if (!userExists.exists) {
      // Migrer avec structure enrichie
      const userData = {
        ...memberData,
        // Ajouter champs manquants avec valeurs par défaut
        subscription: memberData.subscription || { status: 'inactive' },
        preferences: memberData.preferences || { notifications: true, newsletter: false },
        isActive: memberData.isActive !== undefined ? memberData.isActive : true,
        migratedFrom: 'members',
        migratedAt: firebase.firestore.Timestamp.now()
      };
      
      await db.collection('users').doc(memberDoc.id).set(userData);
    }
  }
}
```

## Optimisations de Performance

### 1. Pagination Efficace

```javascript
// Pagination avec curseur pour grandes collections
let lastVisible = null;
const pageSize = 20;

async function loadUsersPage(isNextPage = false) {
  let query = db.collection('users')
    .orderBy('createdAt', 'desc')
    .limit(pageSize);
    
  if (isNextPage && lastVisible) {
    query = query.startAfter(lastVisible);
  }
  
  const snapshot = await query.get();
  lastVisible = snapshot.docs[snapshot.docs.length - 1];
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

### 2. Cache et Optimisation Temps Réel

```javascript
// Listeners temps réel avec cache local
const setupRealtimeListeners = () => {
  // Cache local des données fréquemment accessées
  const dataCache = new Map();
  
  // Listener pour les événements actifs uniquement
  db.collection('events')
    .where('status', '==', 'published')
    .where('date', '>=', new Date())
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const eventData = { id: change.doc.id, ...change.doc.data() };
        
        if (change.type === 'added' || change.type === 'modified') {
          dataCache.set(`event_${change.doc.id}`, eventData);
        } else if (change.type === 'removed') {
          dataCache.delete(`event_${change.doc.id}`);
        }
      });
    });
};
```

## Bonnes Pratiques

### 1. Gestion des Erreurs

```javascript
// Pattern de gestion d'erreur standardisé
async function safeFirestoreOperation(operation, fallbackValue = null) {
  try {
    return await operation();
  } catch (error) {
    console.error('❌ Erreur Firestore:', error);
    
    // Log pour monitoring
    if (window.analytics) {
      window.analytics.track('firestore_error', {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      });
    }
    
    return fallbackValue;
  }
}
```

### 2. Validation des Données

```javascript
// Validation avant écriture
const validateUserData = (userData) => {
  const required = ['email', 'firstName', 'lastName'];
  const missing = required.filter(field => !userData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Champs requis manquants: ${missing.join(', ')}`);
  }
  
  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error('Format email invalide');
  }
  
  return true;
};
```

### 3. Transactions pour Opérations Critiques

```javascript
// Inscription à un événement avec mise à jour atomique
const registerForEvent = async (userId, eventId) => {
  return await db.runTransaction(async (transaction) => {
    // Lire l'événement
    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await transaction.get(eventRef);
    
    if (!eventDoc.exists) {
      throw new Error('Événement non trouvé');
    }
    
    const eventData = eventDoc.data();
    
    // Vérifier la capacité
    if (eventData.attendees >= eventData.maxAttendees) {
      throw new Error('Événement complet');
    }
    
    // Créer l'inscription
    const registrationRef = db.collection('event_registrations').doc();
    transaction.set(registrationRef, {
      eventId,
      userId,
      registeredAt: firebase.firestore.Timestamp.now(),
      status: 'confirmed'
    });
    
    // Incrémenter le compteur de participants
    transaction.update(eventRef, {
      attendees: firebase.firestore.FieldValue.increment(1)
    });
    
    return registrationRef.id;
  });
};
```

---

*Documentation générée automatiquement - Dernière mise à jour: $(date)*