/* ========================================
   FORNAP - Application Principale
   Logique corrigée : choisir forfait = devenir membre
   ======================================== */

// Imports
import { firebaseConfig, MEMBERSHIP_PLANS, ERROR_MESSAGES, APP_CONFIG } from '../config/firebase-config.js';

// Variables globales
let currentUser = null;
let selectedPlan = null;
let isSubscriptionFlow = false;

// Initialisation Firebase (script compatibility)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ========================================
   INITIALISATION DE L'APPLICATION
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 FORNAP Application démarrée');
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupAuthStateListener();
    updateUIForCurrentState();
    console.log('✅ Application FORNAP initialisée');
}

/* ========================================
   GESTION DES ÉVÉNEMENTS
   ======================================== */

function setupEventListeners() {
    console.log('🎯 Configuration des événements...');

    // Navigation
    const loginBtn = document.getElementById('loginBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) loginBtn.addEventListener('click', showLoginSection);
    if (dashboardBtn) dashboardBtn.addEventListener('click', showDashboard);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Sélection des forfaits - LOGIQUE CORRIGÉE
    document.querySelectorAll('.select-plan').forEach(btn => {
        btn.addEventListener('click', handlePlanSelection);
    });

    // Bouton "Procéder au paiement" depuis la sélection de forfait
    const proceedBtn = document.getElementById('proceedToPayment');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', startMembershipFlow);
    }

    // Authentification pour membres existants
    const loginSubmit = document.getElementById('loginSubmit');
    if (loginSubmit) loginSubmit.addEventListener('click', handleMemberLogin);

    // Lien vers inscription depuis login
    const showRegisterLink = document.getElementById('showRegisterForm');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }

    // Lien vers login depuis register  
    const showLoginLink = document.getElementById('showLoginForm');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }

    console.log('✅ Événements configurés');
}

/* ========================================
   LOGIQUE D'ABONNEMENT CORRIGÉE
   ======================================== */

function handlePlanSelection(e) {
    const card = e.target.closest('.pricing-card');
    const planId = card.dataset.plan;
    const plan = MEMBERSHIP_PLANS[planId];

    if (!plan) {
        showMessage('Forfait non trouvé', 'error');
        return;
    }

    console.log('Forfait sélectionné:', plan.name);

    // Réinitialiser les sélections
    document.querySelectorAll('.pricing-card').forEach(c => {
        c.classList.remove('selected');
    });
    
    // Sélectionner la nouvelle carte
    card.classList.add('selected');
    
    // Stocker la sélection
    selectedPlan = plan;

    // Afficher les informations du forfait sélectionné
    updateSelectedPlanDisplay(plan);
    
    showMessage(`Forfait ${plan.name} sélectionné (${plan.price}€/mois)`, 'success');
}

function updateSelectedPlanDisplay(plan) {
    const planInfo = document.getElementById('selectedPlanInfo');
    const planName = document.getElementById('selectedPlanName');
    const planPrice = document.getElementById('selectedPlanPrice');
    
    if (planInfo && planName && planPrice) {
        planName.textContent = plan.name;
        planPrice.textContent = plan.price;
        planInfo.classList.remove('hidden');
    }
}

function startMembershipFlow() {
    if (!selectedPlan) {
        showMessage('Veuillez sélectionner un forfait', 'error');
        return;
    }

    console.log('🎯 Démarrage du processus d\'adhésion');
    isSubscriptionFlow = true;

    // Vérifier si l'utilisateur est déjà connecté
    if (currentUser) {
        // Utilisateur connecté -> aller directement au paiement
        showPaymentSection();
    } else {
        // Nouveau utilisateur -> créer compte + paiement
        showMembershipRegistration();
    }
}

function showMembershipRegistration() {
    hideAllSections();
    
    // Créer une section spéciale pour l'inscription d'adhésion
    const registrationHTML = `
        <section class="form-section">
            <div class="form-container">
                <h2 class="text-center mb-2">Devenir Membre FORNAP</h2>
                <div class="text-center mb-2">
                    <p><strong>Forfait sélectionné :</strong> ${selectedPlan.name}</p>
                    <p><strong>Prix :</strong> ${selectedPlan.price}€/mois</p>
                </div>
                
                <form id="membershipForm">
                    <div class="form-group">
                        <label for="memberEmail">Email</label>
                        <input type="email" id="memberEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="memberPassword">Mot de passe</label>
                        <input type="password" id="memberPassword" required>
                    </div>
                    <div class="form-group">
                        <label for="memberName">Nom complet</label>
                        <input type="text" id="memberName" required>
                    </div>
                    <div class="form-group">
                        <label for="memberPhone">Téléphone</label>
                        <input type="tel" id="memberPhone" required>
                    </div>
                    
                    <button type="button" id="processMembership" class="btn btn-primary w-full mb-1">
                        Continuer vers le paiement
                    </button>
                    
                    <p class="text-center">
                        Déjà membre ? 
                        <a href="#" id="existingMemberLogin" class="font-medium">Se connecter</a>
                    </p>
                </form>
            </div>
        </section>
    `;

    // Injecter le HTML
    const mainContent = document.querySelector('.main-content');
    const tempSection = document.createElement('div');
    tempSection.innerHTML = registrationHTML;
    mainContent.appendChild(tempSection.firstElementChild);

    // Ajouter les événements
    document.getElementById('processMembership').addEventListener('click', processMembershipRegistration);
    document.getElementById('existingMemberLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginSection();
    });

    // Faire défiler vers le formulaire
    tempSection.firstElementChild.scrollIntoView({ behavior: 'smooth' });
}

async function processMembershipRegistration() {
    const email = document.getElementById('memberEmail').value;
    const password = document.getElementById('memberPassword').value;
    const name = document.getElementById('memberName').value;
    const phone = document.getElementById('memberPhone').value;

    if (!email || !password || !name || !phone) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }

    console.log('🔐 Création du compte membre...');
    setLoading(true);

    try {
        // Créer le compte Firebase
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Mettre à jour le profil
        await user.updateProfile({ displayName: name });

        // Créer le document utilisateur avec le forfait sélectionné
        await createMemberDocument(user, name, phone);

        showMessage('Compte créé avec succès !', 'success');
        
        // Nettoyer le formulaire temporaire
        document.querySelector('.form-section').remove();
        
        // Passer au paiement
        setTimeout(() => showPaymentSection(), 1000);

    } catch (error) {
        console.error('❌ Erreur création compte:', error);
        showMessage(getErrorMessage(error.code), 'error');
    } finally {
        setLoading(false);
    }
}

async function createMemberDocument(user, name, phone) {
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        phone: phone,
        
        // Forfait sélectionné
        selectedPlan: selectedPlan.id,
        planPrice: selectedPlan.price,
        planName: selectedPlan.name,
        
        // Statut
        membershipStatus: 'pending_payment',
        accountStatus: 'active',
        
        // Fidélité
        loyaltyPoints: 0,
        loyaltyLevel: 'bronze',
        
        // Dates
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        
        // Profil
        profile: {
            name: name,
            phone: phone,
            address: '',
            setupCompleted: false
        }
    };

    return db.collection('users').doc(user.uid).set(userData);
}

/* ========================================
   AUTHENTIFICATION MEMBRES EXISTANTS
   ======================================== */

function showLoginSection() {
    hideAllSections();
    document.getElementById('authSection')?.classList.remove('hidden');
    document.getElementById('authSection')?.scrollIntoView({ behavior: 'smooth' });
}

function showLoginForm() {
    document.getElementById('registerForm')?.classList.add('hidden');
    document.getElementById('loginForm')?.classList.remove('hidden');
}

function showRegisterForm() {
    document.getElementById('loginForm')?.classList.add('hidden');
    document.getElementById('registerForm')?.classList.remove('hidden');
}

async function handleMemberLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }

    console.log('🔐 Connexion membre:', email);
    setLoading(true);

    try {
        await auth.signInWithEmailAndPassword(email, password);
        showMessage('Connexion réussie !', 'success');
        hideAllSections();
        
        setTimeout(() => {
            if (isSubscriptionFlow && selectedPlan) {
                // Si dans un flux d'abonnement, aller au paiement
                showPaymentSection();
            } else {
                // Sinon aller au dashboard
                showDashboard();
            }
        }, 1000);

    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        showMessage(getErrorMessage(error.code), 'error');
    } finally {
        setLoading(false);
    }
}

/* ========================================
   GESTION DES ÉTATS D'AUTHENTIFICATION
   ======================================== */

function setupAuthStateListener() {
    auth.onAuthStateChanged(function(user) {
        console.log('Changement état auth:', user ? user.email : 'déconnecté');
        currentUser = user;
        updateUIForAuthState(user);
        
        if (user) {
            loadUserData(user);
        }
    });
}

function updateUIForAuthState(user) {
    const loginBtn = document.getElementById('loginBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        loginBtn?.classList.add('hidden');
        dashboardBtn?.classList.remove('hidden');
        logoutBtn?.classList.remove('hidden');
        console.log('👤 Interface utilisateur connecté');
    } else {
        loginBtn?.classList.remove('hidden');
        dashboardBtn?.classList.add('hidden');
        logoutBtn?.classList.add('hidden');
        console.log('👤 Interface utilisateur déconnecté');
    }
}

async function loadUserData(user) {
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            // Mettre à jour la dernière connexion
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('📊 Données utilisateur chargées');
        }
    } catch (error) {
        console.error('❌ Erreur chargement données:', error);
    }
}

/* ========================================
   GESTION DES SECTIONS ET NAVIGATION
   ======================================== */

function hideAllSections() {
    const sections = [
        'authSection', 
        'paymentSection', 
        'accountSetupSection', 
        'dashboardSection'
    ];
    
    sections.forEach(sectionId => {
        document.getElementById(sectionId)?.classList.add('hidden');
    });
    
    // Nettoyer les sections temporaires
    document.querySelectorAll('.form-section').forEach(section => {
        if (!section.id) section.remove();
    });
    
    // Réinitialiser l'affichage des forfaits
    document.getElementById('selectedPlanInfo')?.classList.add('hidden');
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.classList.remove('selected');
    });
}

function updateUIForCurrentState() {
    // Mettre à jour l'interface selon l'état actuel
    if (!currentUser) {
        hideAllSections();
    }
}

/* ========================================
   UTILITAIRES
   ======================================== */

function setLoading(loading) {
    const forms = ['loginForm', 'registerForm', 'membershipForm'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            if (loading) {
                form.classList.add('loading');
            } else {
                form.classList.remove('loading');
            }
        }
    });
}

function showMessage(message, type = 'info') {
    console.log('💬 Message:', message, type);
    
    const container = document.getElementById('messageContainer') || document.body;
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    container.appendChild(messageElement);

    // Animation d'entrée
    setTimeout(() => messageElement.classList.add('show'), 100);

    // Suppression automatique
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => messageElement.remove(), 300);
    }, 4000);
}

function getErrorMessage(errorCode) {
    return ERROR_MESSAGES[errorCode] || 'Une erreur est survenue. Veuillez réessayer.';
}

async function handleLogout() {
    try {
        await auth.signOut();
        console.log('✅ Déconnexion réussie');
        showMessage('Déconnexion réussie', 'success');
        hideAllSections();
        isSubscriptionFlow = false;
        selectedPlan = null;
    } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
        showMessage('Erreur lors de la déconnexion', 'error');
    }
}

/* ========================================
   FONCTIONS GLOBALES POUR L'INTERFACE
   ======================================== */

// Fonction pour le scroll smooth
window.scrollToSection = function(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ 
        behavior: 'smooth' 
    });
};

// Export pour modules externes
window.FORNAP = {
    currentUser: () => currentUser,
    selectedPlan: () => selectedPlan,
    showMessage,
    setLoading,
    hideAllSections
};

console.log('🎯 FORNAP Application prête !'); 