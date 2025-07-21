# 🛒 FORNAP Shop - Guide Complet

## Vue d'ensemble

Le shop FORNAP est une boutique e-commerce moderne créée avec **Snipcart**, une solution complète qui permet de transformer n'importe quel site web en boutique en ligne fonctionnelle sans backend complexe.

## ✨ Fonctionnalités

### 🎯 Design & UX
- **Design moderne** inspiré de Zalando
- **Responsive** sur tous les appareils  
- **Animations fluides** et interactions engageantes
- **DA cohérente** avec FORNAP (noir/blanc carré)

### 🛍️ E-commerce
- **Panier intelligent** avec Snipcart
- **Gestion des tailles** pour vêtements
- **Filtres par catégories** (Vêtements, Accessoires, Tech, Bureau)
- **Sliders horizontaux** pour chaque catégorie
- **Aperçu rapide** des produits
- **Badges** (Bestseller, Nouveau, Promo, etc.)

### 🔧 Technique
- **HTML/CSS/JS vanilla** - aucune dépendance complexe
- **Hébergement mutualisé compatible** 
- **Snipcart v3.7.1** - la dernière version stable
- **Optimisé pour les performances**
- **SEO-friendly**

---

## 🚀 Configuration Snipcart

### 1. Créer un compte Snipcart

1. Allez sur [snipcart.com](https://snipcart.com)
2. Créez un compte gratuit (pas de carte bancaire requise en mode test)
3. Récupérez votre **clé API publique** dans le dashboard

### 2. Configuration de la clé API

Dans le fichier `shop.html`, remplacez cette ligne :

```javascript
publicApiKey: "YOUR_SNIPCART_API_KEY",
```

Par votre vraie clé API :

```javascript
publicApiKey: "votre_cle_api_publique_ici",
```

### 3. Configuration des domaines

Dans le dashboard Snipcart :
1. Allez dans **Account** → **Domains & URLs**
2. Ajoutez votre domaine (ex: `fornap.com` ou `localhost` pour les tests)
3. Configurez l'URL de protocole selon vos besoins

---

## 📦 Gestion des Produits

### Structure d'un produit

Chaque produit utilise les attributs `data-item-*` de Snipcart :

```html
<button 
    class="btn btn-primary add-to-cart snipcart-add-item"
    data-item-id="sweat-fornap-premium"
    data-item-price="89.99"
    data-item-url="/pages/shop/shop.html"
    data-item-description="Sweat premium FORNAP en coton bio"
    data-item-image="https://example.com/image.jpg"
    data-item-name="Sweat FORNAP Premium"
    data-item-custom1-name="Taille"
    data-item-custom1-options="S|M|L|XL"
    data-item-custom1-value="M">
    Ajouter au panier
</button>
```

### Attributs importants

| Attribut | Description | Obligatoire |
|----------|-------------|-------------|
| `data-item-id` | Identifiant unique du produit | ✅ |
| `data-item-price` | Prix en euros (sans €) | ✅ |
| `data-item-name` | Nom du produit | ✅ |
| `data-item-url` | URL de la page produit | ✅ |
| `data-item-description` | Description courte | ⚪ |
| `data-item-image` | URL de l'image | ⚪ |
| `data-item-custom1-*` | Champs personnalisés (taille, couleur, etc.) | ⚪ |

### Ajouter un nouveau produit

1. **Dupliquez** une carte produit existante
2. **Modifiez** les informations :
   - Image (`src` et `alt`)
   - Nom du produit
   - Prix
   - Catégorie (`data-category`)
   - Attributs Snipcart
3. **Ajoutez** la carte dans la bonne catégorie

### Catégories disponibles

- `vetements` - Vêtements
- `accessoires` - Accessoires  
- `tech` - Technologie
- `bureau` - Bureau

---

## 🎨 Personnalisation du Design

### Badges produits

Ajoutez des badges pour mettre en valeur vos produits :

```html
<div class="product-badges">
    <span class="badge bestseller">Bestseller</span>
    <span class="badge new">Nouveau</span>
    <span class="badge sale">-25%</span>
</div>
```

**Types de badges disponibles :**
- `bestseller` - Jaune or
- `new` - Vert succès  
- `sale` - Rouge promo
- `limited` - Violet limité
- `exclusive` - Noir exclusif
- `popular` - Rouge populaire
- `luxury` - Bleu marine luxe

### Modifier les couleurs

Dans `shop-styles.css`, ajustez les variables :

```css
:root {
    --shop-primary: #000000;
    --shop-bg: #FFFFFF;
    --shop-accent: #6C757D;
    --shop-hover: #F8F9FA;
}
```

### Animations personnalisées

Tous les éléments ont des animations CSS, vous pouvez les modifier dans la section `/* ANIMATIONS */` du CSS.

---

## 💳 Paiements & Livraison

### Configuration des paiements

Snipcart supporte automatiquement :
- **Carte bancaire** (Visa, Mastercard, etc.)
- **PayPal** 
- **Apple Pay** (sur appareils compatibles)
- **Google Pay** (sur appareils compatibles)

### Configuration dans Snipcart Dashboard

1. **Payment Gateways** → Configurez Stripe ou PayPal
2. **Shipping** → Définissez vos zones et tarifs
3. **Taxes** → Configurez la TVA selon votre pays
4. **Notifications** → E-mails de confirmation

### Zones de livraison

Exemple de configuration :
- **France métropolitaine** : 5.99€
- **DOM-TOM** : 12.99€  
- **Europe** : 9.99€
- **Monde** : 19.99€

---

## 📊 Analytics & Suivi

### Google Analytics 4

Le shop intègre automatiquement GA4 si présent :

```javascript
// Dans shop-scripts.js
function trackEvent(action, category, label, value) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label, 
            value: value
        });
    }
}
```

### Événements trackés

- Ajout au panier
- Suppression du panier
- Ouverture/fermeture panier
- Filtrage par catégorie
- Aperçu rapide produit

### Snipcart Analytics

Le dashboard Snipcart fournit :
- **Ventes** en temps réel
- **Produits populaires**
- **Taux de conversion**
- **Panier abandonné**
- **Données géographiques**

---

## 🔧 Maintenance & Mise à jour

### Sauvegardes

Sauvegardez régulièrement :
- Les fichiers HTML/CSS/JS
- La configuration Snipcart
- Les images produits
- Les données analytics

### Mises à jour Snipcart

Le shop utilise la version 3.7.1 de Snipcart. Pour mettre à jour :

1. Changez la version dans `shop.html` :
```javascript
version: "3.7.1" // → nouvelle version
```

2. Mettez à jour les URLs CSS/JS :
```html
<link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.css" />
```

### Performance

- **Optimisez les images** (WebP, compression)
- **Utilisez un CDN** pour les assets
- **Minifiez** CSS/JS en production
- **Cache** les ressources statiques

---

## 🐛 Dépannage

### Problèmes courants

#### Le panier ne s'ouvre pas
1. Vérifiez la clé API Snipcart
2. Vérifiez que le domaine est autorisé
3. Ouvrez la console développeur pour voir les erreurs

#### Produits non ajoutés
1. Vérifiez les attributs `data-item-*` 
2. Assurez-vous que `data-item-id` est unique
3. Vérifiez le format du prix (sans symbole €)

#### Problèmes de design
1. Videz le cache du navigateur
2. Vérifiez que les CSS se chargent
3. Testez sur différents navigateurs

### Mode Debug

Activez le mode debug en console :

```javascript
window.SnipcartSettings.debug = true;
```

### Support

- [Documentation Snipcart](https://docs.snipcart.com/)
- [Communauté Snipcart](https://community.snipcart.com/)
- Support FORNAP : [support@fornap.com]

---

## 🚀 Déploiement

### Liste de vérification

Avant de mettre en ligne :

- [ ] **Clé API** Snipcart configurée
- [ ] **Domaine** ajouté dans Snipcart
- [ ] **Paiements** configurés (Stripe/PayPal)
- [ ] **Livraison** et tarifs définis
- [ ] **Taxes** configurées
- [ ] **E-mails** de notification testés
- [ ] **Analytics** configuré
- [ ] **Images** optimisées
- [ ] **Tests** sur mobile/desktop
- [ ] **Sauvegarde** complète

### Mode Production

1. Changez le mode dans Snipcart Dashboard : `Test` → `Live`
2. Remplacez la clé API de test par la clé de production
3. Testez une vraie commande
4. Surveillez les premières ventes

---

## 📈 Optimisations Avancées

### SEO

- **Balises meta** pour chaque produit
- **Données structurées** (JSON-LD)
- **URLs canoniques**
- **Sitemap** incluant les produits

### Performance

- **Lazy loading** des images
- **Preload** des ressources critiques
- **Service Worker** pour le cache
- **CDN** pour les assets

### Conversion

- **A/B testing** des boutons
- **Urgence** (stock limité)
- **Social proof** (avis clients)
- **Cross-selling** produits liés

---

*Guide créé pour FORNAP Shop v1.0 - Décembre 2024* 