/**
 * FORNAP - Gestion des Événements
 * Page principale d'affichage des événements
 */

console.log('🎪 FORNAP - Événements');

// Variables globales
let currentUser = null;
let eventsData = [];
let filteredEvents = [];
let currentFilter = 'all';
let currentPage = 1;
const eventsPerPage = 9;

// Données fictives des événements
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

function isEventLiked(eventId) {
    if (!currentUser) return false;
    const likedEvents = JSON.parse(localStorage.getItem(`likedEvents_${currentUser.uid}`) || '[]');
    return likedEvents.includes(eventId);
}

async function toggleEventLike(eventId) {
    if (!currentUser) {
        FornapUtils.showMessage('error', 'Vous devez être connecté pour aimer un événement');
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

// Génération des cartes d'événements
function generateEventCard(event, isFeatured = false) {
    const isLiked = isEventLiked(event.id);
    const cardClass = isFeatured ? 'featured-event-card' : 'event-card';
    const contentClass = isFeatured ? 'featured-event-content' : 'event-card-content';
    const imageClass = isFeatured ? 'featured-event-image' : 'event-card-image';
    const titleClass = isFeatured ? 'featured-event-title' : 'event-card-title';
    const badgeClass = isFeatured ? 'featured-event-badge' : 'event-card-badge';
    const metaClass = isFeatured ? 'featured-event-meta' : 'event-card-meta';
    
    const availableSpots = event.maxAttendees - event.currentAttendees;
    const spotsText = availableSpots > 0 ? `${availableSpots} places disponibles` : 'Complet';
    const spotsClass = availableSpots > 0 ? '' : 'text-danger';
    
    if (isFeatured) {
        return `
            <div class="${cardClass}" onclick="goToEventDetail(${event.id})" data-event-id="${event.id}">
                <img src="${event.image}" alt="${event.title}" class="${imageClass}" 
                     onerror="this.src='https://via.placeholder.com/400x300?text=Événement'">
                <div class="${contentClass}">
                    <span class="${badgeClass}">${event.category}</span>
                    <h3 class="${titleClass}">${event.title}</h3>
                    <div class="${metaClass}">
                        <div class="event-meta-item">
                            <span class="event-meta-icon">📅</span>
                            <span>${formatDate(event.date).split(' ').slice(0, 3).join(' ')}</span>
                        </div>
                        <div class="event-meta-item">
                            <span class="event-meta-icon">🕒</span>
                            <span>${event.time}</span>
                        </div>
                        <div class="event-meta-item">
                            <span class="event-meta-icon">📍</span>
                            <span>${event.location}</span>
                        </div>
                        <div class="event-meta-item">
                            <span class="event-meta-icon">👥</span>
                            <span class="${spotsClass}">${spotsText}</span>
                        </div>
                    </div>
                    <p class="featured-event-description">${event.description}</p>
                    <div class="featured-event-price">
                        <span class="event-price ${event.price === 0 ? 'free' : ''}">${formatPrice(event.price)}</span>
                        <button class="featured-event-cta" onclick="event.stopPropagation(); goToEventDetail(${event.id})">
                            Découvrir
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="${cardClass}" onclick="goToEventDetail(${event.id})" data-event-id="${event.id}">
                <img src="${event.image}" alt="${event.title}" class="${imageClass}" 
                     onerror="this.src='https://via.placeholder.com/400x300?text=Événement'">
                <div class="${contentClass}">
                    <span class="${badgeClass}">${event.category}</span>
                    <h3 class="${titleClass}">${event.title}</h3>
                    <div class="${metaClass}">
                        <div class="event-meta-item">
                            <span>📅</span>
                            <span>${formatDate(event.date).split(' ').slice(0, 3).join(' ')}</span>
                        </div>
                        <div class="event-meta-item">
                            <span>🕒</span>
                            <span>${event.time}</span>
                        </div>
                        <div class="event-meta-item">
                            <span>📍</span>
                            <span>${event.location}</span>
                        </div>
                        <div class="event-meta-item">
                            <span>👥</span>
                            <span class="${spotsClass}">${spotsText}</span>
                        </div>
                    </div>
                    <div class="event-card-footer">
                        <span class="event-price ${event.price === 0 ? 'free' : ''}">${formatPrice(event.price)}</span>
                        <button class="event-card-like ${isLiked ? 'liked' : ''}" 
                                onclick="event.stopPropagation(); handleEventLike(${event.id}, this)" 
                                title="${isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                            ♥
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Gestion des likes
async function handleEventLike(eventId, buttonElement) {
    const wasLiked = buttonElement.classList.contains('liked');
    const newLikedState = await toggleEventLike(eventId);
    
    if (newLikedState !== null) {
        buttonElement.classList.toggle('liked', newLikedState);
        buttonElement.title = newLikedState ? 'Retirer des favoris' : 'Ajouter aux favoris';
    }
}

// Navigation vers le détail
function goToEventDetail(eventId) {
    window.location.href = `event-detail.html?id=${eventId}`;
}

// Filtrage des événements
function filterEvents(category) {
    currentFilter = category;
    currentPage = 1;
    
    // Mettre à jour les boutons de filtre
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        }
    });
    
    // Filtrer les données
    if (category === 'all') {
        filteredEvents = eventsData.filter(event => !event.featured);
    } else {
        filteredEvents = eventsData.filter(event => !event.featured && event.category === category);
    }
    
    renderEventsList();
    renderPagination();
}

// Recherche d'événements
function searchEvents(query) {
    const searchTerm = query.toLowerCase();
    
    if (!searchTerm) {
        filterEvents(currentFilter);
        return;
    }
    
    filteredEvents = eventsData.filter(event => 
        !event.featured && (
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.artists.some(artist => artist.toLowerCase().includes(searchTerm)) ||
            event.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
    );
    
    currentPage = 1;
    renderEventsList();
    renderPagination();
}

// Rendu des événements à la une
function renderFeaturedEvents() {
    const featuredEventsGrid = document.getElementById('featuredEventsGrid');
    if (!featuredEventsGrid) return;
    
    const featuredEvents = eventsData.filter(event => event.featured);
    
    if (featuredEvents.length === 0) {
        featuredEventsGrid.innerHTML = '<p class="text-center">Aucun événement à la une pour le moment.</p>';
        return;
    }
    
    featuredEventsGrid.innerHTML = featuredEvents
        .map(event => generateEventCard(event, true))
        .join('');
}

// Rendu de la liste des événements avec pagination
function renderEventsList() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const eventsToShow = filteredEvents.slice(startIndex, endIndex);
    
    if (eventsToShow.length === 0) {
        eventsGrid.innerHTML = '<p class="text-center">Aucun événement trouvé pour ce filtre.</p>';
        return;
    }
    
    eventsGrid.innerHTML = eventsToShow
        .map(event => generateEventCard(event, false))
        .join('');
}

// Rendu de la pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Bouton précédent
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            ←
        </button>
    `;
    
    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (Math.abs(i - currentPage) === 3) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }
    
    // Bouton suivant
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            →
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Changement de page
function changePage(page) {
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderEventsList();
    renderPagination();
    
    // Scroll vers le haut de la liste
    document.getElementById('eventsGrid').scrollIntoView({ behavior: 'smooth' });
}

// Gestion des messages
function showMessage(message, type = 'info') {
    FornapUtils.showMessage(type, message);
}

// Initialisation des événements
function initEventListeners() {
    // Recherche
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchEvents(e.target.value);
            }, 300);
        });
    }
    
    // Filtres
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterEvents(btn.dataset.filter);
        });
    });
}

// Gestion de l'authentification
function handleAuthStateChange(user) {
    console.log('📝 État auth changé:', user ? 'connecté' : 'déconnecté');
    
    if (user) {
        currentUser = user;
        console.log('👤 Utilisateur connecté:', user.email);
        
        // Recharger les événements pour mettre à jour les likes
        renderFeaturedEvents();
        renderEventsList();
    } else {
        currentUser = null;
        console.log('👤 Utilisateur déconnecté');
        
        // Recharger les événements pour cacher les likes
        renderFeaturedEvents();
        renderEventsList();
    }
}

// Initialisation de la page
async function initPage() {
    console.log('✅ Initialisation page événements');
    
    try {
        // Charger les données fictives
        eventsData = [...mockEventsData];
        filteredEvents = eventsData.filter(event => !event.featured);
        
        // Rendre les composants
        renderFeaturedEvents();
        renderEventsList();
        renderPagination();
        
        // Initialiser les event listeners
        initEventListeners();
        
        console.log('🎯 Page événements prête !');
        
    } catch (error) {
        console.error('❌ Erreur initialisation page événements:', error);
        showMessage('Erreur lors du chargement des événements', 'error');
    }
}

// Initialisation générale
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ DOM chargé - Événements');

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
                        showMessage('Déconnexion réussie', 'success');
                        setTimeout(() => window.location.href = '../../index.html', 1000);
                    } catch (error) {
                        console.error('❌ Erreur déconnexion:', error);
                        showMessage('Erreur lors de la déconnexion', 'error');
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
        showMessage('Erreur lors du chargement. Veuillez recharger la page.', 'error');
    }
});