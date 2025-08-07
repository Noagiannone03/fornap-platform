/**
 * FORNAP Admin - Module Événements
 * Gestion complète des événements du dashboard admin
 */

class FornapEventsModule {
    constructor() {
        this.container = null;
        this.currentView = 'list'; // list, create, edit, stats
        this.events = [];
        this.filteredEvents = [];
        this.currentPage = 1;
        this.eventsPerPage = 10;
        this.filters = {
            search: '',
            status: 'all',
            category: 'all',
            dateRange: 'all'
        };
        this.selectedEvents = new Set();
        
        // Configuration des catégories d'événements
        this.eventCategories = {
            'musique': 'Musique',
            'conference': 'Conférence',
            'atelier': 'Atelier',
            'networking': 'Networking',
            'formation': 'Formation',
            'expo': 'Exposition',
            'autre': 'Autre'
        };
        
        // Configuration des statuts
        this.eventStatuses = {
            'draft': 'Brouillon',
            'published': 'Publié',
            'cancelled': 'Annulé',
            'completed': 'Terminé'
        };
    }

    /**
     * Charge le module dans le container
     */
    async load(container) {
        this.container = container;
        
        try {
            // Vérifier les permissions
            if (!window.FornapAdminAuth.hasPermission('events.read')) {
                this.showNoPermission();
                return;
            }
            
            // Charger les données
            await this.loadEvents();
            
            // Afficher la vue liste par défaut
            this.showListView();
            
            console.log('✅ Module événements chargé');
        } catch (error) {
            console.error('❌ Erreur chargement module événements:', error);
            this.showError('Erreur lors du chargement des événements');
        }
    }

    /**
     * Affiche la vue liste des événements
     */
    showListView() {
        this.currentView = 'list';
        
        const html = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Gestion des Événements</h2>
                    <p class="module-subtitle">${this.events.length} événement(s) total</p>
                </div>
                <div class="module-actions">
                    <button class="btn-admin btn-primary" onclick="FornapEventsModule.showCreateView()">
                        ➕ Nouvel Événement
                    </button>
                    <button class="btn-admin btn-secondary" onclick="FornapEventsModule.showStatsView()">
                        📊 Statistiques
                    </button>
                </div>
            </div>

            <div class="admin-toolbar">
                <div class="toolbar-left">
                    <div class="search-box">
                        <span class="search-icon">🔍</span>
                        <input type="text" 
                               class="search-input" 
                               placeholder="Rechercher un événement..."
                               id="eventSearch"
                               value="${this.filters.search}">
                    </div>
                    
                    <div class="filter-group">
                        <select class="filter-select" id="statusFilter">
                            <option value="all">Tous les statuts</option>
                            ${Object.entries(this.eventStatuses).map(([key, value]) => 
                                `<option value="${key}" ${this.filters.status === key ? 'selected' : ''}>${value}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <select class="filter-select" id="categoryFilter">
                            <option value="all">Toutes les catégories</option>
                            ${Object.entries(this.eventCategories).map(([key, value]) => 
                                `<option value="${key}" ${this.filters.category === key ? 'selected' : ''}>${value}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="toolbar-right">
                    <button class="btn-admin btn-secondary" onclick="FornapEventsModule.exportEvents()">
                        💾 Exporter
                    </button>
                    ${this.selectedEvents.size > 0 ? `
                        <button class="btn-admin btn-error" onclick="FornapEventsModule.deleteSelected()">
                            🗑️ Supprimer (${this.selectedEvents.size})
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="data-grid">
                <div class="data-grid-header">
                    <h3 class="data-grid-title">Liste des Événements</h3>
                    <span class="data-grid-count">${this.filteredEvents.length}</span>
                </div>
                <div class="data-grid-body events-grid" id="eventsGrid">
                    ${this.generateEventsGrid()}
                </div>
            </div>

            ${this.generatePagination()}
        `;
        
        this.container.innerHTML = html;
        this.setupEventListeners();
    }

    /**
     * Génère la grille des événements
     */
    generateEventsGrid() {
        if (this.filteredEvents.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🎫</div>
                    <h3>Aucun événement trouvé</h3>
                    <p>Créez votre premier événement pour commencer</p>
                    <button class="btn-admin btn-primary" onclick="FornapEventsModule.showCreateView()">
                        Créer un événement
                    </button>
                </div>
            `;
        }

        const startIndex = (this.currentPage - 1) * this.eventsPerPage;
        const endIndex = startIndex + this.eventsPerPage;
        const pageEvents = this.filteredEvents.slice(startIndex, endIndex);

        return pageEvents.map(event => `
            <div class="data-row" data-event-id="${event.id}">
                <div class="data-cell">
                    <input type="checkbox" 
                           onchange="FornapEventsModule.toggleEventSelection('${event.id}')"
                           ${this.selectedEvents.has(event.id) ? 'checked' : ''}>
                </div>
                
                <div class="data-cell">
                    <div class="data-avatar" style="background-image: url('${event.image || ''}')">
                        ${event.image ? '' : event.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="data-main">${event.title}</div>
                        <div class="data-sub">${event.category ? this.eventCategories[event.category] : ''}</div>
                    </div>
                </div>
                
                <div class="data-cell">
                    <div class="data-main">${this.formatDate(event.date)}</div>
                    <div class="data-sub">${event.time || 'Non défini'}</div>
                </div>
                
                <div class="data-cell">
                    <span class="status-badge status-${event.status || 'draft'}">
                        ${this.eventStatuses[event.status] || 'Brouillon'}
                    </span>
                </div>
                
                <div class="data-cell">
                    <div class="data-main">${event.attendees || 0} / ${event.maxAttendees || '∞'}</div>
                    <div class="data-sub">${this.getAttendanceRate(event)}% rempli</div>
                </div>
                
                <div class="data-cell">
                    <div class="data-main">${event.price || 'Gratuit'}</div>
                    <div class="data-sub">${this.calculateRevenue(event)}€ revenus</div>
                </div>
                
                <div class="data-cell">
                    <div class="data-actions">
                        <button class="action-btn" 
                                onclick="FornapEventsModule.viewEvent('${event.id}')"
                                title="Voir">👁️</button>
                        <button class="action-btn" 
                                onclick="FornapEventsModule.editEvent('${event.id}')"
                                title="Modifier">✏️</button>
                        <button class="action-btn" 
                                onclick="FornapEventsModule.duplicateEvent('${event.id}')"
                                title="Dupliquer">📋</button>
                        <button class="action-btn danger" 
                                onclick="FornapEventsModule.deleteEvent('${event.id}')"
                                title="Supprimer">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Affiche la vue de création d'événement
     */
    showCreateView() {
        if (!window.FornapAdminAuth.hasPermission('events.write')) {
            window.AdminComponents.showNotification('error', 'Permission insuffisante');
            return;
        }

        this.currentView = 'create';
        
        const html = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Créer un Événement</h2>
                    <p class="module-subtitle">Ajoutez un nouvel événement à votre calendrier</p>
                </div>
                <div class="module-actions">
                    <button class="btn-admin btn-secondary" onclick="FornapEventsModule.showListView()">
                        ← Retour à la liste
                    </button>
                </div>
            </div>

            <form id="eventForm" class="event-form">
                <div class="form-section">
                    <h3 class="form-section-title">Informations Générales</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Titre de l'événement *</label>
                            <input type="text" name="title" class="form-input" required 
                                   placeholder="Ex: Concert Jazz au FORNAP">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Catégorie *</label>
                            <select name="category" class="form-select" required>
                                <option value="">Sélectionner une catégorie</option>
                                ${Object.entries(this.eventCategories).map(([key, value]) => 
                                    `<option value="${key}">${value}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea name="description" class="form-textarea" rows="4"
                                      placeholder="Décrivez votre événement..."></textarea>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section-title">Date et Lieu</h3>
                    
                    <div class="form-row triple">
                        <div class="form-group">
                            <label class="form-label">Date *</label>
                            <input type="date" name="date" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Heure de début</label>
                            <input type="time" name="startTime" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Heure de fin</label>
                            <input type="time" name="endTime" class="form-input">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Lieu</label>
                            <input type="text" name="location" class="form-input" 
                                   placeholder="Ex: Salle principale FORNAP">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Adresse</label>
                            <input type="text" name="address" class="form-input" 
                                   placeholder="Adresse complète (optionnel)">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section-title">Tarification et Capacité</h3>
                    
                    <div class="form-row triple">
                        <div class="form-group">
                            <label class="form-label">Prix (€)</label>
                            <input type="number" name="price" class="form-input" min="0" step="0.01"
                                   placeholder="0 pour gratuit">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Capacité maximale</label>
                            <input type="number" name="maxAttendees" class="form-input" min="1"
                                   placeholder="Laisser vide pour illimité">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Statut</label>
                            <select name="status" class="form-select">
                                <option value="draft">Brouillon</option>
                                <option value="published">Publié</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section-title">Média et Communication</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Image de l'événement</label>
                            <div class="image-upload" onclick="document.getElementById('eventImage').click()">
                                <div class="image-upload-icon">🖼️</div>
                                <div class="image-upload-text">Cliquez pour ajouter une image</div>
                                <input type="file" id="eventImage" name="image" accept="image/*" style="display: none;">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Tags (séparés par des virgules)</label>
                            <input type="text" name="tags" class="form-input" 
                                   placeholder="jazz, musique, soirée">
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn-admin btn-secondary" 
                            onclick="FornapEventsModule.showListView()">
                        Annuler
                    </button>
                    <button type="submit" class="btn-admin btn-primary">
                        Créer l'Événement
                    </button>
                </div>
            </form>
        `;
        
        this.container.innerHTML = html;
        this.setupFormListeners();
    }

    /**
     * Affiche la vue des statistiques
     */
    showStatsView() {
        if (!window.FornapAdminAuth.hasPermission('statistics.read')) {
            window.AdminComponents.showNotification('error', 'Permission insuffisante');
            return;
        }

        this.currentView = 'stats';
        
        const stats = this.calculateEventStats();
        
        const html = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Statistiques Événements</h2>
                    <p class="module-subtitle">Vue d'ensemble de vos événements</p>
                </div>
                <div class="module-actions">
                    <button class="btn-admin btn-secondary" onclick="FornapEventsModule.showListView()">
                        ← Retour à la liste
                    </button>
                    <button class="btn-admin btn-primary" onclick="FornapEventsModule.exportStats()">
                        📊 Exporter Stats
                    </button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🎫</div>
                    <div class="stat-info">
                        <h3>${stats.totalEvents}</h3>
                        <p>Événements Total</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <h3>${stats.totalAttendees}</h3>
                        <p>Participants Total</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <h3>${stats.totalRevenue}€</h3>
                        <p>Revenus Total</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-info">
                        <h3>${stats.averageAttendance}%</h3>
                        <p>Taux Moyen</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-widgets">
                <div class="widget">
                    <h3>Événements par Catégorie</h3>
                    <div class="category-stats">
                        ${this.generateCategoryStats(stats.byCategory)}
                    </div>
                </div>
                
                <div class="widget">
                    <h3>Événements par Statut</h3>
                    <div class="status-stats">
                        ${this.generateStatusStats(stats.byStatus)}
                    </div>
                </div>
            </div>

            <div class="widget">
                <h3>Performances Récentes</h3>
                <div class="recent-events-stats">
                    ${this.generateRecentEventsStats()}
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    /**
     * Configure les event listeners
     */
    setupEventListeners() {
        // Recherche
        const searchInput = document.getElementById('eventSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Filtres
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
            });
        }
    }

    /**
     * Configure les listeners du formulaire
     */
    setupFormListeners() {
        const form = document.getElementById('eventForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEvent();
            });
        }

        // Upload d'image
        const imageInput = document.getElementById('eventImage');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }
    }

    /**
     * Applique les filtres aux événements
     */
    applyFilters() {
        this.filteredEvents = this.events.filter(event => {
            // Filtre recherche
            if (this.filters.search) {
                const search = this.filters.search.toLowerCase();
                const matchesSearch = 
                    event.title.toLowerCase().includes(search) ||
                    (event.description && event.description.toLowerCase().includes(search)) ||
                    (event.location && event.location.toLowerCase().includes(search));
                
                if (!matchesSearch) return false;
            }

            // Filtre statut
            if (this.filters.status !== 'all') {
                if ((event.status || 'draft') !== this.filters.status) return false;
            }

            // Filtre catégorie
            if (this.filters.category !== 'all') {
                if (event.category !== this.filters.category) return false;
            }

            return true;
        });

        this.currentPage = 1; // Reset à la première page
        this.refreshEventsGrid();
    }

    /**
     * Rafraîchit la grille des événements
     */
    refreshEventsGrid() {
        const grid = document.getElementById('eventsGrid');
        if (grid) {
            grid.innerHTML = this.generateEventsGrid();
        }

        // Mettre à jour le compteur
        const countElement = document.querySelector('.data-grid-count');
        if (countElement) {
            countElement.textContent = this.filteredEvents.length;
        }

        // Mettre à jour la pagination
        this.updatePagination();
    }

    /**
     * Charge les événements depuis Firebase
     */
    async loadEvents() {
        try {
            const db = window.FornapAuth.db;
            const snapshot = await db.collection('events')
                .orderBy('date', 'desc')
                .get();

            this.events = [];
            snapshot.forEach(doc => {
                this.events.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.filteredEvents = [...this.events];
            
        } catch (error) {
            console.error('❌ Erreur chargement événements:', error);
            throw error;
        }
    }

    /**
     * Sauvegarde un événement
     */
    async saveEvent(eventData = null) {
        try {
            if (!eventData) {
                // Récupérer depuis le formulaire
                const formData = new FormData(document.getElementById('eventForm'));
                eventData = Object.fromEntries(formData.entries());
            }

            // Validation
            if (!eventData.title || !eventData.category || !eventData.date) {
                window.AdminComponents.showNotification('error', 'Veuillez remplir tous les champs requis');
                return;
            }

            // Préparation des données
            const eventDoc = {
                ...eventData,
                createdAt: firebase.firestore.Timestamp.now(),
                updatedAt: firebase.firestore.Timestamp.now(),
                createdBy: window.FornapAdminAuth.getCurrentAdmin().uid,
                attendees: 0,
                price: parseFloat(eventData.price) || 0,
                maxAttendees: parseInt(eventData.maxAttendees) || null,
                tags: eventData.tags ? eventData.tags.split(',').map(t => t.trim()) : []
            };

            const db = window.FornapAuth.db;
            const docRef = await db.collection('events').add(eventDoc);

            window.AdminComponents.showNotification('success', 'Événement créé avec succès');
            
            // Recharger et retourner à la liste
            await this.loadEvents();
            this.showListView();

        } catch (error) {
            console.error('❌ Erreur sauvegarde événement:', error);
            window.AdminComponents.showNotification('error', 'Erreur lors de la sauvegarde');
        }
    }

    /**
     * Supprime un événement
     */
    async deleteEvent(eventId) {
        if (!window.FornapAdminAuth.hasPermission('events.delete')) {
            window.AdminComponents.showNotification('error', 'Permission insuffisante');
            return;
        }

        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        window.AdminComponents.showConfirmModal({
            title: 'Supprimer l\'événement',
            message: `Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`,
            type: 'danger',
            confirmText: 'Supprimer',
            onConfirm: async () => {
                try {
                    const db = window.FornapAuth.db;
                    await db.collection('events').doc(eventId).delete();
                    
                    window.AdminComponents.showNotification('success', 'Événement supprimé');
                    await this.loadEvents();
                    this.refreshEventsGrid();
                } catch (error) {
                    console.error('❌ Erreur suppression:', error);
                    window.AdminComponents.showNotification('error', 'Erreur lors de la suppression');
                }
            }
        });
    }

    /**
     * Calcule les statistiques des événements
     */
    calculateEventStats() {
        const stats = {
            totalEvents: this.events.length,
            totalAttendees: this.events.reduce((sum, e) => sum + (e.attendees || 0), 0),
            totalRevenue: this.events.reduce((sum, e) => sum + ((e.attendees || 0) * (e.price || 0)), 0),
            averageAttendance: 0,
            byCategory: {},
            byStatus: {}
        };

        // Stats par catégorie
        Object.keys(this.eventCategories).forEach(cat => {
            stats.byCategory[cat] = this.events.filter(e => e.category === cat).length;
        });

        // Stats par statut
        Object.keys(this.eventStatuses).forEach(status => {
            stats.byStatus[status] = this.events.filter(e => (e.status || 'draft') === status).length;
        });

        // Taux de participation moyen
        const eventsWithCapacity = this.events.filter(e => e.maxAttendees > 0);
        if (eventsWithCapacity.length > 0) {
            const totalRate = eventsWithCapacity.reduce((sum, e) => 
                sum + ((e.attendees || 0) / e.maxAttendees * 100), 0
            );
            stats.averageAttendance = Math.round(totalRate / eventsWithCapacity.length);
        }

        return stats;
    }

    // Méthodes utilitaires
    formatDate(dateString) {
        if (!dateString) return 'Non défini';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    }

    getAttendanceRate(event) {
        if (!event.maxAttendees || event.maxAttendees === 0) return 0;
        return Math.round(((event.attendees || 0) / event.maxAttendees) * 100);
    }

    calculateRevenue(event) {
        return ((event.attendees || 0) * (event.price || 0)).toFixed(2);
    }

    generatePagination() {
        // Implementation pagination
        return '<div class="pagination-container"></div>';
    }

    generateCategoryStats(byCategory) {
        return Object.entries(byCategory)
            .map(([cat, count]) => `
                <div class="stat-item">
                    <span class="stat-label">${this.eventCategories[cat]}</span>
                    <span class="stat-value">${count}</span>
                </div>
            `).join('');
    }

    generateStatusStats(byStatus) {
        return Object.entries(byStatus)
            .map(([status, count]) => `
                <div class="stat-item">
                    <span class="stat-label">${this.eventStatuses[status]}</span>
                    <span class="stat-value">${count}</span>
                </div>
            `).join('');
    }

    generateRecentEventsStats() {
        // Implementation stats récentes
        return '<div>Statistiques récentes...</div>';
    }

    showNoPermission() {
        this.container.innerHTML = `
            <div class="no-permission">
                <h2>Accès non autorisé</h2>
                <p>Vous n'avez pas les permissions nécessaires pour accéder à ce module.</p>
            </div>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="error-state">
                <h2>Erreur</h2>
                <p>${message}</p>
                <button class="btn-admin btn-primary" onclick="location.reload()">
                    Recharger
                </button>
            </div>
        `;
    }

    // Méthodes statiques pour les event handlers globaux
    static async showCreateView() {
        return window.FornapEventsModule?.showCreateView();
    }

    static async showListView() {
        return window.FornapEventsModule?.showListView();
    }

    static async showStatsView() {
        return window.FornapEventsModule?.showStatsView();
    }

    static async deleteEvent(id) {
        return window.FornapEventsModule?.deleteEvent(id);
    }

    static async editEvent(id) {
        // Implementation edit
    }

    static async viewEvent(id) {
        // Implementation view
    }

    static async duplicateEvent(id) {
        // Implementation duplicate
    }

    static toggleEventSelection(id) {
        // Implementation selection
    }

    static deleteSelected() {
        // Implementation delete multiple
    }

    static exportEvents() {
        // Implementation export
    }

    static exportStats() {
        // Implementation export stats
    }
}

// Instance globale
const fornapEventsModule = new FornapEventsModule();
window.FornapEventsModule = fornapEventsModule;

console.log('✅ Module événements chargé');