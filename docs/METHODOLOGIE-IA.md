# 🤖 Guide Méthodologique pour IA - Projet FORNAP

## 🎯 Comment j'ai Abordé ce Projet

Cette documentation explique ma **méthodologie de travail** pour qu'une autre IA puisse comprendre, reprendre et continuer le développement de manière cohérente.

---

## �� Phase 1 : ANALYSE INITIALE

### 🔍 Outils Utilisés
```javascript
// 1. Exploration du codebase
codebase_search("Comment fonctionne l'authentification dans fornap-platform?")
codebase_search("Où sont les problèmes de redirection?")

// 2. Lecture des fichiers clés
read_file("pages/membership.html")
read_file("pages/payment.html") 
read_file("pages/profile-setup.html")

// 3. Identification des patterns
grep_search("window.location.href")
grep_search("sessionStorage")
```

### 🧠 Questions Clés Posées
1. **Quel est le flow utilisateur actuel ?**
2. **Où sont les points de friction ?**
3. **Comment le code est-il organisé ?**
4. **Quels sont les problèmes récurrents ?**
5. **Que veut vraiment l'utilisateur ?**

### 📝 Résultats de l'Analyse
- ❌ Flow cassé : `membership` → `profile-setup` direct
- ❌ Code dupliqué dans chaque page (HTML/CSS/JS mélangés)
- ❌ Gestion d'erreurs incohérente
- ❌ Design de `profile-setup` inadéquat
- ❌ Aucune vérification de données de paiement

---

## 📌 Phase 2 : PLANIFICATION STRUCTURÉE

### 🎯 Création de TODO List
```javascript
// J'ai utilisé todo_write pour organiser le travail
todo_write({
    todos: [
        {id: "fix-auth-flow", content: "Corriger le flow d'authentification", status: "in_progress"},
        {id: "reorganize-code", content: "Réorganiser en modules", status: "pending"},
        {id: "fix-design", content: "Redesigner profile-setup", status: "pending"}
    ]
})
```

### 🏗️ Architecture Cible Définie
```
Modules à Créer :
├── config.js       → Configuration centralisée
├── auth-service.js → Service d'authentification
├── utils.js        → Utilitaires communs
├── components.css  → Styles réutilisables
└── page-template   → Template pour nouvelles pages
```

---

## 🤖 Guide pour une IA qui Reprend le Projet

### 🎯 Étapes Recommandées

#### 1. **COMPRÉHENSION** (30 min)
```javascript
// Lire TOUS les fichiers de documentation
read_file("../README-TECHNIQUE.md")
read_file("GUIDE-UTILISATION.md") 
read_file("METHODOLOGIE-IA.md")

// Comprendre les modules
read_file("../assets/js/config.js")
read_file("../assets/js/auth-service.js")
```

#### 2. **EXPLORATION** (15 min)
```javascript
// Vérifier la structure
list_dir("../assets/js")
list_dir("../assets/css")

// Comprendre le flow actuel
codebase_search("Comment fonctionne le nouveau flow d'authentification?")
```

### 🛠️ Outils à Utiliser en Priorité

```javascript
// Pour comprendre le code existant
codebase_search("description de ce que vous cherchez")

// Pour explorer la structure
list_dir("dossier")
file_search("nom-de-fichier")

// Pour lire le code
read_file("chemin/vers/fichier")

// Pour organiser le travail
todo_write({...})

// Pour faire des changements
edit_file() ou search_replace()
```

### ✅ DO (À Faire)
- **Analyser AVANT d'agir** - Toujours comprendre l'existant
- **Créer des TODO lists** - Organiser le travail
- **Modules réutilisables** - Éviter la duplication
- **Documentation continue** - Expliquer chaque choix
- **Tests réguliers** - Valider chaque étape

### ❌ DON'T (À Éviter)
- **Refaire de zéro** - Construire sur l'existant
- **Code monolithique** - Toujours modulariser
- **Pas de documentation** - Expliquer pour les autres
- **Changements sans tests** - Valider avant de valider

