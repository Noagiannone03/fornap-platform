/**
 * FORNAP Journey Experience Pro - JavaScript Principal
 * Gestion du processus complet d'inscription et paiement
 */

console.log('🚀 FORNAP - Journey Experience Pro');

// Variables globales
let currentUser = null;
let selectedPlan = null;
let currentSection = 'welcome';
let currentSignupStep = 1;
let currentKnowStep = 1;
let userProfile = {};

// Plans disponibles (alignés avec membership.html)
const plans = {
    mensuel: {
        id: 'mensuel',
        name: 'Membre Mensuel',
        price: 12,
        period: '/mois',
        description: 'Parfait pour découvrir FORNAP',
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
        description: 'Le meilleur rapport qualité-prix',
        recommended: true,
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
        description: 'Soutenez le projet FORNAP',
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

// Initialisation GSAP
gsap.registerPlugin();

// Fonctions utilitaires
function showMessage(message, type = 'info') {
    const container = document.getElementById('messageContainer');
    if (!container) {
        const messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        document.body.appendChild(messageContainer);
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    document.getElementById('messageContainer').appendChild(messageElement);

    gsap.fromTo(messageElement, 
        { x: 400, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
    );
    
    setTimeout(() => {
        gsap.to(messageElement, {
            x: 400,
            opacity: 0,
            duration: 0.3,
            ease: "back.in(1.7)",
            onComplete: () => messageElement.remove()
        });
    }, 4000);
}

async function handleLogout() {
    try {
        await FornapAuth.signOut();
        showMessage('Déconnexion réussie', 'success');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
        showMessage('Erreur lors de la déconnexion', 'error');
    }
}

function showLoginModal() {
    showMessage('Connectez-vous d\'abord sur la page d\'accueil', 'info');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 2000);
}

// Navigation entre sections avec GSAP
function showSection(sectionId) {
    const currentActiveSection = document.querySelector('.journey-section.active');
    const targetSection = document.getElementById(sectionId);
    
    if (!targetSection) return;

    // Animation de sortie
    if (currentActiveSection) {
        gsap.to(currentActiveSection, {
            opacity: 0,
            y: -30,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                currentActiveSection.classList.remove('active');
                currentActiveSection.classList.add('hidden');
                
                // Animation d'entrée
                targetSection.classList.remove('hidden');
                targetSection.classList.add('active');
                
                gsap.fromTo(targetSection, 
                    { opacity: 0, y: 30 },
                    { 
                        opacity: 1, 
                        y: 0, 
                        duration: 0.5, 
                        ease: "power2.out",
                        onComplete: () => {
                            // Focus sur le premier input si présent
                            const firstInput = targetSection.querySelector('input');
                            if (firstInput) firstInput.focus();
                        }
                    }
                );
            }
        });
    } else {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
        gsap.fromTo(targetSection, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }

    currentSection = sectionId.replace('Section', '');
    updateProgress();
}

function updateProgress() {
    const stepMapping = {
        'welcome': 1,
        'signup': 2,
        'login': 2,
        'plan': 3,
        'payment': 4,
        'congratulations': 5,
        'gettingToKnow': 5,
        'final': 5
    };
    
    const currentStepNumber = stepMapping[currentSection] || 1;
    const progressWidth = ((currentStepNumber - 1) / 4) * 100;
    
    gsap.to('#progressFill', {
        width: `${progressWidth}%`,
        duration: 0.6,
        ease: "power2.out"
    });
    
    // Mettre à jour les indicateurs
    updateProgressIndicators(currentStepNumber);
}

// Fonction pour mettre à jour les indicateurs
function updateProgressIndicators(currentStepNumber) {
    for (let i = 1; i <= 5; i++) {
        const indicator = document.getElementById(`step${i}`);
        if (!indicator) continue;
        
        const circle = indicator.querySelector('.indicator-circle');
        
        indicator.classList.remove('active', 'completed');
        
        if (i < currentStepNumber) {
            indicator.classList.add('completed');
            gsap.to(circle, { scale: 1.1, duration: 0.3, ease: "back.out(1.7)" });
        } else if (i === currentStepNumber) {
            indicator.classList.add('active');
            gsap.to(circle, { scale: 1.2, duration: 0.3, ease: "back.out(1.7)" });
        } else {
            gsap.to(circle, { scale: 1, duration: 0.3, ease: "power2.out" });
        }
    }
}

// Fonction compatible avec qr-journey.js pour mettre à jour une étape spécifique
function updateProgressStep(stepNumber) {
    const progressWidth = ((stepNumber - 1) / 4) * 100;
    
    gsap.to('#progressFill', {
        width: `${progressWidth}%`,
        duration: 0.6,
        ease: "power2.out"
    });
    
    updateProgressIndicators(stepNumber);
}

// Fonctions de navigation
function startJourney() {
    showSection('signupSection');
}

function showLoginForm() {
    showSection('loginSection');
}

function backToWelcome() {
    showSection('welcomeSection');
}

// Fonctions d'inscription avec animations GSAP
function nextSignupStep(stepNumber) {
    // Validation
    if (currentSignupStep === 1) {
        const firstName = document.getElementById('signupFirstName').value.trim();
        if (!firstName) {
            showMessage('Veuillez saisir votre prénom', 'error');
            return;
        }
        userProfile.firstName = firstName;
    }
    
    if (currentSignupStep === 2) {
        const lastName = document.getElementById('signupLastName').value.trim();
        if (!lastName) {
            showMessage('Veuillez saisir votre nom', 'error');
            return;
        }
        userProfile.lastName = lastName;
    }
    
    if (currentSignupStep === 3) {
        const email = document.getElementById('signupEmail').value.trim();
        if (!email || !email.includes('@')) {
            showMessage('Veuillez saisir une adresse email valide', 'error');
            return;
        }
        userProfile.email = email;
    }

    if (currentSignupStep === 4) {
        const phone = document.getElementById('signupPhone').value.trim();
        if (!phone) {
            showMessage('Veuillez saisir votre numéro de téléphone', 'error');
            return;
        }
        userProfile.phone = phone;
    }

    // Animation professionnelle
    const currentStep = document.getElementById(`signupStep${currentSignupStep}`);
    const nextStep = document.getElementById(`signupStep${stepNumber}`);
    
    if (currentStep && nextStep) {
        gsap.to(currentStep, {
            x: -100,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                
                gsap.fromTo(nextStep, 
                    { x: 100, opacity: 0 },
                    { 
                        x: 0, 
                        opacity: 1, 
                        duration: 0.4, 
                        ease: "power2.out",
                        onComplete: () => {
                            const input = nextStep.querySelector('input');
                            if (input) input.focus();
                        }
                    }
                );
            }
        });
        
        currentSignupStep = stepNumber;
    }
}

function previousSignupStep(stepNumber) {
    const currentStep = document.getElementById(`signupStep${currentSignupStep}`);
    const prevStep = document.getElementById(`signupStep${stepNumber}`);
    
    if (currentStep && prevStep) {
        gsap.to(currentStep, {
            x: 100,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
                
                gsap.fromTo(prevStep, 
                    { x: -100, opacity: 0 },
                    { 
                        x: 0, 
                        opacity: 1, 
                        duration: 0.4, 
                        ease: "power2.out" 
                    }
                );
            }
        });
        
        currentSignupStep = stepNumber;
    }
}

async function createAccount() {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (!password || password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Les mots de passe ne correspondent pas', 'error');
        return;
    }

    try {
        showLoadingModal('Création de votre compte...');
        
        const user = await FornapAuth.signUp(userProfile.email, password, {
            displayName: `${userProfile.firstName} ${userProfile.lastName}`,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            phone: userProfile.phone
        });

        // Créer le profil utilisateur complet dans Firestore
        await createUserProfile(user);

        hideLoadingModal();
        showMessage('Compte créé avec succès !', 'success');
        
        setTimeout(() => {
            showSection('planSection');
            applyPreselectedPlan(); // Appliquer le forfait présélectionné après création de compte
        }, 1000);

    } catch (error) {
        hideLoadingModal();
        console.error('❌ Erreur inscription:', error);
        showMessage(error.message || 'Erreur lors de la création du compte', 'error');
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }

    try {
        showLoadingModal('Connexion en cours...');
        
        const user = await FornapAuth.signIn(email, password);
        
        hideLoadingModal();
        showMessage('Connexion réussie ! Redirection vers votre dashboard...', 'success');
        
        // CORRECTION : Les utilisateurs existants vont au dashboard, pas au processus de paiement
        // Le processus de paiement est uniquement pour les nouveaux comptes
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        hideLoadingModal();
        console.error('❌ Erreur connexion:', error);
        showMessage('Email ou mot de passe incorrect', 'error');
    }
}

// Sélection de forfait avec animations
function selectPlan(planId) {
    if (planId === 'honneur') {
        contactForHonor();
        return;
    }

    selectedPlan = { id: planId, ...plans[planId] };
    
    // Animation de sélection
    const planCards = document.querySelectorAll('.plan-option');
    const selectedCard = document.querySelector(`[data-plan="${planId}"]`);
    
    planCards.forEach(card => {
        if (card === selectedCard) {
            gsap.to(card, {
                scale: 1.05,
                borderColor: '#28A745',
                backgroundColor: '#F8F9FA',
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        } else {
            gsap.to(card, {
                scale: 1,
                borderColor: '#E9ECEF',
                backgroundColor: '#FFFFFF',
                duration: 0.3,
                ease: "power2.out"
            });
        }
    });
    
    setTimeout(() => {
        // Vérifier si c'est un ancien membre actif pour éviter le paiement
        const isLegacy = sessionStorage.getItem('isLegacyMember') === 'true';
        const memberStatus = sessionStorage.getItem('memberStatus');
        
        if (isLegacy && memberStatus === 'active') {
            // Ancien membre actif -> directement aux questions (pas de paiement)
            console.log('🎯 Ancien membre actif - passage aux questions sans paiement');
            showSection('gettingToKnowSection');
            updateProgressStep(4);
        } else {
            // Nouveau membre ou ancien membre expiré -> paiement
            showSection('paymentSection');
            displaySelectedPlan();
        }
    }, 600);
}

function contactForHonor() {
    showMessage('Contactez-nous à contact@fornap.fr pour devenir membre d\'honneur', 'info');
}

function displaySelectedPlan() {
    const display = document.getElementById('selectedPlanDisplay');
    if (display && selectedPlan) {
        const price = selectedPlan.price;
        const total = (price * 1.2).toFixed(2);
        
        display.innerHTML = `
            <div class="plan-details">
                <h4>${selectedPlan.name}</h4>
                <div class="plan-cost">${selectedPlan.price}€${selectedPlan.period}</div>
                <div class="plan-calculation">
                    <div class="calc-line">
                        <span>Sous-total</span>
                        <span>${price}€</span>
                    </div>
                    <div class="calc-line">
                        <span>TVA (20%)</span>
                        <span>${(price * 0.2).toFixed(2)}€</span>
                    </div>
                    <div class="calc-total">
                        <span><strong>Total</strong></span>
                        <span><strong>${total}€</strong></span>
                    </div>
                </div>
            </div>
        `;
        
        gsap.fromTo(display, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }
}

function backToPlanSelection() {
    showSection('planSection');
}

async function processPayment() {
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    if (!acceptTerms) {
        showMessage('Veuillez accepter les conditions générales', 'error');
        return;
    }

    try {
        showLoadingModal('Traitement du paiement...');
        
        await simulatePayment();
        
        hideLoadingModal();
        
        setTimeout(() => {
            showSection('congratulationsSection');
            triggerSuccessAnimation();
        }, 500);

    } catch (error) {
        hideLoadingModal();
        console.error('❌ Erreur paiement:', error);
        showMessage('Erreur lors du traitement du paiement', 'error');
    }
}

async function simulatePayment() {
    const steps = [
        { id: 'loadingStep1', delay: 1000 },
        { id: 'loadingStep2', delay: 2000 },
        { id: 'loadingStep3', delay: 1500 },
        { id: 'loadingStep4', delay: 1000 }
    ];

    for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => {
            setTimeout(() => {
                const step = document.getElementById(steps[i].id);
                if (step) {
                    step.style.color = '#28A745';
                    step.innerHTML = step.innerHTML.replace('🔄', '✓');
                }
                resolve();
            }, steps[i].delay);
        });
    }
}

function triggerSuccessAnimation() {
    const successIcon = document.getElementById('successIcon');
    
    gsap.set(successIcon, { scale: 0, rotation: -180 });
    gsap.to(successIcon, {
        scale: 1,
        rotation: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
    });
}

function startGettingToKnow() {
    // Toujours faire le bienvenue, même si utilisateur connecté
    showSection('gettingToKnowSection');
}

// Fonctions questions avec animations GSAP
function nextKnowStep(stepNumber) {
    if (currentKnowStep === 1) {
        const city = document.getElementById('userCity').value.trim();
        if (!city) {
            showMessage('Veuillez indiquer votre ville', 'error');
            return;
        }
        userProfile.city = city;
    }
    
    if (currentKnowStep === 2) {
        const motivation = document.querySelector('input[name="motivation"]:checked');
        if (!motivation) {
            showMessage('Veuillez sélectionner votre motivation', 'error');
            return;
        }
        userProfile.motivation = motivation.value;
    }

    if (currentKnowStep === 3) {
        const profession = document.getElementById('userProfession').value.trim();
        if (!profession) {
            showMessage('Veuillez indiquer votre profession', 'error');
            return;
        }
        userProfile.profession = profession;
    }

    const currentStep = document.getElementById(`knowStep${currentKnowStep}`);
    const nextStep = document.getElementById(`knowStep${stepNumber}`);
    
    if (currentStep && nextStep) {
        gsap.to(currentStep, {
            x: -100,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                
                gsap.fromTo(nextStep, 
                    { x: 100, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
                );
            }
        });
        
        currentKnowStep = stepNumber;
    }
}

function previousKnowStep(stepNumber) {
    const currentStep = document.getElementById(`knowStep${currentKnowStep}`);
    const prevStep = document.getElementById(`knowStep${stepNumber}`);
    
    if (currentStep && prevStep) {
        gsap.to(currentStep, {
            x: 100,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
                
                gsap.fromTo(prevStep, 
                    { x: -100, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
                );
            }
        });
        
        currentKnowStep = stepNumber;
    }
}

async function finalizeOnboarding() {
    const discovery = document.querySelector('input[name="discovery"]:checked');
    if (!discovery) {
        showMessage('Veuillez nous dire comment vous nous avez découverts', 'error');
        return;
    }
    
    userProfile.discovery = discovery.value;
    
    try {
        showLoadingModal('Finalisation de votre profil...');
        
        // Mettre à jour le profil utilisateur complet avec toutes les infos
        if (currentUser) {
            await updateUserProfile(currentUser, userProfile);
            console.log('✅ Profil utilisateur complet:', userProfile);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        hideLoadingModal();
        
        // Vérifier si c'est un ancien membre actif pour redirection directe
        const isLegacy = sessionStorage.getItem('isLegacyMember') === 'true';
        const memberStatus = sessionStorage.getItem('memberStatus');
        
        if (isLegacy && memberStatus === 'active') {
            // Ancien membre actif -> directement au dashboard
            console.log('✅ Ancien membre actif - redirection dashboard');
            showMessage('Profil complété ! Redirection vers votre dashboard...', 'success');
            setTimeout(() => {
                // Nettoyer les données de session
                sessionStorage.removeItem('isLegacyMember');
                sessionStorage.removeItem('memberStatus');
                sessionStorage.removeItem('legacyMemberData');
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            // Nouveau membre ou ancien expiré -> section finale normale
            showSection('finalSection');
            
            // Animation finale
            const finalIcon = document.getElementById('finalIcon');
            gsap.set(finalIcon, { scale: 0 });
            gsap.to(finalIcon, {
                scale: 1,
                duration: 1,
                ease: "bounce.out"
            });
        }
        
    } catch (error) {
        hideLoadingModal();
        console.error('❌ Erreur finalisation:', error);
        showMessage('Erreur lors de la finalisation', 'error');
    }
}

function goToDashboard() {
    showMessage('Redirection vers votre dashboard...', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Fonction pour adapter les sections de questions aux anciens membres
function adaptQuestionsForLegacyMember() {
    const isLegacy = sessionStorage.getItem('isLegacyMember') === 'true';
    
    if (!isLegacy) return;
    
    // Mettre à jour les titres pour les anciens membres
    const knowStep1Title = document.querySelector('#knowStep1 .form-header h2');
    const knowStep2Title = document.querySelector('#knowStep2 .form-header h2');
    const knowStep3Title = document.querySelector('#knowStep3 .form-header h2');
    const knowStep4Title = document.querySelector('#knowStep4 .form-header h2');
    
    if (knowStep1Title) knowStep1Title.textContent = "Complétez votre profil - Dans quelle ville êtes-vous basé ?";
    if (knowStep2Title) knowStep2Title.textContent = "Qu'est-ce qui vous a motivé à revenir chez FORNAP ?";
    if (knowStep3Title) knowStep3Title.textContent = "Quelle est votre profession actuelle ?";
    if (knowStep4Title) knowStep4Title.textContent = "Comment nous aviez-vous découverts à l'époque ?";
    
    console.log('✅ Questions adaptées pour ancien membre');
}

// Vérifier la présélection de forfait depuis membership
function checkPreselectedPlan() {
    const preselectedPlan = sessionStorage.getItem('selectedPlan');
    if (preselectedPlan) {
        try {
            const plan = JSON.parse(preselectedPlan);
            console.log('🎯 Forfait présélectionné:', plan);
            
            // Si c'est membre d'honneur, rediriger vers contact
            if (plan.id === 'honneur') {
                contactForHonor();
                return;
            }
            
            // CORRECTION : Commencer par l'accueil, pas la sélection directe
            // L'utilisateur doit d'abord s'authentifier ou créer un compte
            showSection('welcomeSection');
            
            // Stocker le plan pour l'utiliser plus tard dans le parcours
            window.preselectedPlan = plan;
            
            // Afficher un message informatif
            showMessage(`Forfait ${plan.name} sélectionné - Veuillez vous connecter ou créer un compte`, 'info');
            
        } catch (error) {
            console.error('Erreur parsing forfait présélectionné:', error);
            sessionStorage.removeItem('selectedPlan');
        }
    }
}

// Fonction pour présélectionner le forfait après authentification
function applyPreselectedPlan() {
    if (window.preselectedPlan) {
        const plan = window.preselectedPlan;
        
        // Présélectionner visuellement le forfait
        setTimeout(() => {
            const selectedCard = document.querySelector(`[data-plan="${plan.id}"]`);
            if (selectedCard) {
                selectedCard.classList.add('preselected');
                gsap.to(selectedCard, {
                    scale: 1.05,
                    borderColor: '#28A745',
                    backgroundColor: '#F8F9FA',
                    duration: 0.5,
                    ease: "back.out(1.7)"
                });
            }
            showMessage(`Forfait ${plan.name} présélectionné`, 'success');
        }, 500);
        
        // Nettoyer
        window.preselectedPlan = null;
        sessionStorage.removeItem('selectedPlan');
    }
}

// Créer le profil utilisateur initial dans Firestore
async function createUserProfile(user) {
    try {
        const db = firebase.firestore();
        const profileData = {
            uid: user.uid,
            email: user.email,
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            phone: userProfile.phone || '',
            displayName: `${userProfile.firstName} ${userProfile.lastName}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            // Champs qui seront remplis plus tard
            city: '',
            profession: '',
            motivation: '',
            discovery: ''
        };

        await db.collection('users').doc(user.uid).set(profileData);
        console.log('✅ Profil utilisateur créé dans Firestore:', profileData);
        
    } catch (error) {
        console.error('❌ Erreur création profil Firestore:', error);
        throw error;
    }
}

// Mettre à jour le profil utilisateur complet dans Firestore
async function updateUserProfile(user, profileInfo) {
    try {
        const db = firebase.firestore();
        const updateData = {
            city: profileInfo.city || '',
            profession: profileInfo.profession || '',
            motivation: profileInfo.motivation || '',
            discovery: profileInfo.discovery || '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(user.uid).update(updateData);
        console.log('✅ Profil utilisateur mis à jour dans Firestore:', updateData);
        
    } catch (error) {
        console.error('❌ Erreur mise à jour profil Firestore:', error);
        throw error;
    }
}

// Vérifier si l'utilisateur a déjà un abonnement
async function checkUserSubscriptionAndRedirect(user) {
    try {
        // TODO: Vérifier en base de données si l'user a un abonnement actif
        console.log('🔍 Vérification abonnement pour:', user.email);
        
        // Pour l'instant, simulation
        // const hasActiveSubscription = await checkUserSubscription(user.uid);
        const hasActiveSubscription = false; // À remplacer par vraie vérification
        
        if (hasActiveSubscription) {
            showMessage('Vous avez déjà un abonnement actif. Redirection vers votre dashboard...', 'info');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Erreur vérification abonnement:', error);
        return false;
    }
}

// Fonctions modales
function showLoadingModal(message = 'Traitement en cours...') {
    const modal = document.getElementById('loadingModal');
    const title = document.getElementById('loadingTitle');
    const messageEl = document.getElementById('loadingMessage');
    
    if (title) title.textContent = message;
    if (messageEl) messageEl.textContent = 'Veuillez patienter...';
    
    modal.classList.remove('hidden');
    
    gsap.fromTo(modal.querySelector('.modal-content'), 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
    );
}

function hideLoadingModal() {
    const modal = document.getElementById('loadingModal');
    gsap.to(modal.querySelector('.modal-content'), {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => modal.classList.add('hidden')
    });
}

// Validation en temps réel et gestion des interactions
function setupValidation() {
    // Champs signup
    const signupFields = [
        { id: 'signupFirstName', btnId: 'nextBtn1' },
        { id: 'signupLastName', btnId: 'nextBtn2' },
        { id: 'signupEmail', btnId: 'nextBtn3' },
        { id: 'signupPhone', btnId: 'nextBtn4' },
        { id: 'signupPassword', btnId: 'nextBtn5' }
    ];
    
    signupFields.forEach(field => {
        const input = document.getElementById(field.id);
        const btn = document.getElementById(field.btnId);
        
        if (input && btn) {
            input.addEventListener('input', () => {
                const isValid = input.value.trim();
                btn.disabled = !isValid;
                
                if (isValid) {
                    gsap.to(btn, { scale: 1, opacity: 1, duration: 0.3 });
                } else {
                    gsap.to(btn, { scale: 0.95, opacity: 0.6, duration: 0.3 });
                }
            });
        }
    });
    
    // Validation ville
    const cityInput = document.getElementById('userCity');
    const cityBtn = document.getElementById('knowNextBtn1');
    if (cityInput && cityBtn) {
        cityInput.addEventListener('input', () => {
            cityBtn.disabled = !cityInput.value.trim();
        });
    }

    // Validation profession
    const professionInput = document.getElementById('userProfession');
    const professionBtn = document.getElementById('knowNextBtn3');
    if (professionInput && professionBtn) {
        professionInput.addEventListener('input', () => {
            professionBtn.disabled = !professionInput.value.trim();
        });
    }
}

// Configuration des interactions des éléments de sélection
function setupInteractiveElements() {
    // Méthodes de paiement
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Réinitialiser tous les éléments
            document.querySelectorAll('.payment-method').forEach(method => {
                method.classList.remove('active');
            });
            
            // Activer l'élément sélectionné
            const selectedMethod = e.target.closest('.payment-method');
            if (selectedMethod) {
                selectedMethod.classList.add('active');
                gsap.to(selectedMethod, { 
                    scale: 1.02, 
                    duration: 0.2, 
                    ease: "back.out(1.7)",
                    onComplete: () => {
                        gsap.to(selectedMethod, { scale: 1, duration: 0.2 });
                    }
                });
            }
        });
    });

    // Choix de motivation - avec gestion améliorée des clics
    document.querySelectorAll('.choice-option[data-value]').forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        
        // Gestion du clic sur l'option entière
        option.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (radio && !radio.checked) {
                // Décocher tous les autres radios du même groupe
                document.querySelectorAll(`input[name="${radio.name}"]`).forEach(r => {
                    r.checked = false;
                    const opt = r.closest('.choice-option');
                    if (opt) {
                        opt.classList.remove('selected');
                        gsap.to(opt, { scale: 1, duration: 0.2 });
                    }
                });
                
                // Cocher ce radio et appliquer les animations
                radio.checked = true;
                option.classList.add('selected');
                
                // Trigger l'événement change manuellement
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Animation de sélection
                gsap.to(option, { 
                    scale: 1.05, 
                    duration: 0.2, 
                    ease: "back.out(1.7)",
                    onComplete: () => {
                        gsap.to(option, { scale: 1.02, duration: 0.2 });
                    }
                });
            }
        });
        
        // Hover effects améliorés
        option.addEventListener('mouseenter', () => {
            if (!radio.checked) {
                gsap.to(option, { scale: 1.01, duration: 0.2 });
            }
        });
        
        option.addEventListener('mouseleave', () => {
            if (!radio.checked) {
                gsap.to(option, { scale: 1, duration: 0.2 });
            }
        });
    });
    
    // Validation radio buttons avec animations
    document.querySelectorAll('input[name="motivation"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const btn = document.getElementById('knowNextBtn2');
            if (btn) {
                btn.disabled = false;
                gsap.to(btn, { scale: 1, opacity: 1, duration: 0.3 });
            }
        });
    });
    
    document.querySelectorAll('input[name="discovery"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const btn = document.getElementById('knowNextBtn4');
            if (btn) {
                btn.disabled = false;
                gsap.to(btn, { scale: 1, opacity: 1, duration: 0.3 });
            }
        });
    });
}

// Formatage des champs de paiement
function formatPaymentInputs() {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');

    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    if (expiryDate) {
        expiryDate.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    if (cvv) {
        cvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

// Initialisation des composants FORNAP
function initFornapComponents() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        navbarPlaceholder.outerHTML = FornapComponents.generateNavbar('journey', '../');
    }

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.outerHTML = FornapComponents.generateFooter('../');
    }

    setTimeout(() => {
        FornapComponents.initNavbarEvents('../', {
            onLogin: showLoginModal,
            onLogout: handleLogout
        });
    }, 100);
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ DOM chargé - Journey Experience Pro');

    try {
        // Initialiser les services
        await FornapAuth.init();
        
        // Initialiser les composants
        initFornapComponents();

        // Écouter les changements d'authentification
        FornapAuth.onAuthStateChanged((user) => {
            currentUser = user;
            console.log('👤 Utilisateur:', user ? user.email : 'déconnecté');
            
            FornapComponents.syncAuthState(!!user);
        });

        // Vérifier la présélection de forfait depuis membership
        checkPreselectedPlan();

        // Configuration
        setupValidation();
        setupInteractiveElements();
        formatPaymentInputs();
        updateProgress();

        // Animation d'entrée
        gsap.fromTo('.welcome-hero', 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );

        console.log('🎯 FORNAP Journey Experience Pro prête !');

    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        showMessage('Erreur lors du chargement. Veuillez recharger la page.', 'error');
    }
});