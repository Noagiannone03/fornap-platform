/* ========================================
   FORNAP - Module Paiement
   Gestion des paiements et abonnements
   ======================================== */

// Variables du module
let paymentInProgress = false;

/* ========================================
   AFFICHAGE DE LA SECTION PAIEMENT
   ======================================== */

function showPaymentSection() {
    const selectedPlan = window.FORNAP.selectedPlan();
    const currentUser = window.FORNAP.currentUser();
    
    if (!selectedPlan) {
        window.FORNAP.showMessage('Veuillez sélectionner un forfait', 'error');
        return;
    }

    if (!currentUser) {
        window.FORNAP.showMessage('Vous devez être connecté pour effectuer un paiement', 'error');
        return;
    }

    console.log('💳 Affichage section paiement');
    window.FORNAP.hideAllSections();
    
    createPaymentInterface(selectedPlan);
}

function createPaymentInterface(plan) {
    const paymentHTML = `
        <section class="form-section" id="dynamicPaymentSection">
            <div class="form-container">
                <h2 class="text-center mb-2">Finaliser votre adhésion</h2>
                
                <div class="payment-summary" style="border: 2px solid var(--noir-principal); padding: 1.5rem; margin-bottom: 2rem; background: var(--gris-tres-clair);">
                    <h3 class="text-center mb-1">Récapitulatif</h3>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span><strong>Forfait :</strong></span>
                        <span>${plan.name}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span><strong>Prix :</strong></span>
                        <span>${plan.price}€/mois</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid var(--noir-principal); padding-top: 0.5rem;">
                        <span>Total :</span>
                        <span>${plan.price}€</span>
                    </div>
                </div>
                
                <div class="payment-method">
                    <h3 class="mb-1">Informations de paiement</h3>
                    <p class="mb-1" style="color: var(--gris-moyen); font-size: 0.9rem;">
                        Mode démo - Aucun paiement réel ne sera effectué
                    </p>
                    
                    <div class="form-group">
                        <label for="cardNumber">Numéro de carte</label>
                        <input type="text" id="cardNumber" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242" maxlength="19">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label for="cardExpiry">Date d'expiration</label>
                            <input type="text" id="cardExpiry" placeholder="MM/YY" value="12/25" maxlength="5">
                        </div>
                        <div class="form-group">
                            <label for="cardCvc">Code CVC</label>
                            <input type="text" id="cardCvc" placeholder="123" value="123" maxlength="3">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="cardName">Nom sur la carte</label>
                        <input type="text" id="cardName" placeholder="Nom complet" required>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="acceptTerms" required style="margin-right: 0.5rem;">
                            J'accepte les <a href="#" style="color: var(--noir-principal); font-weight: bold;">conditions générales</a> et la <a href="#" style="color: var(--noir-principal); font-weight: bold;">politique de confidentialité</a>
                        </label>
                    </div>
                    
                    <button type="button" id="processPaymentBtn" class="btn btn-primary w-full mb-1">
                        Confirmer le paiement - ${plan.price}€
                    </button>
                    
                    <div class="payment-security" style="text-align: center; margin-top: 1rem; padding: 1rem; background: var(--blanc-principal); border: 1px solid var(--gris-clair);">
                        <p style="font-size: 0.8rem; color: var(--gris-moyen);">
                            🔒 Paiement sécurisé SSL<br>
                            💳 Toutes les cartes acceptées<br>
                            ✅ Annulation possible à tout moment
                        </p>
                    </div>
                </div>
            </div>
        </section>
    `;

    // Injecter le HTML
    const mainContent = document.querySelector('.main-content');
    const tempSection = document.createElement('div');
    tempSection.innerHTML = paymentHTML;
    const paymentSection = tempSection.firstElementChild;
    mainContent.appendChild(paymentSection);

    // Ajouter les événements
    setupPaymentEvents();
    
    // Faire défiler vers la section
    paymentSection.scrollIntoView({ behavior: 'smooth' });
}

/* ========================================
   GESTION DES ÉVÉNEMENTS DE PAIEMENT
   ======================================== */

function setupPaymentEvents() {
    // Bouton de paiement
    document.getElementById('processPaymentBtn').addEventListener('click', processPayment);
    
    // Formatage automatique des champs
    document.getElementById('cardNumber').addEventListener('input', formatCardNumber);
    document.getElementById('cardExpiry').addEventListener('input', formatCardExpiry);
    document.getElementById('cardCvc').addEventListener('input', formatCardCvc);
    
    // Pré-remplir le nom si disponible
    const currentUser = window.FORNAP.currentUser();
    if (currentUser && currentUser.displayName) {
        document.getElementById('cardName').value = currentUser.displayName;
    }
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = formattedValue;
}

function formatCardExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

function formatCardCvc(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
}

/* ========================================
   TRAITEMENT DU PAIEMENT
   ======================================== */

async function processPayment() {
    if (paymentInProgress) return;
    
    const currentUser = window.FORNAP.currentUser();
    const selectedPlan = window.FORNAP.selectedPlan();
    
    if (!currentUser || !selectedPlan) {
        window.FORNAP.showMessage('Données manquantes pour le paiement', 'error');
        return;
    }

    // Validation des champs
    if (!validatePaymentForm()) {
        return;
    }

    console.log('💳 Traitement du paiement...');
    paymentInProgress = true;
    window.FORNAP.setLoading(true);
    
    try {
        // Simulation du traitement de paiement
        await simulatePaymentProcessing();
        
        // Créer l'enregistrement d'abonnement
        await createSubscriptionRecord(currentUser, selectedPlan);
        
        // Mettre à jour le profil utilisateur
        await updateUserSubscription(currentUser, selectedPlan);
        
        // Ajouter des points de fidélité pour l'inscription
        await addLoyaltyPoints(currentUser, 100, 'inscription');
        
        window.FORNAP.showMessage('Paiement effectué avec succès ! Bienvenue chez FORNAP !', 'success');
        
        // Nettoyer l'interface
        document.getElementById('dynamicPaymentSection').remove();
        
        // Rediriger vers la finalisation du profil
        setTimeout(() => showAccountCompletion(), 1500);
        
    } catch (error) {
        console.error('❌ Erreur paiement:', error);
        window.FORNAP.showMessage('Erreur lors du paiement. Veuillez réessayer.', 'error');
    } finally {
        paymentInProgress = false;
        window.FORNAP.setLoading(false);
    }
}

function validatePaymentForm() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvc = document.getElementById('cardCvc').value;
    const cardName = document.getElementById('cardName').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;

    if (!cardNumber || cardNumber.length < 16) {
        window.FORNAP.showMessage('Numéro de carte invalide', 'error');
        return false;
    }

    if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) {
        window.FORNAP.showMessage('Date d\'expiration invalide', 'error');
        return false;
    }

    if (!cardCvc || cardCvc.length < 3) {
        window.FORNAP.showMessage('Code CVC invalide', 'error');
        return false;
    }

    if (!cardName.trim()) {
        window.FORNAP.showMessage('Nom sur la carte requis', 'error');
        return false;
    }

    if (!acceptTerms) {
        window.FORNAP.showMessage('Vous devez accepter les conditions générales', 'error');
        return false;
    }

    return true;
}

async function simulatePaymentProcessing() {
    return new Promise(resolve => {
        setTimeout(resolve, 2000); // Simulation de 2 secondes
    });
}

/* ========================================
   GESTION DES ABONNEMENTS
   ======================================== */

async function createSubscriptionRecord(user, plan) {
    const subscriptionData = {
        userId: user.uid,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        currency: 'EUR',
        status: 'active',
        startDate: firebase.firestore.FieldValue.serverTimestamp(),
        nextBillingDate: getNextBillingDate(),
        paymentMethod: 'demo_card',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    return firebase.firestore()
        .collection('subscriptions')
        .doc(user.uid)
        .set(subscriptionData);
}

async function updateUserSubscription(user, plan) {
    return firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
            membershipStatus: 'active',
            currentPlan: plan.id,
            planPrice: plan.price,
            planName: plan.name,
            subscriptionDate: firebase.firestore.FieldValue.serverTimestamp(),
            nextBillingDate: getNextBillingDate(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
}

async function addLoyaltyPoints(user, points, reason) {
    const pointsData = {
        userId: user.uid,
        points: points,
        reason: reason,
        date: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Ajouter l'entrée de points
    await firebase.firestore()
        .collection('loyalty_points')
        .add(pointsData);

    // Mettre à jour le total de l'utilisateur
    await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
            loyaltyPoints: firebase.firestore.FieldValue.increment(points)
        });
}

function getNextBillingDate() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return firebase.firestore.Timestamp.fromDate(nextMonth);
}

/* ========================================
   FINALISATION DU PROFIL
   ======================================== */

function showAccountCompletion() {
    const completionHTML = `
        <section class="form-section" id="accountCompletionSection">
            <div class="form-container">
                <h2 class="text-center mb-2">Finaliser votre profil</h2>
                <p class="text-center mb-2" style="color: var(--succes);">
                    ✅ Paiement validé ! Complétez votre profil pour accéder à tous les services FORNAP.
                </p>
                
                <div class="form-group">
                    <label for="profileAddress">Adresse complète</label>
                    <input type="text" id="profileAddress" placeholder="123 Rue de la Paix, 75001 Paris" required>
                </div>
                
                <div class="form-group">
                    <label for="profileCompany">Entreprise (optionnel)</label>
                    <input type="text" id="profileCompany" placeholder="Nom de votre entreprise">
                </div>
                
                <div class="form-group">
                    <label for="profileInterests">Centres d'intérêt</label>
                    <select id="profileInterests" multiple style="height: 100px;">
                        <option value="coworking">Coworking</option>
                        <option value="events">Événements</option>
                        <option value="networking">Networking</option>
                        <option value="innovation">Innovation</option>
                        <option value="entrepreneurship">Entrepreneuriat</option>
                        <option value="tech">Technologie</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                    </select>
                </div>
                
                <button type="button" id="completeProfileBtn" class="btn btn-primary w-full mb-1">
                    Finaliser mon profil
                </button>
                
                <button type="button" id="skipProfileBtn" class="btn btn-secondary w-full">
                    Passer cette étape
                </button>
            </div>
        </section>
    `;

    // Injecter le HTML
    const mainContent = document.querySelector('.main-content');
    const tempSection = document.createElement('div');
    tempSection.innerHTML = completionHTML;
    const completionSection = tempSection.firstElementChild;
    mainContent.appendChild(completionSection);

    // Ajouter les événements
    document.getElementById('completeProfileBtn').addEventListener('click', completeProfile);
    document.getElementById('skipProfileBtn').addEventListener('click', skipProfileCompletion);

    // Faire défiler vers la section
    completionSection.scrollIntoView({ behavior: 'smooth' });
}

async function completeProfile() {
    const address = document.getElementById('profileAddress').value;
    const company = document.getElementById('profileCompany').value;
    const interests = Array.from(document.getElementById('profileInterests').selectedOptions)
        .map(option => option.value);

    if (!address.trim()) {
        window.FORNAP.showMessage('Adresse requise', 'error');
        return;
    }

    const currentUser = window.FORNAP.currentUser();
    if (!currentUser) return;

    try {
        await firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .update({
                'profile.address': address,
                'profile.company': company || '',
                'profile.interests': interests,
                'profile.setupCompleted': true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        window.FORNAP.showMessage('Profil complété avec succès !', 'success');
        finishOnboarding();

    } catch (error) {
        console.error('❌ Erreur completion profil:', error);
        window.FORNAP.showMessage('Erreur lors de la sauvegarde', 'error');
    }
}

function skipProfileCompletion() {
    window.FORNAP.showMessage('Vous pourrez compléter votre profil plus tard dans le dashboard', 'info');
    finishOnboarding();
}

function finishOnboarding() {
    // Nettoyer l'interface
    document.getElementById('accountCompletionSection')?.remove();
    
    // Rediriger vers le dashboard
    setTimeout(() => {
        if (typeof showDashboard === 'function') {
            showDashboard();
        } else {
            window.location.href = 'pages/dashboard.html';
        }
    }, 1500);
}

/* ========================================
   EXPORT DES FONCTIONS PUBLIQUES
   ======================================== */

// Rendre les fonctions disponibles globalement
window.showPaymentSection = showPaymentSection;

console.log('💳 Module Payment FORNAP chargé'); 