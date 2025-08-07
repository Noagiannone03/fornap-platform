/**
 * FORNAP Admin - Core Service
 * Service principal du dashboard admin
 * Gestion des modules, navigation, état global
 */

class FornapAdminCore {
    constructor() {
        this.currentModule = 'dashboard';
        this.modules = new Map();
        this.sidebarCollapsed = false;
        this.isMobile = window.innerWidth <= 768;
        this.mobileMenuOpen = false;
        this.loadingStates = new Map();
        this.globalData = {
            stats: {},
            cache: new Map()
        };
        
        // Configuration des modules
        this.moduleConfig = {
            dashboard: {
                name: 'Dashboard',
                icon: '📊',
                permission: 'statistics.read',
                component: null
            },
            events: {
                name: 'Événements',
                icon: '🎫',
                permission: 'events.read',
                component: null
            },
            users: {
                name: 'Utilisateurs',
                icon: '👥',
                permission: 'users.read',
                component: null
            },
            analytics: {
                name: 'Analytics',
                icon: '📈',
                permission: 'statistics.read',
                component: null
            },
            settings: {
                name: 'Paramètres',
                icon: '⚙️',
                permission: 'settings.read',
                component: null
            }
        };
        
        this.initialized = false;
    }

    /**
     * Initialise le dashboard admin
     */
    async init() {
        if (this.initialized) return;

        try {
            console.log('🚀 Initialisation du dashboard admin...');
            
            // Vérifier l'authentification admin
            if (!window.FornapAdminAuth.isAdmin()) {
                throw new Error('Authentification admin requise');
            }

            // Setup des event listeners
            this.setupEventListeners();
            
            // Charger l'interface
            await this.loadInterface();
            
            // Initialiser les modules
            await this.initializeModules();
            
            // Charger les données initiales
            await this.loadInitialData();
            
            // Afficher le dashboard
            this.showDashboard();
            
            this.initialized = true;
            console.log('✅ Dashboard admin initialisé');
            
        } catch (error) {
            console.error('❌ Erreur initialisation dashboard:', error);
            throw error;
        }
    }

    /**
     * Configure les event listeners principaux
     */
    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Profile dropdown
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('show');
            });
            
            document.addEventListener('click', () => {
                profileDropdown.classList.remove('show');
            });
        }

        // Responsive design
        window.addEventListener('resize', () => this.handleResize());
        
        // Détection de la visibilité de la page
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    /**
     * Charge l'interface utilisateur
     */
    async loadInterface() {
        // Générer la navigation
        this.generateNavigation();
        
        // Charger les informations utilisateur
        this.loadAdminUserInfo();
        
        // Setup breadcrumb initial
        this.updateBreadcrumb(['Dashboard']);
    }

    /**
     * Génère la navigation sidebar
     */
    generateNavigation() {
        const navMenu = document.getElementById('adminNavMenu');
        if (!navMenu) return;

        const adminAuth = window.FornapAdminAuth;
        let navHTML = '';

        for (const [moduleId, config] of Object.entries(this.moduleConfig)) {
            // Vérifier les permissions
            if (!adminAuth.hasPermission(config.permission) && !adminAuth.hasPermission('*')) {
                continue;
            }

            const isActive = moduleId === this.currentModule;
            navHTML += `
                <li class="nav-item">
                    <a href="#" class="nav-link ${isActive ? 'active' : ''}" 
                       data-module="${moduleId}">
                        <span class="nav-icon">${config.icon}</span>
                        <span class="nav-text">${config.name}</span>
                    </a>
                </li>
            `;
        }

        navMenu.innerHTML = navHTML;

        // Ajouter les event listeners
        navMenu.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link');
            if (link) {
                e.preventDefault();
                const moduleId = link.dataset.module;
                this.switchToModule(moduleId);
            }
        });
    }

    /**
     * Charge les informations utilisateur admin
     */
    loadAdminUserInfo() {
        const adminUserInfo = document.getElementById('adminUserInfo');
        const adminProfileName = document.getElementById('adminProfileName');
        
        const adminData = window.FornapAdminAuth.getCurrentAdmin();
        
        if (adminData && adminUserInfo) {
            const displayName = adminData.profile ? 
                `${adminData.profile.firstName} ${adminData.profile.lastName}`.trim() :
                adminData.email.split('@')[0];
                
            adminUserInfo.innerHTML = `
                <div class="admin-user-avatar">
                    ${displayName.charAt(0).toUpperCase()}
                </div>
                <div class="admin-user-details">
                    <div class="admin-user-name">${displayName}</div>
                    <div class="admin-user-role">${this.formatRole(adminData.role)}</div>
                </div>
            `;
        }
        
        if (adminProfileName && adminData) {
            adminProfileName.textContent = adminData.profile ? 
                `${adminData.profile.firstName} ${adminData.profile.lastName}`.trim() :
                adminData.email.split('@')[0];
        }
    }

    /**
     * Formate le rôle pour l'affichage
     */
    formatRole(role) {
        const roleNames = {
            'super_admin': 'Super Admin',
            'admin': 'Administrateur',
            'moderator': 'Modérateur',
            'editor': 'Éditeur'
        };
        
        return roleNames[role] || role;
    }

    /**
     * Initialise tous les modules disponibles
     */
    async initializeModules() {
        const modulePromises = [];
        
        for (const moduleId of Object.keys(this.moduleConfig)) {
            if (window.FornapAdminAuth.canAccessModule(moduleId)) {
                modulePromises.push(this.initializeModule(moduleId));
            }
        }
        
        await Promise.all(modulePromises);
    }

    /**
     * Initialise un module spécifique
     */
    async initializeModule(moduleId) {
        try {
            // Les modules seront chargés dynamiquement
            console.log(`📦 Module ${moduleId} prêt`);
        } catch (error) {
            console.error(`❌ Erreur initialisation module ${moduleId}:`, error);
        }
    }

    /**
     * Change de module actif
     */
    async switchToModule(moduleId) {
        if (moduleId === this.currentModule) return;
        
        try {
            console.log(`🔄 Changement vers module: ${moduleId}`);
            this.showLoading(`Chargement ${this.moduleConfig[moduleId].name}...`);
            
            // Désactiver le module actuel
            this.deactivateModule(this.currentModule);
            
            // Activer le nouveau module
            await this.activateModule(moduleId);
            
            // Mettre à jour l'état
            this.currentModule = moduleId;
            this.updateNavigation();
            this.updateBreadcrumb([this.moduleConfig[moduleId].name]);
            this.updatePageTitle(this.moduleConfig[moduleId].name);
            
            this.hideLoading();
            console.log(`✅ Module ${moduleId} activé avec succès`);
            
        } catch (error) {
            console.error(`❌ Erreur changement module:`, error);
            this.showNotification('error', 'Erreur lors du chargement du module');
            this.hideLoading();
        }
    }

    /**
     * Désactive un module
     */
    deactivateModule(moduleId) {
        if (!moduleId) return;
        
        const adminContent = document.getElementById('adminContent');
        if (!adminContent) return;
        
        const moduleContainer = adminContent.querySelector(`[data-module="${moduleId}"]`);
        if (moduleContainer) {
            moduleContainer.classList.remove('active');
            console.log(`🔻 Module ${moduleId} désactivé`);
        }
        
        // S'assurer que tous les autres modules sont aussi désactivés
        const allModules = adminContent.querySelectorAll('.module-container.active');
        allModules.forEach(container => {
            if (container.dataset.module !== moduleId) {
                container.classList.remove('active');
            }
        });
    }

    /**
     * Active un module
     */
    async activateModule(moduleId) {
        const adminContent = document.getElementById('adminContent');
        if (!adminContent) {
            console.error('❌ Zone de contenu admin non trouvée !');
            return;
        }

        let moduleContainer = adminContent.querySelector(`[data-module="${moduleId}"]`);
        
        // Si le module n'existe pas, le créer
        if (!moduleContainer) {
            console.log(`📦 Création du conteneur pour module: ${moduleId}`);
            moduleContainer = await this.createModuleContainer(moduleId);
        }
        
        console.log(`🔧 Chargement du contenu module: ${moduleId}`, moduleContainer);
        
        // Charger le contenu du module
        await this.loadModuleContent(moduleId, moduleContainer);
        
        // Activer le conteneur
        moduleContainer.classList.add('active');
        console.log(`✅ Module ${moduleId} activé dans:`, moduleContainer);
    }

    /**
     * Crée un conteneur pour un module
     */
    async createModuleContainer(moduleId) {
        const adminContent = document.getElementById('adminContent');
        const moduleContainer = document.createElement('div');
        
        moduleContainer.className = 'module-container';
        moduleContainer.setAttribute('data-module', moduleId);
        
        adminContent.appendChild(moduleContainer);
        return moduleContainer;
    }

    /**
     * Charge le contenu d'un module
     */
    async loadModuleContent(moduleId, container) {
        switch (moduleId) {
            case 'dashboard':
                await this.loadDashboardContent(container);
                break;
            case 'events':
                if (window.FornapEventsModule) {
                    await window.FornapEventsModule.load(container);
                }
                break;
            case 'users':
                if (window.FornapUsersModule) {
                    await window.FornapUsersModule.load(container);
                }
                break;
            default:
                container.innerHTML = `
                    <div class="module-placeholder">
                        <h2>${this.moduleConfig[moduleId].name}</h2>
                        <p>Module en cours de développement...</p>
                    </div>
                `;
        }
    }

    /**
     * Charge le contenu du dashboard principal
     */
    async loadDashboardContent(container) {
        if (!container.querySelector('.stats-grid')) {
            // Le HTML du dashboard est déjà dans la page
            return;
        }
    }

    /**
     * Charge les données initiales
     */
    async loadInitialData() {
        try {
            await this.loadGlobalStats();
            this.updateStatsDisplay();
        } catch (error) {
            console.error('❌ Erreur chargement données initiales:', error);
        }
    }

    /**
     * Charge les statistiques globales
     */
    async loadGlobalStats() {
        const db = window.FornapAuth.db;
        
        try {
            // Statistiques utilisateurs
            const usersSnapshot = await db.collection('users').get();
            this.globalData.stats.totalUsers = usersSnapshot.size;
            
            // Statistiques événements
            const eventsSnapshot = await db.collection('events').get();
            this.globalData.stats.totalEvents = eventsSnapshot.size;
            
            // Statistiques membres actifs (exemple)
            const activeMembers = await db.collection('users')
                .where('subscription.status', '==', 'active')
                .get();
            this.globalData.stats.activeMembers = activeMembers.size;
            
            // Revenus (placeholder)
            this.globalData.stats.totalRevenue = 0;
            
        } catch (error) {
            console.error('❌ Erreur chargement stats:', error);
            // Valeurs par défaut en cas d'erreur
            this.globalData.stats = {
                totalUsers: 0,
                totalEvents: 0,
                totalRevenue: 0,
                activeMembers: 0
            };
        }
    }

    /**
     * Met à jour l'affichage des statistiques
     */
    updateStatsDisplay() {
        const stats = this.globalData.stats;
        
        // Mettre à jour les cartes de stats
        this.updateStatCard('totalUsers', stats.totalUsers || 0);
        this.updateStatCard('totalEvents', stats.totalEvents || 0);
        this.updateStatCard('totalRevenue', stats.totalRevenue || 0);
        this.updateStatCard('activeMembers', stats.activeMembers || 0);
    }

    /**
     * Met à jour une carte de statistique
     */
    updateStatCard(statId, value) {
        const element = document.getElementById(statId);
        if (element) {
            // Animation du compteur
            this.animateCounter(element, value);
        }
    }

    /**
     * Anime un compteur numérique
     */
    animateCounter(element, targetValue) {
        const start = parseInt(element.textContent) || 0;
        const increment = (targetValue - start) / 30;
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (
                (increment > 0 && current >= targetValue) ||
                (increment < 0 && current <= targetValue)
            ) {
                current = targetValue;
                clearInterval(timer);
            }
            
            if (element.id === 'totalRevenue') {
                element.textContent = Math.floor(current) + '€';
            } else {
                element.textContent = Math.floor(current);
            }
        }, 50);
    }

    /**
     * Met à jour la navigation active
     */
    updateNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.module === this.currentModule) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Met à jour le breadcrumb
     */
    updateBreadcrumb(items) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;
        
        let breadcrumbHTML = '<span class="breadcrumb-home">Accueil</span>';
        
        items.forEach((item, index) => {
            if (index === items.length - 1) {
                breadcrumbHTML += `<span class="breadcrumb-separator"></span><span class="breadcrumb-current">${item}</span>`;
            } else {
                breadcrumbHTML += `<span class="breadcrumb-separator"></span><span>${item}</span>`;
            }
        });
        
        breadcrumb.innerHTML = breadcrumbHTML;
    }

    /**
     * Met à jour le titre de la page
     */
    updatePageTitle(title) {
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = title;
        }
        document.title = `${title} - FORNAP Admin`;
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        if (!sidebar) return;
        
        this.sidebarCollapsed = !this.sidebarCollapsed;
        sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
        
        // Sauvegarder la préférence
        localStorage.setItem('admin_sidebar_collapsed', this.sidebarCollapsed);
    }

    /**
     * Gestion responsive
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            // Transition mobile/desktop
            this.adjustForScreenSize();
        }
    }

    /**
     * Ajuste l'interface selon la taille d'écran
     */
    adjustForScreenSize() {
        const sidebar = document.querySelector('.admin-sidebar');
        if (!sidebar) return;
        
        if (this.isMobile) {
            sidebar.classList.remove('collapsed');
            this.sidebarCollapsed = false;
        }
    }

    /**
     * Gestion visibilité de la page
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Rafraîchir les données quand la page redevient visible
            this.refreshData();
        }
    }

    /**
     * Rafraîchit les données
     */
    async refreshData() {
        try {
            await this.loadGlobalStats();
            this.updateStatsDisplay();
        } catch (error) {
            console.error('❌ Erreur rafraîchissement données:', error);
        }
    }

    /**
     * Affiche le loader global
     */
    showLoading(message = 'Chargement...') {
        // Implementation loader
    }

    /**
     * Masque le loader global
     */
    hideLoading() {
        // Implementation hide loader
    }

    /**
     * Affiche une notification
     */
    showNotification(type, message, duration = 5000) {
        if (window.FornapComponents) {
            window.FornapComponents.showNotification(type, message, duration);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Affiche le dashboard après chargement
     */
    showDashboard() {
        const loader = document.getElementById('adminLoader');
        const dashboard = document.getElementById('adminDashboard');
        
        if (loader) loader.style.display = 'none';
        if (dashboard) dashboard.classList.remove('hidden');
    }

    /**
     * Gestion déconnexion
     */
    async handleLogout() {
        try {
            await window.FornapAdminAuth.signOutAdmin();
            window.location.href = '../index.html';
        } catch (error) {
            console.error('❌ Erreur déconnexion:', error);
        }
    }

    /**
     * Nettoie les ressources
     */
    destroy() {
        this.modules.clear();
        this.globalData.cache.clear();
        this.initialized = false;
    }
}

// Instance globale
const fornapAdminCore = new FornapAdminCore();

// Export global
window.FornapAdminCore = fornapAdminCore;

console.log('✅ Core admin chargé');