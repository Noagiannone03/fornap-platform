/**
 * FORNAP Admin - Module Utilisateurs
 * Gestion complète des utilisateurs et membres du dashboard admin
 */

class FornapUsersModule {
    constructor() {
        this.container = null;
        this.currentView = 'list'; // list, profile, stats, export
        this.users = [];
        this.filteredUsers = [];
        this.currentPage = 1;
        this.usersPerPage = 15;
        this.filters = {
            search: '',
            status: 'all',
            plan: 'all',
            dateRange: 'all'
        };
        this.selectedUsers = new Set();
        this.selectedUser = null;
        
        // Configuration des statuts d'abonnement
        this.subscriptionStatuses = {
            'active': 'Actif',
            'pending': 'En attente',
            'expired': 'Expiré',
            'cancelled': 'Annulé',
            'none': 'Aucun'
        };
        
        // Configuration des plans d'abonnement
        this.subscriptionPlans = {
            'mensuel': 'Membre Mensuel',
            'annuel': 'Membre Annuel',
            'honneur': 'Membre d\'Honneur'
        };
    }

    /**
     * Charge le module dans le container
     */
    async load(container) {
        this.container = container;
        
        try {
            // Vérifier les permissions
            if (!window.FornapAdminAuth.hasPermission('users.read')) {
                this.showNoPermission();
                return;
            }
            
            // Charger les données
            await this.loadUsers();
            
            // Afficher la vue liste par défaut
            this.showListView();
            
            console.log('✅ Module utilisateurs chargé');
        } catch (error) {
            console.error('❌ Erreur chargement module utilisateurs:', error);
            this.showError('Erreur lors du chargement des utilisateurs');
        }
    }

    /**
     * Affiche la vue liste des utilisateurs
     */
    showListView() {
        this.currentView = 'list';
        
        const html = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Gestion des Utilisateurs</h2>
                    <p class="module-subtitle">${this.users.length} utilisateur(s) total</p>
                </div>
                <div class="module-actions">
                    <button class="btn-admin btn-primary" onclick="FornapUsersModule.showExportView()">
                        💾 Exporter Données
                    </button>
                    <button class="btn-admin btn-secondary" onclick="FornapUsersModule.showStatsView()">
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
                               placeholder="Rechercher un utilisateur..."
                               id="userSearch"
                               value="${this.filters.search}">
                    </div>
                    
                    <div class="filter-group">
                        <select class="filter-select" id="statusFilter">
                            <option value="all">Tous les statuts</option>
                            ${Object.entries(this.subscriptionStatuses).map(([key, value]) => 
                                `<option value="${key}" ${this.filters.status === key ? 'selected' : ''}>${value}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <select class="filter-select" id="planFilter">
                            <option value="all">Tous les plans</option>
                            ${Object.entries(this.subscriptionPlans).map(([key, value]) => 
                                `<option value="${key}" ${this.filters.plan === key ? 'selected' : ''}>${value}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <select class="filter-select" id="dateFilter">
                            <option value="all">Toutes les dates</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="week">Cette semaine</option>
                            <option value="month">Ce mois</option>
                            <option value="year">Cette année</option>
                        </select>
                    </div>
                </div>
                
                <div class="toolbar-right">
                    <button class="btn-admin btn-secondary" onclick="FornapUsersModule.exportUsersList()">
                        📄 Export CSV
                    </button>
                    ${this.selectedUsers.size > 0 ? `
                        <button class="btn-admin btn-primary" onclick="FornapUsersModule.sendBulkEmail()">
                            📧 Email Groupe (${this.selectedUsers.size})
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="data-grid">
                <div class="data-grid-header">
                    <h3 class="data-grid-title">Liste des Utilisateurs</h3>
                    <span class="data-grid-count">${this.filteredUsers.length}</span>
                </div>
                <div class="data-grid-body users-grid" id="usersGrid">
                    ${this.generateUsersGrid()}
                </div>
            </div>

            ${this.generatePagination()}
        `;
        
        this.container.innerHTML = html;
        this.setupEventListeners();
    }

    /**
     * Génère la grille des utilisateurs
     */
    generateUsersGrid() {
        if (this.filteredUsers.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>Aucun utilisateur trouvé</h3>
                    <p>Aucun utilisateur ne correspond aux critères de recherche</p>
                </div>
            `;
        }

        const startIndex = (this.currentPage - 1) * this.usersPerPage;
        const endIndex = startIndex + this.usersPerPage;
        const pageUsers = this.filteredUsers.slice(startIndex, endIndex);

        return pageUsers.map(user => `
            <div class="data-row" data-user-id="${user.id}">
                <div class="data-cell">
                    <input type="checkbox" 
                           onchange="FornapUsersModule.toggleUserSelection('${user.id}')"
                           ${this.selectedUsers.has(user.id) ? 'checked' : ''}>
                </div>
                
                <div class="data-cell">
                    <div class="data-avatar">
                        ${this.getUserInitials(user)}
                    </div>
                    <div>
                        <div class="data-main">${this.getUserDisplayName(user)}</div>
                        <div class="data-sub">${user.email}</div>
                    </div>
                </div>
                
                <div class="data-cell">
                    <div class="data-main">${user.phone || 'Non défini'}</div>
                    <div class="data-sub">${user.city || 'Ville non définie'}</div>
                </div>
                
                <div class="data-cell">
                    <span class="status-badge status-${this.getSubscriptionStatus(user)}">
                        ${this.subscriptionStatuses[this.getSubscriptionStatus(user)] || 'Aucun'}
                    </span>
                    <div class="data-sub">${this.getUserPlan(user)}</div>
                </div>
                
                <div class="data-cell">
                    <div class="data-main">${this.formatDate(user.createdAt)}</div>
                    <div class="data-sub">${this.getTimeSinceJoined(user)}</div>
                </div>
                
                <div class="data-cell">
                    <div class="data-main">${user.stats?.events || 0} événements</div>
                    <div class="data-sub">${user.loyalty?.points || 0} points</div>
                </div>
                
                <div class="data-cell">
                    <div class="data-actions">
                        <button class="action-btn" 
                                onclick="FornapUsersModule.viewUserProfile('${user.id}')"
                                title="Voir profil">👁️</button>
                        <button class="action-btn" 
                                onclick="FornapUsersModule.editUser('${user.id}')"
                                title="Modifier">✏️</button>
                        <button class="action-btn" 
                                onclick="FornapUsersModule.sendEmail('${user.id}')"
                                title="Envoyer email">📧</button>
                        <button class="action-btn" 
                                onclick="FornapUsersModule.exportUserData('${user.id}')"
                                title="Exporter données">💾</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Affiche la vue profil d'un utilisateur
     */
    async viewUserProfile(userId) {
        this.selectedUser = this.users.find(u => u.id === userId);
        if (!this.selectedUser) return;

        this.currentView = 'profile';
        
        // Charger les données détaillées de l'utilisateur
        try {
            const db = window.FornapAuth.db;
            
            // Charger les événements de l'utilisateur
            const eventsSnapshot = await db.collection('event_registrations')
                .where('userId', '==', userId)
                .orderBy('registeredAt', 'desc')
                .limit(10)
                .get();

            const userEvents = [];
            eventsSnapshot.forEach(doc => {
                userEvents.push(doc.data());
            });

            // Charger l'historique des paiements
            const paymentsSnapshot = await db.collection('payments')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            const userPayments = [];
            paymentsSnapshot.forEach(doc => {
                userPayments.push(doc.data());
            });

            const html = `
                <div class="module-header">
                    <div>
                        <h2 class="module-title">Profil Utilisateur</h2>
                        <p class="module-subtitle">${this.getUserDisplayName(this.selectedUser)}</p>
                    </div>
                    <div class="module-actions">
                        <button class="btn-admin btn-secondary" onclick="FornapUsersModule.showListView()">
                            ← Retour à la liste
                        </button>
                        <button class="btn-admin btn-primary" onclick="FornapUsersModule.editUser('${userId}')">
                            ✏️ Modifier
                        </button>
                    </div>
                </div>

                <div class="profile-container">
                    <div class="profile-sidebar">
                        <div class="profile-card">
                            <div class="profile-avatar-large">
                                ${this.getUserInitials(this.selectedUser)}
                            </div>
                            <h3>${this.getUserDisplayName(this.selectedUser)}</h3>
                            <p class="profile-email">${this.selectedUser.email}</p>
                            
                            <div class="profile-status">
                                <span class="status-badge status-${this.getSubscriptionStatus(this.selectedUser)}">
                                    ${this.subscriptionStatuses[this.getSubscriptionStatus(this.selectedUser)]}
                                </span>
                            </div>
                            
                            <div class="profile-stats">
                                <div class="profile-stat">
                                    <span class="stat-value">${this.selectedUser.stats?.events || 0}</span>
                                    <span class="stat-label">Événements</span>
                                </div>
                                <div class="profile-stat">
                                    <span class="stat-value">${this.selectedUser.loyalty?.points || 0}</span>
                                    <span class="stat-label">Points</span>
                                </div>
                                <div class="profile-stat">
                                    <span class="stat-value">${this.getTimeSinceJoined(this.selectedUser)}</span>
                                    <span class="stat-label">Membre depuis</span>
                                </div>
                            </div>
                            
                            <div class="profile-actions">
                                <button class="btn-admin btn-primary btn-sm" onclick="FornapUsersModule.sendEmail('${userId}')">
                                    📧 Envoyer Email
                                </button>
                                <button class="btn-admin btn-secondary btn-sm" onclick="FornapUsersModule.exportUserData('${userId}')">
                                    💾 Exporter Données
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-main">
                        <div class="profile-section">
                            <h4>Informations Personnelles</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">Nom complet</span>
                                    <span class="info-value">${this.getUserDisplayName(this.selectedUser)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Email</span>
                                    <span class="info-value">${this.selectedUser.email}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Téléphone</span>
                                    <span class="info-value">${this.selectedUser.phone || 'Non défini'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Ville</span>
                                    <span class="info-value">${this.selectedUser.city || 'Non définie'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Profession</span>
                                    <span class="info-value">${this.selectedUser.profession || 'Non définie'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Date d'inscription</span>
                                    <span class="info-value">${this.formatDate(this.selectedUser.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Abonnement</h4>
                            <div class="subscription-info">
                                <div class="subscription-card">
                                    <div class="subscription-header">
                                        <h5>${this.getUserPlan(this.selectedUser)}</h5>
                                        <span class="status-badge status-${this.getSubscriptionStatus(this.selectedUser)}">
                                            ${this.subscriptionStatuses[this.getSubscriptionStatus(this.selectedUser)]}
                                        </span>
                                    </div>
                                    <div class="subscription-details">
                                        <p><strong>Statut:</strong> ${this.getSubscriptionStatus(this.selectedUser)}</p>
                                        <p><strong>Début:</strong> ${this.formatDate(this.selectedUser.subscription?.startDate)}</p>
                                        <p><strong>Prochaine facture:</strong> ${this.formatDate(this.selectedUser.subscription?.nextBilling)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Événements Récents (${userEvents.length})</h4>
                            <div class="events-list">
                                ${userEvents.length === 0 ? 
                                    '<p>Aucun événement récent</p>' :
                                    userEvents.map(event => `
                                        <div class="event-item">
                                            <div class="event-info">
                                                <h6>${event.eventTitle || 'Événement'}</h6>
                                                <p>Inscrit le ${this.formatDate(event.registeredAt)}</p>
                                            </div>
                                            <span class="event-status status-${event.status || 'registered'}">
                                                ${event.status === 'attended' ? 'Participé' : 'Inscrit'}
                                            </span>
                                        </div>
                                    `).join('')
                                }
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Historique des Paiements (${userPayments.length})</h4>
                            <div class="payments-list">
                                ${userPayments.length === 0 ? 
                                    '<p>Aucun paiement récent</p>' :
                                    userPayments.map(payment => `
                                        <div class="payment-item">
                                            <div class="payment-info">
                                                <h6>${payment.description || 'Paiement'}</h6>
                                                <p>${this.formatDate(payment.createdAt)}</p>
                                            </div>
                                            <div class="payment-amount">
                                                <span class="amount">${payment.amount}€</span>
                                                <span class="payment-status status-${payment.status || 'completed'}">
                                                    ${payment.status === 'completed' ? 'Payé' : payment.status}
                                                </span>
                                            </div>
                                        </div>
                                    `).join('')
                                }
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            this.container.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Erreur chargement profil:', error);
            window.AdminComponents.showNotification('error', 'Erreur lors du chargement du profil');
        }
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
        
        const stats = this.calculateUserStats();
        
        const html = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Statistiques Utilisateurs</h2>
                    <p class="module-subtitle">Vue d'ensemble de votre communauté</p>
                </div>
                <div class="module-actions">
                    <button class="btn-admin btn-secondary" onclick="FornapUsersModule.showListView()">
                        ← Retour à la liste
                    </button>
                    <button class="btn-admin btn-primary" onclick="FornapUsersModule.exportStatsReport()">
                        📊 Exporter Rapport
                    </button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <h3>${stats.totalUsers}</h3>
                        <p>Utilisateurs Total</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-info">
                        <h3>${stats.activeMembers}</h3>
                        <p>Membres Actifs</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🆕</div>
                    <div class="stat-info">
                        <h3>${stats.newThisMonth}</h3>
                        <p>Nouveaux ce Mois</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <h3>${stats.totalRevenue}€</h3>
                        <p>Revenus Total</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-widgets">
                <div class="widget">
                    <h3>Répartition par Plan</h3>
                    <div class="plan-stats">
                        ${this.generatePlanStats(stats.byPlan)}
                    </div>
                </div>
                
                <div class="widget">
                    <h3>Évolution des Inscriptions</h3>
                    <div class="growth-stats">
                        ${this.generateGrowthStats(stats.growth)}
                    </div>
                </div>
            </div>

            <div class="widget">
                <h3>Utilisateurs les Plus Actifs</h3>
                <div class="top-users">
                    ${this.generateTopUsersStats(stats.topUsers)}
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    /**
     * Affiche la vue d'export des données
     */
    showExportView() {
        this.currentView = 'export';
        
        const html = `
            <div class="module-header">
                <div>
                    <h2 class="module-title">Export des Données</h2>
                    <p class="module-subtitle">Extraire les listes d'emails, téléphones et données utilisateurs</p>
                </div>
                <div class="module-actions">
                    <button class="btn-admin btn-secondary" onclick="FornapUsersModule.showListView()">
                        ← Retour à la liste
                    </button>
                </div>
            </div>

            <div class="export-container">
                <div class="export-section">
                    <h3>📧 Export des Emails</h3>
                    <p>Exporter les adresses email selon différents critères</p>
                    
                    <div class="export-options">
                        <div class="export-option">
                            <input type="checkbox" id="emailsAll" checked>
                            <label for="emailsAll">Tous les emails (${this.users.length})</label>
                        </div>
                        <div class="export-option">
                            <input type="checkbox" id="emailsActive">
                            <label for="emailsActive">Membres actifs seulement (${this.getActiveMembers().length})</label>
                        </div>
                        <div class="export-option">
                            <input type="checkbox" id="emailsNewsletter">
                            <label for="emailsNewsletter">Abonnés newsletter seulement</label>
                        </div>
                    </div>
                    
                    <div class="export-actions">
                        <button class="btn-admin btn-primary" onclick="FornapUsersModule.exportEmails()">
                            💾 Exporter CSV
                        </button>
                        <button class="btn-admin btn-secondary" onclick="FornapUsersModule.copyEmailsToClipboard()">
                            📋 Copier dans le Presse-papier
                        </button>
                    </div>
                </div>
                
                <div class="export-section">
                    <h3>📞 Export des Téléphones</h3>
                    <p>Exporter les numéros de téléphone disponibles</p>
                    
                    <div class="export-stats">
                        <p><strong>${this.getUsersWithPhone().length}</strong> utilisateurs ont un numéro de téléphone</p>
                    </div>
                    
                    <div class="export-actions">
                        <button class="btn-admin btn-primary" onclick="FornapUsersModule.exportPhones()">
                            💾 Exporter CSV
                        </button>
                        <button class="btn-admin btn-secondary" onclick="FornapUsersModule.copyPhonesToClipboard()">
                            📋 Copier dans le Presse-papier
                        </button>
                    </div>
                </div>
                
                <div class="export-section">
                    <h3>📊 Export Complet</h3>
                    <p>Exporter toutes les données utilisateurs avec profils complets</p>
                    
                    <div class="export-options">
                        <div class="export-option">
                            <input type="checkbox" id="includeProfile" checked>
                            <label for="includeProfile">Inclure les données de profil</label>
                        </div>
                        <div class="export-option">
                            <input type="checkbox" id="includeSubscription" checked>
                            <label for="includeSubscription">Inclure les informations d'abonnement</label>
                        </div>
                        <div class="export-option">
                            <input type="checkbox" id="includeStats" checked>
                            <label for="includeStats">Inclure les statistiques</label>
                        </div>
                    </div>
                    
                    <div class="export-actions">
                        <button class="btn-admin btn-primary" onclick="FornapUsersModule.exportCompleteData()">
                            💾 Export Complet CSV
                        </button>
                        <button class="btn-admin btn-secondary" onclick="FornapUsersModule.exportCompleteJSON()">
                            📄 Export JSON
                        </button>
                    </div>
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
        const searchInput = document.getElementById('userSearch');
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

        const planFilter = document.getElementById('planFilter');
        if (planFilter) {
            planFilter.addEventListener('change', (e) => {
                this.filters.plan = e.target.value;
                this.applyFilters();
            });
        }

        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.dateRange = e.target.value;
                this.applyFilters();
            });
        }
    }

    /**
     * Applique les filtres aux utilisateurs
     */
    applyFilters() {
        this.filteredUsers = this.users.filter(user => {
            // Filtre recherche
            if (this.filters.search) {
                const search = this.filters.search.toLowerCase();
                const matchesSearch = 
                    user.email.toLowerCase().includes(search) ||
                    (user.firstName && user.firstName.toLowerCase().includes(search)) ||
                    (user.lastName && user.lastName.toLowerCase().includes(search)) ||
                    (user.phone && user.phone.includes(search)) ||
                    (user.city && user.city.toLowerCase().includes(search));
                
                if (!matchesSearch) return false;
            }

            // Filtre statut
            if (this.filters.status !== 'all') {
                if (this.getSubscriptionStatus(user) !== this.filters.status) return false;
            }

            // Filtre plan
            if (this.filters.plan !== 'all') {
                const userPlan = user.subscription?.plan || 'none';
                if (userPlan !== this.filters.plan) return false;
            }

            // Filtre date
            if (this.filters.dateRange !== 'all') {
                const userDate = new Date(user.createdAt);
                const now = new Date();
                
                switch (this.filters.dateRange) {
                    case 'today':
                        if (!this.isSameDay(userDate, now)) return false;
                        break;
                    case 'week':
                        if (!this.isWithinWeek(userDate, now)) return false;
                        break;
                    case 'month':
                        if (!this.isWithinMonth(userDate, now)) return false;
                        break;
                    case 'year':
                        if (!this.isWithinYear(userDate, now)) return false;
                        break;
                }
            }

            return true;
        });

        this.currentPage = 1; // Reset à la première page
        this.refreshUsersGrid();
    }

    /**
     * Rafraîchit la grille des utilisateurs
     */
    refreshUsersGrid() {
        const grid = document.getElementById('usersGrid');
        if (grid) {
            grid.innerHTML = this.generateUsersGrid();
        }

        // Mettre à jour le compteur
        const countElement = document.querySelector('.data-grid-count');
        if (countElement) {
            countElement.textContent = this.filteredUsers.length;
        }

        // Mettre à jour la pagination
        this.updatePagination();
    }

    /**
     * Charge les utilisateurs depuis Firebase
     */
    async loadUsers() {
        try {
            const db = window.FornapAuth.db;
            
            // Charger depuis la collection 'users'
            const usersSnapshot = await db.collection('users')
                .orderBy('createdAt', 'desc')
                .get();

            this.users = [];
            usersSnapshot.forEach(doc => {
                this.users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.filteredUsers = [...this.users];
            
        } catch (error) {
            console.error('❌ Erreur chargement utilisateurs:', error);
            throw error;
        }
    }

    /**
     * Export la liste des emails
     */
    exportEmails() {
        let emailsToExport = [];
        
        if (document.getElementById('emailsAll').checked) {
            emailsToExport = this.users.map(u => u.email);
        } else if (document.getElementById('emailsActive').checked) {
            emailsToExport = this.getActiveMembers().map(u => u.email);
        }
        
        // Créer et télécharger le CSV
        const csvContent = emailsToExport.join('\n');
        this.downloadCSV('emails_fornap.csv', csvContent);
        
        window.AdminComponents.showNotification('success', `${emailsToExport.length} emails exportés`);
    }

    /**
     * Export la liste des téléphones
     */
    exportPhones() {
        const phonesToExport = this.getUsersWithPhone()
            .map(u => `${u.phone},${u.firstName} ${u.lastName},${u.email}`)
            .join('\n');
        
        const csvContent = 'Téléphone,Nom,Email\n' + phonesToExport;
        this.downloadCSV('telephones_fornap.csv', csvContent);
        
        window.AdminComponents.showNotification('success', 'Téléphones exportés');
    }

    /**
     * Export complet des données
     */
    exportCompleteData() {
        const headers = ['Email', 'Prénom', 'Nom', 'Téléphone', 'Ville', 'Statut', 'Plan', 'Date inscription'];
        const rows = this.users.map(user => [
            user.email,
            user.firstName || '',
            user.lastName || '',
            user.phone || '',
            user.city || '',
            this.subscriptionStatuses[this.getSubscriptionStatus(user)],
            this.getUserPlan(user),
            this.formatDate(user.createdAt)
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        this.downloadCSV('donnees_completes_fornap.csv', csvContent);
        window.AdminComponents.showNotification('success', 'Données complètes exportées');
    }

    /**
     * Calcule les statistiques des utilisateurs
     */
    calculateUserStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const stats = {
            totalUsers: this.users.length,
            activeMembers: this.getActiveMembers().length,
            newThisMonth: this.users.filter(u => new Date(u.createdAt) >= startOfMonth).length,
            totalRevenue: 0,
            byPlan: {},
            growth: {},
            topUsers: []
        };

        // Stats par plan
        Object.keys(this.subscriptionPlans).forEach(plan => {
            stats.byPlan[plan] = this.users.filter(u => 
                (u.subscription?.plan || 'none') === plan
            ).length;
        });

        return stats;
    }

    // Méthodes utilitaires
    getUserInitials(user) {
        const firstName = user.firstName || user.email.split('@')[0];
        const lastName = user.lastName || '';
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }

    getUserDisplayName(user) {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user.firstName || user.email.split('@')[0];
    }

    getSubscriptionStatus(user) {
        return user.subscription?.status || 'none';
    }

    getUserPlan(user) {
        const plan = user.subscription?.plan || 'none';
        return this.subscriptionPlans[plan] || 'Aucun plan';
    }

    getActiveMembers() {
        return this.users.filter(u => 
            this.getSubscriptionStatus(u) === 'active'
        );
    }

    getUsersWithPhone() {
        return this.users.filter(u => u.phone);
    }

    formatDate(dateString) {
        if (!dateString) return 'Non défini';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    }

    getTimeSinceJoined(user) {
        if (!user.createdAt) return 'Inconnu';
        
        const now = new Date();
        const joined = new Date(user.createdAt);
        const diffTime = Math.abs(now - joined);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return `${diffDays} jour(s)`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;
        return `${Math.floor(diffDays / 365)} an(s)`;
    }

    downloadCSV(filename, content) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Méthodes de vérification de date
    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    isWithinWeek(date, now) {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
    }

    isWithinMonth(date, now) {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
    }

    isWithinYear(date, now) {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return date >= yearAgo;
    }

    // Méthodes pour les handlers globaux
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

    generatePagination() {
        // Implementation pagination
        return '<div class="pagination-container"></div>';
    }

    updatePagination() {
        // Implementation mise à jour pagination
    }

    generatePlanStats(byPlan) {
        return Object.entries(byPlan)
            .map(([plan, count]) => `
                <div class="stat-item">
                    <span class="stat-label">${this.subscriptionPlans[plan] || plan}</span>
                    <span class="stat-value">${count}</span>
                </div>
            `).join('');
    }

    generateGrowthStats(growth) {
        return '<div>Graphique de croissance à implémenter</div>';
    }

    generateTopUsersStats(topUsers) {
        return '<div>Top utilisateurs à implémenter</div>';
    }

    // Méthodes statiques pour les event handlers globaux
    static showListView() {
        return window.FornapUsersModule?.showListView();
    }

    static showStatsView() {
        return window.FornapUsersModule?.showStatsView();
    }

    static showExportView() {
        return window.FornapUsersModule?.showExportView();
    }

    static viewUserProfile(id) {
        return window.FornapUsersModule?.viewUserProfile(id);
    }

    static editUser(id) {
        // Implementation edit
        window.AdminComponents.showNotification('info', 'Fonctionnalité en développement');
    }

    static sendEmail(id) {
        // Implementation send email
        window.AdminComponents.showNotification('info', 'Fonctionnalité en développement');
    }

    static exportUserData(id) {
        // Implementation export single user
        window.AdminComponents.showNotification('info', 'Fonctionnalité en développement');
    }

    static toggleUserSelection(id) {
        // Implementation selection
        if (window.FornapUsersModule.selectedUsers.has(id)) {
            window.FornapUsersModule.selectedUsers.delete(id);
        } else {
            window.FornapUsersModule.selectedUsers.add(id);
        }
        // Refresh UI if needed
    }

    static exportEmails() {
        return window.FornapUsersModule?.exportEmails();
    }

    static exportPhones() {
        return window.FornapUsersModule?.exportPhones();
    }

    static exportCompleteData() {
        return window.FornapUsersModule?.exportCompleteData();
    }

    static exportCompleteJSON() {
        // Implementation export JSON
        window.AdminComponents.showNotification('info', 'Fonctionnalité en développement');
    }

    static copyEmailsToClipboard() {
        // Implementation copy to clipboard
        window.AdminComponents.showNotification('info', 'Fonctionnalité en développement');
    }

    static copyPhonesToClipboard() {
        // Implementation copy to clipboard
        window.AdminComponents.showNotification('info', 'Fonctionnalité en développement');
    }

    static sendBulkEmail() {
        // Implementation bulk email
        window.AdminComponents.showNotification('info', 'Fonctionnalité en développement');
    }

    static exportUsersList() {
        return window.FornapUsersModule?.exportCompleteData();
    }

    static exportStatsReport() {
        // Implementation export stats
        window.AdminComponents.showNotification('info', 'Fonctionnalité en développement');
    }
}

// Instance globale
const fornapUsersModule = new FornapUsersModule();
window.FornapUsersModule = fornapUsersModule;

console.log('✅ Module utilisateurs chargé');