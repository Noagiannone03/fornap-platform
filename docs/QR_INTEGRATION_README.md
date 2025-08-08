# 📱 Système QR Code FORNAP - Documentation

## 🎯 Vue d'ensemble

Ce système permet aux anciens membres de FORNAP de se reconnecter facilement en scannant leur QR code d'adhésion, évitant ainsi la création d'un nouveau compte et préservant leur historique.

## 🏗️ Architecture

### Nouveaux fichiers créés

```
assets/js/
├── qr-scanner-service.js    # Service de scan et traitement QR
└── qr-journey.js           # Logique du parcours utilisateur QR

assets/css/
└── qr-scanner.css          # Styles pour les interfaces QR

pages/payment.html          # Modifié avec nouvelles sections
```

## 🔄 Flux utilisateur

### 1. Point d'entrée
- Page d'accueil : bouton "J'ai déjà un QR code" mis en avant
- Bouton "J'ai déjà un compte" rendu plus discret

### 2. Scan QR Code
- Upload de photo par drag & drop ou sélection fichier
- Validation format image (JPG, PNG)
- Simulation de scan (à remplacer par vraie bibliothèque QR en production)

### 3. Traitement des données
- Extraction UID depuis QR code (format: "FORNAP-MEMBER: [uid]")
- Récupération données depuis collection `members`
- Vérification statut abonnement (actif/expiré)

### 4. Création compte
- Demande création mot de passe
- Création compte Firebase Auth
- Migration données vers collection `users`

### 5. Redirection
- **Membre actif** → Profile setup (compléter infos manquantes)
- **Membre expiré** → Sélection forfait (données pré-remplies)

## 🔧 Services techniques

### FornapQRService

```javascript
// Initialisation
await window.FornapQRService.init();

// Traitement image QR
const qrData = await FornapQRService.processQRImage(file);

// Extraction UID
const uid = FornapQRService.extractUID(qrData);

// Récupération données membre
const memberData = await FornapQRService.getMemberData(uid);

// Vérification expiration
const isActive = FornapQRService.checkMembershipActive(endDate);

// Migration complète
const result = await FornapQRService.processLegacyMember(qrData, password);
```

### Structure données migrées

```javascript
// Collection members (ancienne)
{
  uid: "04f18e92-28b4-49ca-8bc9-024e06453bf1",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "0123456789",
  birthDate: "01/02/1969",
  "end-member": Timestamp,
  "member-type": "4nap-festival",
  ticketType: "PASS 1 JOUR : 12/07 BASS MUSIC"
}

// Collection users (nouvelle)
{
  uid: "same_uid",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "0123456789",
  
  // Migration info
  migratedFrom: "members",
  migratedAt: Timestamp,
  originalCreatedAt: Timestamp,
  
  // Nouveau format
  profile: { ... },
  subscription: {
    status: "active" | "expired",
    plan: "4nap-festival",
    originalEndDate: Timestamp,
    needsRenewal: boolean
  },
  preferences: { ... },
  loyalty: { ... }
}
```

## 🎨 Interface utilisateur

### Nouvelles sections HTML

1. **qrScanSection** - Upload et scan QR code
2. **legacyPasswordSection** - Création mot de passe
3. **activeMemberSection** - Accueil membre actif  
4. **expiredMemberSection** - Renouvellement membre expiré

### Classes CSS importantes

```css
.qr-upload-zone          # Zone drag & drop
.member-info-card        # Carte infos membre
.status-badge.active     # Badge membre actif
.status-badge.expired    # Badge membre expiré
.secondary-actions       # Actions secondaires
```

## 🛠️ Configuration production

### 1. Remplacer simulation QR

Actuellement, le scan est simulé. Pour la production :

```javascript
// Dans qr-scanner-service.js, remplacer simulateQRScan() par :
import jsQR from 'jsqr';

async scanQRFromImage(imageDataURL) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.context.drawImage(img, 0, 0);
      
      const imageData = this.context.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        resolve(code.data);
      } else {
        reject(new Error('Aucun QR code détecté'));
      }
    };
    img.src = imageDataURL;
  });
}
```

### 2. Installation jsQR

```bash
npm install jsqr
# ou
<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>
```

### 3. Variables CSS personnalisables

```css
:root {
  --qr-upload-bg: #f8f9fa;
  --qr-upload-border: #dee2e6;
  --qr-success-color: #28a745;
  --qr-warning-color: #fd7e14;
}
```

## 🔒 Sécurité

### Validation côté client
- Format QR code FORNAP validé
- Taille fichier limitée (10MB max)
- Types fichiers autorisés (image/*)

### Validation côté serveur
- Règles Firestore pour collections `members` et `users`
- Validation email unique Firebase Auth
- Vérification existence membre avant migration

### Gestion erreurs
- Email déjà utilisé → Migration données uniquement
- QR code invalide → Message d'erreur explicite
- Membre introuvable → Message d'erreur approprié

## 📊 Métriques recommandées

```javascript
// Analytics à implémenter
track('qr_scan_started');
track('qr_scan_success', { memberType: data.memberType });
track('qr_scan_failed', { errorType: error.type });
track('legacy_member_migrated', { 
  isActive: result.isActive,
  memberType: result.memberData.memberType 
});
```

## 🧪 Tests suggérés

### Tests d'intégration
1. Upload image QR code valide
2. Scan et extraction UID
3. Récupération données membre existant
4. Migration membre actif
5. Migration membre expiré
6. Gestion erreurs (QR invalide, membre inexistant)

### Tests utilisateur
1. Parcours membre actif complet
2. Parcours membre expiré complet
3. Retour en arrière à chaque étape
4. Validation formulaires
5. Responsive design mobile

## 🚀 Déploiement

1. **Tester en mode démo** avec simulation QR
2. **Préparer données de test** dans collection `members`
3. **Configurer règles Firestore** pour nouvelles collections
4. **Intégrer vraie bibliothèque QR** pour production
5. **Mettre à jour documentation utilisateur**

## 📱 Utilisation

### Pour l'utilisateur final
1. Clic sur "J'ai déjà un QR code"
2. Upload photo du QR code
3. Création mot de passe si reconnu
4. Redirection selon statut abonnement

### Pour l'administrateur
- Les anciennes données restent dans `members`
- Nouvelles données dans `users` avec flag `migratedFrom`
- Possibilité de suivre les migrations via `migratedAt`

---

✅ **Système prêt pour tests et déploiement**