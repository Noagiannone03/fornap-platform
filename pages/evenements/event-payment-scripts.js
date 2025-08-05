/**
 * FORNAP - Paiement Événement
 * Page de réservation et paiement fictif
 */

console.log('💳 FORNAP - Paiement Événement');

// Variables globales
let currentUser = null;
let currentEvent = null;
let eventId = null;
let ticketQuantity = 1;
let totalAmount = 0;

// Même données fictives que les autres pages
const mockEventsData = [
    {
        id: 1,
        title: "Soirée Jazz & Co-création",
        description: "Une soirée unique mêlant jazz live et sessions de co-création pour les entrepreneurs. Venez networker dans une ambiance musicale exceptionnelle.",
        fullDescription: "Plongez dans une atmosphère feutrée où la musique jazz se mêle aux discussions entrepreneuriales. Cette soirée unique propose un format inédit : des sessions de co-création guidées par des coachs business, ponctuées par des performances live de musiciens locaux. Un moment privilégié pour développer votre réseau professionnel dans un cadre détendu et inspirant.",
        category: "musique",
        date: "2024-08-15",
        time: "19:00",
        endTime: "23:00",
        location: "Salon Principal FORNAP",
        price: 25.00,
        maxAttendees: 80,
        currentAttendees: 42,
        featured: true,
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
        artists: ["Trio Jazz Urbain", "Marie Laurent (saxo)"],
        tags: ["jazz", "networking", "musique live"],
        organizer: "FORNAP Events",
        status: "open"
    },
    {
        id: 2,
        title: "Workshop UX/UI Design",
        description: "Atelier pratique de design UX/UI animé par des experts du secteur. Apprenez les dernières tendances et méthodes.",
        fullDescription: "Cet atelier intensif de 4 heures vous plongera dans l'univers du design UX/UI moderne. Animé par des designers seniors ayant travaillé pour des startups et grandes entreprises, vous découvrirez les outils, méthodes et tendances actuelles. Au programme : recherche utilisateur, wireframing, prototypage, et tests d'utilisabilité. Matériel fourni, ordinateur portable requis.",
        category: "atelier",
        date: "2024-08-12",
        time: "14:00",
        endTime: "18:00",
        location: "Salle de Formation",
        price: 75.00,
        maxAttendees: 25,
        currentAttendees: 18,
        featured: true,
        image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop",
        artists: ["Sarah Chen", "Maxime Dubois"],
        tags: ["design", "formation", "ux", "ui"],
        organizer: "Design Academy",
        status: "open"
    },
    {
        id: 3,
        title: "Pitch Night Startups",
        description: "Soirée de pitch pour startups et entrepreneurs. Présentez votre projet devant un jury d'investisseurs.",
        fullDescription: "La grande soirée mensuelle des entrepreneurs ! Venez présenter votre startup en 3 minutes chrono devant un jury composé d'investisseurs, de business angels et d'entrepreneurs expérimentés. Prix du meilleur pitch : accompagnement gratuit de 6 mois par notre incubateur partenaire. Ouvert aux spectateurs, networking et cocktail inclus.",
        category: "conference",
        date: "2024-08-20",
        time: "18:30",
        endTime: "22:00",
        location: "Auditorium FORNAP",
        price: 15.00,
        maxAttendees: 150,
        currentAttendees: 67,
        featured: true,
        image: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&h=600&fit=crop",
        artists: ["Panel d'investisseurs", "Business Angels Lyon"],
        tags: ["startup", "pitch", "investissement", "networking"],
        organizer: "FORNAP Incubator",
        status: "open"
    },
    {
        id: 4,
        title: "Afterwork Networking",
        description: "Rencontrez d'autres professionnels dans une ambiance décontractée. Cocktails et canapés offerts.",
        fullDescription: "L'afterwork incontournable de la communauté FORNAP ! Chaque jeudi, retrouvez entrepreneurs, freelances, et professionnels de tous secteurs pour un moment de détente et de networking authentique. Cocktails signature et canapés préparés par notre chef partenaire. Animation avec jeux de networking pour faciliter les rencontres.",
        category: "networking",
        date: "2024-08-08",
        time: "18:00",
        endTime: "21:00",
        location: "Terrasse & Lounge",
        price: 0.00,
        maxAttendees: 60,
        currentAttendees: 34,
        featured: false,
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
        artists: ["DJ Ambient"],
        tags: ["networking", "afterwork", "gratuit"],
        organizer: "FORNAP Community",
        status: "open"
    },
    {
        id: 5,
        title: "Formation Marketing Digital",
        description: "Masterclass sur les stratégies marketing digital actuelles. De la théorie à la pratique en une journée.",
        fullDescription: "Une journée complète dédiée au marketing digital moderne. Cette formation intensive couvre tous les aspects essentiels : SEO, SEA, réseaux sociaux, email marketing, automation et analytics. Alternance entre théorie et ateliers pratiques sur vos propres projets. Certificat de formation délivré. Petit-déjeuner et déjeuner inclus.",
        category: "atelier",
        date: "2024-08-25",
        time: "09:00",
        endTime: "17:30",
        location: "Grande Salle de Conférence",
        price: 120.00,
        maxAttendees: 30,
        currentAttendees: 22,
        featured: false,
        image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop",
        artists: ["Julie Martin", "Expert Marketing"],
        tags: ["marketing", "digital", "formation", "certifiante"],
        organizer: "Marketing Pro Academy",
        status: "open"
    },
    {
        id: 6,
        title: "Concert Électro Lounge",
        description: "Soirée électro avec des artistes locaux. Ambiance lounge et cocktails créatifs au programme.",
        fullDescription: "Transformez votre soirée en expérience sensorielle unique ! Nos DJs résidents et artistes électro locaux vous feront voyager dans un univers sonore éclectique mêlant deep house, ambient et électro organique. Bar à cocktails créatifs, éclairage d'ambiance et espace chill-out. Dress code : décontracté chic.",
        category: "musique",
        date: "2024-08-30",
        time: "20:00",
        endTime: "01:00",
        location: "Espace Principal + Terrasse",
        price: 20.00,
        maxAttendees: 100,
        currentAttendees: 45,
        featured: false,
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop",
        artists: ["DJ Pulse", "Collective Neon", "Lisa Voltage"],
        tags: ["électro", "concert", "cocktails", "lounge"],
        organizer: "FORNAP Nights",
        status: "open"
    },
    {
        id: 7,
        title: "Conférence Intelligence Artificielle",
        description: "Les enjeux de l'IA dans le business moderne. Conférence suivie d'un débat avec des experts du secteur.",
        fullDescription: "Plongez au cœur des transformations numériques actuelles avec cette conférence dédiée à l'intelligence artificielle et ses applications business. Des experts académiques et industriels partageront leurs insights sur l'IA générative, l'automatisation des processus, et l'éthique technologique. Table ronde interactive et session Q&A. Support de présentation fourni.",
        category: "conference",
        date: "2024-09-05",
        time: "14:00",
        endTime: "17:00",
        location: "Amphithéâtre",
        price: 45.00,
        maxAttendees: 120,
        currentAttendees: 89,
        featured: false,
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
        artists: ["Dr. Antoine Rousseau", "Maria Santos", "Tech Panel"],
        tags: ["ia", "technologie", "conférence", "innovation"],
        organizer: "Tech Innovation Hub",
        status: "open"
    },
    {
        id: 8,
        title: "Brunch Entrepreneurial",
        description: "Brunch dominical pour entrepreneurs et freelances. Échanges informels et petit-déjeuner gourmand.",
        fullDescription: "Commencez votre dimanche par un moment convivial avec la communauté entrepreneuriale ! Notre brunch mensuel réunit entrepreneurs, freelances et créateurs d'entreprise autour d'un buffet gourmand préparé avec des produits locaux. Discussions libres, échanges d'expériences et découverte de nouveaux partenaires potentiels dans une atmosphère détendue.",
        category: "networking",
        date: "2024-08-11",
        time: "10:30",
        endTime: "14:00",
        location: "Restaurant & Terrasse",
        price: 35.00,
        maxAttendees: 50,
        currentAttendees: 28,
        featured: false,
        image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop",
        artists: ["Chef Local Partner"],
        tags: ["brunch", "entrepreneuriat", "networking", "dimanche"],
        organizer: "FORNAP Community",
        status: "open"
    }
];

// Fonctions utilitaires
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function formatPrice(price) {
    return price === 0 ? 'Gratuit' : `${price.toFixed(2)} €`;
}

function getEventIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

function generateBookingReference() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let reference = 'EVT-';
    
    // 3 lettres
    for (let i = 0; i < 3; i++) {
        reference += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    reference += '-';
    
    // 6 chiffres
    for (let i = 0; i < 6; i++) {
        reference += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return reference;
}

// Rendu du récapitulatif de l'événement
function renderEventSummary() {
    const eventSummary = document.getElementById('eventSummary');
    if (!eventSummary || !currentEvent) return;
    
    eventSummary.innerHTML = `
        <img src="${currentEvent.image}" alt="${currentEvent.title}" class="summary-event-image"
             onerror="this.src='https://via.placeholder.com/300x120?text=Événement'">
        <h4 class="summary-event-title">${currentEvent.title}</h4>
        <div class="summary-event-details">
            <div class="summary-detail-item">
                <span>📅</span>
                <span>${formatDate(currentEvent.date)}</span>
            </div>
            <div class="summary-detail-item">
                <span>🕒</span>
                <span>${currentEvent.time} - ${currentEvent.endTime}</span>
            </div>
            <div class="summary-detail-item">
                <span>📍</span>
                <span>${currentEvent.location}</span>
            </div>
        </div>
    `;
}

// Rendu du détail des prix
function renderPriceBreakdown() {
    const priceBreakdown = document.getElementById('priceBreakdown');
    const totalAmountElement = document.getElementById('totalAmount');
    
    if (!priceBreakdown || !totalAmountElement || !currentEvent) return;
    
    const unitPrice = currentEvent.price;
    const subtotal = unitPrice * ticketQuantity;
    const serviceFee = currentEvent.price > 0 ? 2.50 : 0; // Frais de service uniquement si payant
    totalAmount = subtotal + serviceFee;
    
    priceBreakdown.innerHTML = `
        <div class="price-line">
            <span>Billet (${formatPrice(unitPrice)} x ${ticketQuantity})</span>
            <span>${formatPrice(subtotal)}</span>
        </div>
        ${serviceFee > 0 ? `
            <div class="price-line">
                <span>Frais de service</span>
                <span>${formatPrice(serviceFee)}</span>
            </div>
        ` : ''}
    `;
    
    totalAmountElement.textContent = formatPrice(totalAmount);
}

// Gestion de la quantité
function updateQuantity(newQuantity) {
    const maxAvailable = currentEvent.maxAttendees - currentEvent.currentAttendees;
    
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;
    if (newQuantity > maxAvailable) newQuantity = maxAvailable;
    
    ticketQuantity = newQuantity;
    
    const quantityInput = document.getElementById('ticketQuantity');
    if (quantityInput) {
        quantityInput.value = ticketQuantity;
    }
    
    renderPriceBreakdown();
}

function handleQuantityChange() {
    const quantityInput = document.getElementById('ticketQuantity');
    if (quantityInput) {
        updateQuantity(parseInt(quantityInput.value) || 1);
    }
}

function increaseQuantity() {
    updateQuantity(ticketQuantity + 1);
}

function decreaseQuantity() {
    updateQuantity(ticketQuantity - 1);
}

// Pré-remplissage du formulaire
function prefillForm() {
    if (!currentUser) return;
    
    const attendeeEmail = document.getElementById('attendeeEmail');
    if (attendeeEmail && currentUser.email) {
        attendeeEmail.value = currentUser.email;
    }
    
    // TODO: Récupérer plus d'infos depuis le profil utilisateur
    // const attendeeName = document.getElementById('attendeeName');
    // const attendeePhone = document.getElementById('attendeePhone');
}

// Validation du formulaire
function validateForm() {
    const attendeeName = document.getElementById('attendeeName');
    const attendeeEmail = document.getElementById('attendeeEmail');
    const attendeePhone = document.getElementById('attendeePhone');
    
    if (!attendeeName.value.trim()) {
        FornapUtils.showMessage('error', 'Veuillez saisir le nom du participant');
        attendeeName.focus();
        return false;
    }
    
    if (!attendeeEmail.value.trim() || !FornapUtils.validateEmail(attendeeEmail.value)) {
        FornapUtils.showMessage('error', 'Veuillez saisir un email valide');
        attendeeEmail.focus();
        return false;
    }
    
    if (attendeePhone.value.trim() && !FornapUtils.validatePhone(attendeePhone.value)) {
        FornapUtils.showMessage('error', 'Veuillez saisir un numéro de téléphone valide');
        attendeePhone.focus();
        return false;
    }
    
    return true;
}

// Traitement du paiement fictif
async function processPayment() {
    if (!validateForm()) return;
    
    const confirmButton = document.getElementById('confirmPaymentBtn');
    if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Traitement en cours...';
    }
    
    try {
        // Simulation d'un appel API de paiement
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simuler la sauvegarde en base de données
        const bookingData = {
            eventId: currentEvent.id,
            eventTitle: currentEvent.title,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            attendeeName: document.getElementById('attendeeName').value,
            attendeeEmail: document.getElementById('attendeeEmail').value,
            attendeePhone: document.getElementById('attendeePhone').value,
            quantity: ticketQuantity,
            totalAmount: totalAmount,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
            bookingReference: generateBookingReference(),
            bookingDate: new Date().toISOString(),
            status: 'confirmed'
        };
        
        // Sauvegarder dans localStorage pour simuler la persistance
        const userBookings = JSON.parse(localStorage.getItem(`bookings_${currentUser.uid}`) || '[]');
        userBookings.push(bookingData);
        localStorage.setItem(`bookings_${currentUser.uid}`, JSON.stringify(userBookings));
        
        // TODO: Sauvegarder en Firestore
        // await saveBookingToFirestore(bookingData);
        
        // Afficher la confirmation
        showConfirmationModal(bookingData.bookingReference);
        
        console.log('✅ Réservation confirmée:', bookingData);
        
    } catch (error) {
        console.error('❌ Erreur lors du paiement:', error);
        FornapUtils.showMessage('error', 'Erreur lors du traitement du paiement. Veuillez réessayer.');
        
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'Confirmer la réservation';
        }
    }
}

// Modal de confirmation
function showConfirmationModal(bookingReference) {
    const modal = document.getElementById('confirmationModal');
    const bookingReferenceElement = document.getElementById('bookingReference');
    
    if (modal && bookingReferenceElement) {
        bookingReferenceElement.textContent = bookingReference;
        modal.classList.add('show');
    }
}

// Initialisation des event listeners
function initEventListeners() {
    // Gestion de la quantité
    const decreaseBtn = document.getElementById('decreaseBtn');
    const increaseBtn = document.getElementById('increaseBtn');
    const quantityInput = document.getElementById('ticketQuantity');
    
    if (decreaseBtn) decreaseBtn.addEventListener('click', decreaseQuantity);
    if (increaseBtn) increaseBtn.addEventListener('click', increaseQuantity);
    if (quantityInput) quantityInput.addEventListener('change', handleQuantityChange);
    
    // Bouton de confirmation
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', processPayment);
    }
    
    // Boutons de la modal de confirmation
    const backToEventsBtn = document.getElementById('backToEventsBtn');
    const viewDashboardBtn = document.getElementById('viewDashboardBtn');
    
    if (backToEventsBtn) {
        backToEventsBtn.addEventListener('click', () => {
            window.location.href = 'evenements.html';
        });
    }
    
    if (viewDashboardBtn) {
        viewDashboardBtn.addEventListener('click', () => {
            window.location.href = '../dashboard.html';
        });
    }
}

// Vérification de l'authentification
function checkAuthentication() {
    if (!currentUser) {
        FornapUtils.showMessage('error', 'Vous devez être connecté pour accéder à cette page');
        setTimeout(() => {
            window.location.href = '../../pages/login.html';
        }, 2000);
        return false;
    }
    return true;
}

// Chargement de l'événement
function loadEvent() {
    eventId = getEventIdFromURL();
    
    if (!eventId) {
        FornapUtils.showMessage('error', 'ID d\'événement manquant');
        setTimeout(() => {
            window.location.href = 'evenements.html';
        }, 2000);
        return false;
    }
    
    currentEvent = mockEventsData.find(event => event.id === eventId);
    
    if (!currentEvent) {
        FornapUtils.showMessage('error', 'Événement non trouvé');
        setTimeout(() => {
            window.location.href = 'evenements.html';
        }, 2000);
        return false;
    }
    
    // Vérifier la disponibilité
    const availableSpots = currentEvent.maxAttendees - currentEvent.currentAttendees;
    if (availableSpots <= 0) {
        FornapUtils.showMessage('error', 'Cet événement est complet');
        setTimeout(() => {
            window.location.href = `event-detail.html?id=${eventId}`;
        }, 2000);
        return false;
    }
    
    // Mettre à jour le titre de la page
    document.title = `Réservation ${currentEvent.title} - FORNAP`;
    
    return true;
}

// Gestion de l'authentification
function handleAuthStateChange(user) {
    console.log('📝 État auth changé:', user ? 'connecté' : 'déconnecté');
    
    if (user) {
        currentUser = user;
        console.log('👤 Utilisateur connecté:', user.email);
        
        if (checkAuthentication() && loadEvent()) {
            renderEventSummary();
            renderPriceBreakdown();
            prefillForm();
        }
    } else {
        currentUser = null;
        console.log('👤 Utilisateur déconnecté');
        checkAuthentication();
    }
}

// Initialisation de la page
async function initPage() {
    console.log('✅ Initialisation page paiement événement');
    
    try {
        initEventListeners();
        console.log('🎯 Page paiement événement prête !');
        
    } catch (error) {
        console.error('❌ Erreur initialisation page paiement:', error);
        FornapUtils.showMessage('error', 'Erreur lors du chargement de la page');
    }
}

// Initialisation générale
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ DOM chargé - Paiement Événement');

    try {
        // Initialiser les services
        await FornapAuth.init();
        
        // Injecter navbar et footer
        const navbarPlaceholder = document.getElementById('navbar-placeholder');
        if (navbarPlaceholder) {
            navbarPlaceholder.outerHTML = FornapComponents.generateNavbar('events', '../../');
        }

        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.outerHTML = FornapComponents.generateFooter('../../');
        }

        // Initialiser les événements navbar après injection
        setTimeout(() => {
            FornapComponents.initNavbarEvents('../../', {
                onLogin: () => window.location.href = '../../pages/login.html',
                onLogout: async () => {
                    try {
                        await FornapAuth.signOut();
                        FornapUtils.showMessage('success', 'Déconnexion réussie');
                        setTimeout(() => window.location.href = '../../index.html', 1000);
                    } catch (error) {
                        console.error('❌ Erreur déconnexion:', error);
                        FornapUtils.showMessage('error', 'Erreur lors de la déconnexion');
                    }
                }
            });
        }, 100);

        // Écouter les changements d'authentification
        FornapAuth.onAuthStateChanged((user) => {
            handleAuthStateChange(user);
        });

        // Initialiser la page
        await initPage();

    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        FornapUtils.showMessage('error', 'Erreur lors du chargement. Veuillez recharger la page.');
    }
});