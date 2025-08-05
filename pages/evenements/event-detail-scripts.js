/**
 * FORNAP - Détail d'un Événement
 * Page de détail avec likes et réservation
 */

console.log('🎪 FORNAP - Détail Événement');

// Variables globales
let currentUser = null;
let currentEvent = null;
let eventId = null;

// Même données fictives que la page principale
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

function isEventLiked(eventId) {
    if (!currentUser) return false;
    const likedEvents = JSON.parse(localStorage.getItem(`likedEvents_${currentUser.uid}`) || '[]');
    return likedEvents.includes(eventId);
}

async function toggleEventLike(eventId) {
    if (!currentUser) {
        showLoginModal();
        return false;
    }
    
    try {
        const likedEvents = JSON.parse(localStorage.getItem(`likedEvents_${currentUser.uid}`) || '[]');
        const eventIndex = likedEvents.indexOf(eventId);
        
        if (eventIndex > -1) {
            likedEvents.splice(eventIndex, 1);
            FornapUtils.showMessage('info', 'Événement retiré de vos favoris');
        } else {
            likedEvents.push(eventId);
            FornapUtils.showMessage('success', 'Événement ajouté à vos favoris');
        }
        
        localStorage.setItem(`likedEvents_${currentUser.uid}`, JSON.stringify(likedEvents));
        
        // TODO: Sauvegarder en Firestore aussi
        // await saveUserLikes(currentUser.uid, likedEvents);
        
        return !eventIndex > -1;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des likes:', error);
        FornapUtils.showMessage('error', 'Erreur lors de la sauvegarde');
        return false;
    }
}

// Rendu du hero de l'événement
function renderEventHero() {
    const eventHero = document.getElementById('eventHero');
    if (!eventHero || !currentEvent) return;
    
    eventHero.innerHTML = `
        <img src="${currentEvent.image}" alt="${currentEvent.title}" class="event-detail-hero-bg"
             onerror="this.style.display='none'">
        <div class="event-detail-hero-overlay"></div>
        <div class="container">
            <div class="event-detail-hero-content">
                <span class="event-detail-badge">${currentEvent.category}</span>
                <h1 class="event-detail-title">${currentEvent.title}</h1>
                <p class="event-detail-subtitle">${currentEvent.description}</p>
                <div class="event-detail-quick-info">
                    <div class="quick-info-item">
                        <span>📅</span>
                        <span>${formatDate(currentEvent.date)}</span>
                    </div>
                    <div class="quick-info-item">
                        <span>🕒</span>
                        <span>${currentEvent.time} - ${currentEvent.endTime}</span>
                    </div>
                    <div class="quick-info-item">
                        <span>📍</span>
                        <span>${currentEvent.location}</span>
                    </div>
                    <div class="quick-info-item">
                        <span>💰</span>
                        <span>${formatPrice(currentEvent.price)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Rendu des informations principales
function renderEventMainInfo() {
    const eventMainInfo = document.getElementById('eventMainInfo');
    if (!eventMainInfo || !currentEvent) return;
    
    const availableSpots = currentEvent.maxAttendees - currentEvent.currentAttendees;
    
    eventMainInfo.innerHTML = `
        <h2>À propos de cet événement</h2>
        <div class="event-description">
            <p>${currentEvent.fullDescription}</p>
        </div>
        
        ${currentEvent.artists && currentEvent.artists.length > 0 ? `
            <div class="event-details-section">
                <h3>Intervenants / Artistes</h3>
                <ul>
                    ${currentEvent.artists.map(artist => `<li>${artist}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        <div class="event-details-section">
            <h3>Informations pratiques</h3>
            <div class="event-info-grid">
                <div class="info-item">
                    <strong>Organisateur :</strong> ${currentEvent.organizer}
                </div>
                <div class="info-item">
                    <strong>Capacité :</strong> ${currentEvent.maxAttendees} personnes
                </div>
                <div class="info-item">
                    <strong>Places disponibles :</strong> 
                    <span class="${availableSpots <= 0 ? 'text-danger' : 'text-success'}">
                        ${availableSpots > 0 ? `${availableSpots} places` : 'Complet'}
                    </span>
                </div>
                <div class="info-item">
                    <strong>Statut :</strong> 
                    <span class="text-success">Ouvert aux réservations</span>
                </div>
            </div>
        </div>
        
        ${currentEvent.tags && currentEvent.tags.length > 0 ? `
            <div class="event-details-section">
                <h3>Tags</h3>
                <div class="event-tags">
                    ${currentEvent.tags.map(tag => `<span class="event-tag">#${tag}</span>`).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

// Rendu de la carte d'informations
function renderEventCardInfo() {
    const eventCardInfo = document.getElementById('eventCardInfo');
    if (!eventCardInfo || !currentEvent) return;
    
    eventCardInfo.innerHTML = `
        <h3>Informations</h3>
        <div class="event-info-list">
            <div class="event-info-item">
                <span class="info-icon">📅</span>
                <div class="info-content">
                    <div class="info-label">Date</div>
                    <div class="info-value">${formatDate(currentEvent.date)}</div>
                </div>
            </div>
            <div class="event-info-item">
                <span class="info-icon">🕒</span>
                <div class="info-content">
                    <div class="info-label">Horaires</div>
                    <div class="info-value">${currentEvent.time} - ${currentEvent.endTime}</div>
                </div>
            </div>
            <div class="event-info-item">
                <span class="info-icon">📍</span>
                <div class="info-content">
                    <div class="info-label">Lieu</div>
                    <div class="info-value">${currentEvent.location}</div>
                </div>
            </div>
            <div class="event-info-item">
                <span class="info-icon">💰</span>
                <div class="info-content">
                    <div class="info-label">Prix</div>
                    <div class="info-value">${formatPrice(currentEvent.price)}</div>
                </div>
            </div>
            <div class="event-info-item">
                <span class="info-icon">👥</span>
                <div class="info-content">
                    <div class="info-label">Participants</div>
                    <div class="info-value">${currentEvent.currentAttendees}/${currentEvent.maxAttendees}</div>
                </div>
            </div>
        </div>
    `;
}

// Rendu des événements similaires
function renderSimilarEvents() {
    const similarEventsList = document.getElementById('similarEventsList');
    if (!similarEventsList || !currentEvent) return;
    
    // Trouver des événements similaires (même catégorie, exclure l'événement actuel)
    let similarEvents = mockEventsData
        .filter(event => 
            event.id !== currentEvent.id && 
            event.category === currentEvent.category
        );
    
    // Si pas assez d'événements de la même catégorie, ajouter d'autres événements
    if (similarEvents.length < 4) {
        const otherEvents = mockEventsData
            .filter(event => 
                event.id !== currentEvent.id && 
                !similarEvents.find(similar => similar.id === event.id)
            )
            .slice(0, 4 - similarEvents.length);
        similarEvents = [...similarEvents, ...otherEvents];
    }
    
    similarEvents = similarEvents.slice(0, 4);
    
    if (similarEvents.length === 0) {
        similarEventsList.innerHTML = '<p class="text-center">Aucun événement similaire trouvé.</p>';
        return;
    }
    
    similarEventsList.innerHTML = similarEvents
        .map(event => `
            <div class="similar-event-item" onclick="goToEventDetail(${event.id})">
                <img src="${event.image}" alt="${event.title}" class="similar-event-image"
                     onerror="this.src='https://via.placeholder.com/280x120?text=Event'">
                <div class="similar-event-info">
                    <div class="similar-event-title">${event.title}</div>
                    <div class="similar-event-date">${formatDate(event.date).split(' ').slice(0, 3).join(' ')}</div>
                    <div class="similar-event-price ${event.price === 0 ? 'free' : ''}">${formatPrice(event.price)}</div>
                </div>
            </div>
        `)
        .join('');
}

// Navigation vers un autre événement
function goToEventDetail(eventId) {
    window.location.href = `event-detail.html?id=${eventId}`;
}

// Gestion du bouton like
function updateLikeButton() {
    const likeBtn = document.getElementById('likeBtn');
    if (!likeBtn || !currentEvent) return;
    
    const isLiked = isEventLiked(currentEvent.id);
    
    likeBtn.classList.toggle('liked', isLiked);
    likeBtn.innerHTML = `
        <span class="like-icon">♥</span>
        <span class="like-text">${isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
    `;
}

// Gestion du bouton de réservation
function updateBookingButton() {
    const bookTicketBtn = document.getElementById('bookTicketBtn');
    if (!bookTicketBtn || !currentEvent) return;
    
    const availableSpots = currentEvent.maxAttendees - currentEvent.currentAttendees;
    
    if (availableSpots <= 0) {
        bookTicketBtn.textContent = 'Complet';
        bookTicketBtn.disabled = true;
        bookTicketBtn.classList.add('btn-disabled');
    } else {
        bookTicketBtn.textContent = 'Prendre mon billet';
        bookTicketBtn.disabled = false;
        bookTicketBtn.classList.remove('btn-disabled');
    }
}

// Gestion des actions
async function handleLikeEvent() {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    const newLikedState = await toggleEventLike(currentEvent.id);
    if (newLikedState !== null) {
        updateLikeButton();
    }
}

function handleBookTicket() {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    const availableSpots = currentEvent.maxAttendees - currentEvent.currentAttendees;
    if (availableSpots <= 0) {
        FornapUtils.showMessage('error', 'Cet événement est complet');
        return;
    }
    
    // Rediriger vers la page de paiement
    window.location.href = `event-payment.html?id=${currentEvent.id}`;
}

// Modal de connexion
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Initialisation des event listeners
function initEventListeners() {
    // Bouton like
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', handleLikeEvent);
    }
    
    // Bouton réservation
    const bookTicketBtn = document.getElementById('bookTicketBtn');
    if (bookTicketBtn) {
        bookTicketBtn.addEventListener('click', handleBookTicket);
    }
    
    // Modal de connexion
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const loginModalBtn = document.getElementById('loginModalBtn');
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideLoginModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', hideLoginModal);
    if (loginModalBtn) {
        loginModalBtn.addEventListener('click', () => {
            window.location.href = '../../pages/login.html';
        });
    }
    
    // Fermer modal en cliquant sur l'overlay
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideLoginModal();
            }
        });
    }
}

// Gestion de l'authentification
function handleAuthStateChange(user) {
    console.log('📝 État auth changé:', user ? 'connecté' : 'déconnecté');
    
    if (user) {
        currentUser = user;
        console.log('👤 Utilisateur connecté:', user.email);
        updateLikeButton();
        updateBookingButton();
    } else {
        currentUser = null;
        console.log('👤 Utilisateur déconnecté');
        updateLikeButton();
        updateBookingButton();
    }
}

// Chargement de l'événement
function loadEvent() {
    eventId = getEventIdFromURL();
    
    if (!eventId) {
        FornapUtils.showMessage('error', 'ID d\'événement manquant');
        setTimeout(() => {
            window.location.href = 'evenements.html';
        }, 2000);
        return;
    }
    
    currentEvent = mockEventsData.find(event => event.id === eventId);
    
    if (!currentEvent) {
        FornapUtils.showMessage('error', 'Événement non trouvé');
        setTimeout(() => {
            window.location.href = 'evenements.html';
        }, 2000);
        return;
    }
    
    // Mettre à jour le titre de la page
    document.title = `${currentEvent.title} - FORNAP`;
    
    // Rendre les composants
    renderEventHero();
    renderEventMainInfo();
    renderEventCardInfo();
    renderSimilarEvents();
    updateLikeButton();
    updateBookingButton();
}

// Initialisation de la page
async function initPage() {
    console.log('✅ Initialisation page détail événement');
    
    try {
        loadEvent();
        initEventListeners();
        console.log('🎯 Page détail événement prête !');
        
    } catch (error) {
        console.error('❌ Erreur initialisation page détail événement:', error);
        FornapUtils.showMessage('error', 'Erreur lors du chargement de l\'événement');
    }
}

// Initialisation générale
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ DOM chargé - Détail Événement');

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