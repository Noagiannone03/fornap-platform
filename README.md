# FORNAP - Plateforme Membre Complète

## 🎯 Vue d'ensemble

FORNAP est une plateforme web complète pour la gestion d'un lieu culturel innovant combinant :
- **Site vitrine** avec design moderne et épuré
- **Gestion d'événements et festivals** avec redirection billetterie externe
- **Boutique en ligne intégrée** avec système de remises membres
- **Réservation d'espaces coworking** avec carte interactive
- **Système d'adhésion membres** obligatoire pour accéder au lieu
- **Panel membre avec programme de fidélité** inspiré des meilleurs systèmes

## 🎨 Design System

### Palette de couleurs
- **Noir principal** : `#000000` - Navigation, boutons, éléments principaux
- **Blanc principal** : `#FFFFFF` - Arrière-plans, textes sur noir
- **Gris très clair** : `#F8F9FA` - Arrière-plans secondaires
- **Gris clair** : `#E9ECEF` - Bordures, séparateurs
- **Gris moyen** : `#6C757D` - Textes secondaires

### Principes de design
- **Design carré** : Aucun border-radius, éléments géométriques nets
- **Minimalisme impactant** : Espacement généreux, typographie claire
- **Contraste fort** : Noir sur blanc pour une lisibilité maximale
- **Cohérence** : Composants réutilisables, navigation uniforme

## 🏗️ Architecture

### Structure des fichiers
```
fornap-officel/
├── index.html              # Page d'accueil
├── membership.html          # Sélection des forfaits
├── payment.html            # Processus de paiement
├── congratulations.html    # Confirmation d'adhésion
├── profile-setup.html      # Finalisation du profil
├── pages/
│   └── dashboard.html      # Tableau de bord membre
├── assets/
│   ├── css/
│   │   └── main.css        # Design system complet
│   └── images/
│       └── logo.png        # Logo FORNAP
└── config/
    └── firebase-config.js  # Configuration Firebase
```

### Technologies
- **Frontend** : HTML5, CSS3, JavaScript Vanilla
- **Backend** : Firebase (Auth, Firestore, Hosting)
- **Design** : CSS Grid, Flexbox, Variables CSS
- **Responsive** : Mobile-first, Progressive Enhancement

## 💳 Flux d'adhésion complet

### 1. Sélection du forfait (`membership.html`)
- **Mensuel** (12€/mois) : Accès de base sans fidélité
- **Annuel** (12€/an) : Accès + programme fidélité
- **Membre d'Honneur** : Accès VIP + soutien financier

**Fonctionnalités :**
- Sélection immédiate sans panier
- FAQ dépliante avec questions/réponses
- Comparatif détaillé des avantages
- Redirection directe vers le paiement

### 2. Processus de paiement (`payment.html`)
- **Étape 1** : Création de compte ou connexion
- **Étape 2** : Saisie des informations de paiement
- **Étape 3** : Confirmation et traitement

**Fonctionnalités :**
- Interface moderne et sécurisée
- Support carte bancaire et PayPal
- Validation en temps réel
- Calcul automatique des taxes

### 3. Félicitations (`congratulations.html`)
- Confirmation visuelle avec animation
- Récapitulatif de l'adhésion
- Détails du paiement
- Prochaines étapes

### 4. Finalisation du profil (`profile-setup.html`)
- **Étape 1** : Informations personnelles (nom, prénom, date de naissance, etc.)
- **Étape 2** : Préférences (centres d'intérêt, style de travail)
- **Étape 3** : Communication (notifications, fréquence)

### 5. Dashboard membre (`pages/dashboard.html`)
- Informations du profil
- Statut de l'adhésion
- Programme de fidélité (si éligible)
- Statistiques d'utilisation
- Actions rapides

## ⭐ Programme de fidélité

### Paliers et récompenses
- **Bronze** (0-249 pts) : Remises 10%, accès événements
- **Argent** (250-499 pts) : Remises 15%, accès VIP, 1 invité/mois
- **Or** (500-999 pts) : Remises 20%, événements exclusifs, 2 invités/mois
- **Diamant** (1000+ pts) : Remises 25%, accès VIP total, invités illimités

### Comment gagner des points
- **Visite coworking** : +10 pts
- **Participation événement** : +25 pts
- **Achat boutique** (10€) : +5 pts
- **Parrainage réussi** : +100 pts

### Récompenses échangeables
- Café Premium (50 pts)
- Heure coworking gratuite (100 pts)
- Goodies FORNAP (150 pts)
- Soirée VIP (300 pts)
- Workshop privé (500 pts)

## 🔧 Structure de données Firebase

### Collection `members`
```javascript
{
  // Identifiants
  uid: "string",
  email: "string",
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Profil personnel
  profile: {
    firstName: "string",
    lastName: "string",
    phone: "string",
    birthDate: "YYYY-MM-DD",
    age: number,
    postalCode: "string",
    profession: "string",
    company: "string"
  },
  
  // Abonnement structuré
  subscription: {
    type: "monthly|yearly|honor",
    name: "string",
    amount: number,
    period: "string",
    loyaltyEnabled: boolean,
    startDate: timestamp,
    status: "active|inactive",
    features: ["array"]
  },
  
  // Programme fidélité
  loyalty: {
    points: number,
    tier: "bronze|silver|gold|diamond",
    totalEarned: number,
    totalSpent: number,
    transactions: []
  },
  
  // Préférences
  preferences: {
    interests: ["array"],
    workingStyle: "string",
    visitFrequency: "string",
    motivations: "string"
  },
  
  // Communication
  communication: {
    emailNotifications: {
      events: boolean,
      newsletter: boolean,
      offers: boolean,
      community: boolean
    },
    frequency: "realtime|daily|weekly|monthly",
    preferredChannels: {
      email: boolean,
      sms: boolean,
      app: boolean
    }
  },
  
  // Statistiques usage
  usage: {
    coworkingHours: number,
    eventsAttended: number,
    lastVisit: timestamp,
    totalVisits: number
  }
}
```

## 🎯 Fonctionnalités clés

### Navigation cohérente
- **Logo FORNAP** en image sur toutes les pages
- **Menu responsive** avec hamburger mobile
- **États d'authentification** (connecté/déconnecté)
- **Design carré** avec animations fluides

### Interface de fidélité
- **Barre de progression** vers le prochain palier
- **Modal détaillée** avec tous les paliers
- **Système d'échange** de points fonctionnel
- **Calculs automatiques** des niveaux

### Formulaires intelligents
- **Validation en temps réel** des saisies
- **Messages d'erreur** contextuels
- **Sauvegarde progressive** des données
- **Pré-remplissage** des champs connus

### Responsive design
- **Mobile-first** avec points de rupture optimisés
- **Navigation adaptative** selon la taille d'écran
- **Grilles flexibles** qui s'adaptent au contenu
- **Images et logos** optimisés pour tous les appareils

## 🚀 Déploiement

### Configuration Firebase
1. Créer un projet Firebase
2. Activer Authentication (Email/Password)
3. Configurer Firestore Database
4. Mettre à jour `firebaseConfig` dans les fichiers

### Hébergement
- Compatible avec Firebase Hosting
- Serveur statique (Nginx, Apache)
- CDN pour les assets
- HTTPS obligatoire pour l'authentification

## 📱 Responsive & Accessibilité

### Points de rupture
- **Mobile** : < 480px
- **Tablet** : 481px - 768px
- **Desktop** : > 768px

### Accessibilité
- Contrastes respectant WCAG 2.1
- Navigation clavier complète
- Attributs ARIA appropriés
- Images avec textes alternatifs

## 🔒 Sécurité

### Authentification
- Validation côté client et serveur
- Mots de passe sécurisés (min 6 caractères)
- Sessions Firebase sécurisées
- Déconnexion automatique

### Données
- Chiffrement des données sensibles
- Validation des entrées utilisateur
- Protection CSRF intégrée
- Règles Firestore sécurisées

## 🎨 Composants réutilisables

### CSS Components
- `.btn` avec toutes ses variantes
- `.card` avec header/content/footer
- `.form-input` avec validation
- `.navbar` responsive
- `.footer` complet
- `.modal` système

### JavaScript Modules
- `showMessage()` pour les notifications
- `updateProgressBar()` pour les étapes
- `showLoadingModal()` pour les chargements
- `validateForm()` pour les validations

---

## 📞 Support

Pour toute question technique ou assistance :
- **Email** : support@fornap.fr
- **Documentation** : Ce README et commentaires dans le code
- **Logs** : Console développeur avec messages détaillés

---

**Version actuelle** : 2.0  
**Dernière mise à jour** : Janvier 2024  
**Auteur** : Équipe développement FORNAP 