/**
 * FORNAP - Composants Réutilisables
 * Navbar et Footer pour toutes les pages avec synchronisation globale
 */

class FornapComponents {
    
    constructor() {
        this.authState = null;
        this.isInitialized = false;
        this.authStateCallbacks = [];
    }

    /**
     * Initialise le système de composants avec état global
     */
    static init() {
        if (!window.FornapComponentsInstance) {
            window.FornapComponentsInstance = new FornapComponents();
        }
        return window.FornapComponentsInstance;
    }

    /**
     * Ajoute un callback pour les changements d'état d'auth
     */
    static onAuthStateChanged(callback) {
        const instance = FornapComponents.init();
        instance.authStateCallbacks.push(callback);
        
        // Si l'état est déjà connu, appeler immédiatement
        if (instance.authState !== null) {
            callback(instance.authState);
        }
    }

    /**
     * Met à jour l'état d'authentification globalement - CORRECTION À LA SOURCE
     */
    static updateAuthState(isAuthenticated) {
        const instance = FornapComponents.init();
        
        // Toujours mettre à jour, même si l'état semble identique (pour forcer la sync)
        instance.authState = isAuthenticated;
        
        // Sauvegarder l'état dans localStorage IMMÉDIATEMENT
        try {
            if (isAuthenticated) {
                localStorage.setItem('fornap_auth_state', 'true');
                localStorage.setItem('fornap_auth_timestamp', Date.now().toString());
            } else {
                localStorage.setItem('fornap_auth_state', 'false');
                localStorage.setItem('fornap_auth_timestamp', Date.now().toString());
            }
        } catch (e) {
            console.warn('Erreur sauvegarde état auth:', e);
        }
        
        // Synchroniser la navbar immédiatement
        FornapComponents.syncNavbarStateSmooth(isAuthenticated);

        // Notifier tous les callbacks
        instance.authStateCallbacks.forEach(callback => {
            try {
                callback(isAuthenticated);
            } catch (error) {
                console.error('❌ Erreur callback auth state:', error);
            }
        });
        
        console.log('🔄 État auth mis à jour globalement:', isAuthenticated);
    }

    /**
     * Synchronise l'état d'authentification (alias pour updateAuthState)
     */
    static syncAuthState(isAuthenticated) {
        FornapComponents.updateAuthState(isAuthenticated);
    }

    /**
     * Met à jour uniquement l'affichage de la navbar
     */
    static syncNavbarState(isAuthenticated) {
        const navbarAuth = document.getElementById('navbarAuth');
        const navbarMember = document.getElementById('navbarMember');

        if (navbarAuth && navbarMember) {
            if (isAuthenticated) {
                navbarAuth.classList.add('hidden');
                navbarMember.classList.remove('hidden');
            } else {
                navbarAuth.classList.remove('hidden');
                navbarMember.classList.add('hidden');
            }
            
            console.log('✅ État navbar mis à jour:', isAuthenticated ? 'connecté' : 'déconnecté');
        }
    }

    /**
     * Met à jour l'affichage de la navbar instantanément - CORRECTION À LA SOURCE
     */
    static syncNavbarStateSmooth(isAuthenticated) {
        const navbarAuth = document.getElementById('navbarAuth');
        const navbarMember = document.getElementById('navbarMember');

        if (navbarAuth && navbarMember) {
            // Synchronisation instantanée - pas d'animation qui cause des sauts
            if (isAuthenticated) {
                navbarAuth.classList.add('hidden');
                navbarMember.classList.remove('hidden');
            } else {
                navbarMember.classList.add('hidden');
                navbarAuth.classList.remove('hidden');
            }
            
            console.log('✅ État navbar mis à jour (instantané):', isAuthenticated ? 'connecté' : 'déconnecté');
        }
    }


    /**
     * Génère la navbar FORNAP avec état initial correct
     * @param {string} activePage - Page active pour le style
     * @param {string} basePath - Chemin de base pour les liens ('' pour racine, '../' pour sous-dossiers)
     * @returns {string} HTML de la navbar
     */
    static generateNavbar(activePage = '', basePath = '') {
        const instance = FornapComponents.init();
        
        // CORRECTION À LA SOURCE: Déterminer l'état d'authentification de manière fiable
        let initialAuthState = instance.authState;
        
        // Si l'état n'est pas encore connu, utiliser localStorage comme source fiable
        if (initialAuthState === null) {
            try {
                const lastAuthState = localStorage.getItem('fornap_auth_state');
                if (lastAuthState === 'true') {
                    initialAuthState = true;
                } else {
                    initialAuthState = false; // Par défaut déconnecté
                }
            } catch (e) {
                initialAuthState = false; // Par défaut déconnecté en cas d'erreur
            }
        }

        // Classes pour l'état initial - PAS DE SKELETON, état direct
        const authHidden = initialAuthState ? 'hidden' : '';
        const memberHidden = initialAuthState ? '' : 'hidden';
        
        // Debug log
        console.log('🔍 État navbar initial:', {
            initialAuthState,
            authHidden,
            memberHidden
        });

        return `
        <nav class="fornap-navbar">
            <div class="container">
                <div class="navbar-content">
                    <!-- Logo -->
                    <div class="navbar-logo">
                        <img src="${basePath}assets/images/logo.png" alt="FORNAP" 
                             class="logo-img" onclick="window.location.href='${basePath}index.html'">
                    </div>
                    
                    <!-- Menu Principal -->
                    <div class="navbar-menu" id="navbarMenu">
                        <a href="${basePath}index.html" 
                           class="navbar-link ${activePage === 'home' ? 'active' : ''}">
                            Accueil
                        </a>
                        <a href="#" id="forfaitsLink"
                           class="navbar-link ${activePage === 'membership' ? 'active' : ''}" 
                           data-href="${basePath}pages/membership.html">
                            Nos Forfaits
                        </a>
                        <a href="${basePath}pages/evenements/evenements.html" 
                           class="navbar-link ${activePage === 'events' ? 'active' : ''}">
                            Événements
                        </a>
                        <a href="#coworking" 
                           class="navbar-link ${activePage === 'coworking' ? 'active' : ''}">
                            Coworking
                        </a>
                        <a href="${basePath}pages/shop/shop.html" 
                           class="navbar-link ${activePage === 'shop' ? 'active' : ''}">
                            Boutique
                        </a>
                    </div>
                    
                    <!-- Actions Utilisateur -->
                    <div class="navbar-actions">
                        <!-- Utilisateur non connecté -->
                        <div class="navbar-auth ${authHidden}" id="navbarAuth">
                            <button onclick="window.location.href='${basePath}pages/login.html'" 
                                    class="btn btn-outline">Se connecter</button>
                            <button onclick="window.location.href='${basePath}pages/membership.html'" 
                                    class="btn btn-primary">Devenir membre</button>
                        </div>
                        
                        <!-- Utilisateur connecté -->
                        <div class="navbar-member ${memberHidden}" id="navbarMember">
                            <button id="dashboardBtn" class="btn btn-primary">Dashboard</button>
                            <button id="logoutBtn" class="btn btn-outline">Déconnexion</button>
                        </div>
                    </div>
                    
                    <!-- Menu Mobile -->
                    <button class="navbar-toggle" id="navbarToggle">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </nav>
        `;
    }

    /**
     * Génère le footer FORNAP
     * @param {string} basePath - Chemin de base pour les liens
     * @returns {string} HTML du footer
     */
    static generateFooter(basePath = '') {
        return `
        <footer class="fornap-footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h4>FORNAP</h4>
                        <p>Votre espace innovant alliant coworking, événements, boutique et communauté.</p>
                        <div class="footer-social">
                            <a href="#" class="social-link" aria-label="Facebook">📘</a>
                            <a href="#" class="social-link" aria-label="Instagram">📷</a>
                            <a href="#" class="social-link" aria-label="Twitter">🐦</a>
                        </div>
                    </div>
                    
                    <div class="footer-section">
                        <h4>Services</h4>
                        <ul class="footer-links">
                            <li><a href="#coworking">Coworking</a></li>
                            <li><a href="${basePath}pages/evenements/evenements.html">Événements</a></li>
                            <li><a href="#shop">Boutique</a></li>
                            <li><a href="${basePath}pages/membership.html">Adhésion</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h4>Liens utiles</h4>
                        <ul class="footer-links">
                            <li><a href="#about">À propos</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#legal">Mentions légales</a></li>
                            <li><a href="#terms">CGV</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h4>Contact</h4>
                        <div class="contact-info">
                            <p>📧 contact@fornap.fr</p>
                            <p>📞 01 23 45 67 89</p>
                            <p>📍 Adresse à définir</p>
                        </div>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <div class="footer-bottom-content">
                        <p>&copy; 2024 FORNAP. Tous droits réservés.</p>
                        <div class="footer-bottom-links">
                            <a href="#privacy">Confidentialité</a>
                            <a href="#cookies">Cookies</a>
                            <a href="#legal">Mentions légales</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        `;
    }

    /**
     * Initialise la navbar sur la page actuelle
     * @param {string} activePage - Page active
     * @param {string} basePath - Chemin de base
     * @param {object} authCallbacks - Callbacks pour l'authentification
     */
    static initNavbar(activePage = '', basePath = '', authCallbacks = {}) {
        // Injecter la navbar
        const navbarContainer = document.querySelector('.navbar-container') || document.querySelector('nav');
        if (navbarContainer) {
            navbarContainer.outerHTML = this.generateNavbar(activePage, basePath);
        }

        // Attendre que le DOM soit mis à jour
        setTimeout(() => {
            // Initialiser les événements
            this.initNavbarEvents(basePath, authCallbacks);
        }, 100);
    }

    /**
     * Initialise le footer sur la page actuelle
     * @param {string} basePath - Chemin de base
     */
    static initFooter(basePath = '') {
        // Injecter le footer
        const footerContainer = document.querySelector('footer');
        if (footerContainer) {
            footerContainer.outerHTML = this.generateFooter(basePath);
        }
    }

    /**
     * Initialise les événements de la navbar
     */
    static initNavbarEvents(basePath = '', authCallbacks = {}) {
        // Menu mobile
        const navbarToggle = document.getElementById('navbarToggle');
        const navbarMenu = document.getElementById('navbarMenu');
        
        if (navbarToggle && navbarMenu) {
            navbarToggle.addEventListener('click', () => {
                navbarToggle.classList.toggle('active');
                navbarMenu.classList.toggle('active');
            });
        }

        // Boutons d'authentification - CORRECTION DES IDS
        const dashboardBtn = document.getElementById('dashboardBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        // Boutons de la section non connectée (navbar-auth)
        const navbarAuthButtons = document.querySelectorAll('#navbarAuth button');
        const loginButton = document.querySelector('#navbarAuth button[onclick*="login"]');
        const memberButton = document.querySelector('#navbarAuth button[onclick*="membership"]');

        // Gestion des boutons de connexion/inscription
        if (navbarAuthButtons.length > 0 && authCallbacks.onLogin) {
            navbarAuthButtons.forEach(btn => {
                if (btn.textContent.includes('connecter')) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        authCallbacks.onLogin();
                    });
                }
            });
        }

        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                window.location.href = basePath + 'pages/dashboard.html';
            });
        }

        if (logoutBtn && authCallbacks.onLogout) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                authCallbacks.onLogout();
            });
        }

        // Gérer le clic sur le lien "Nos Forfaits"
        const forfaitsLink = document.getElementById('forfaitsLink');
        if (forfaitsLink) {
            forfaitsLink.addEventListener('click', async (event) => {
                event.preventDefault(); // Empêcher le comportement par défaut du lien
                
                // CORRECTION : Vérifier l'état d'authentification réel depuis FornapAuth
                let isAuthenticated = false;
                try {
                    // Vérifier si FornapAuth est initialisé et s'il y a un utilisateur connecté
                    if (window.FornapAuth && window.FornapAuth.getCurrentUser) {
                        const currentUser = await window.FornapAuth.getCurrentUser();
                        isAuthenticated = !!currentUser;
                    } else {
                        // Fallback sur l'instance components si FornapAuth pas dispo
                        const instance = FornapComponents.init();
                        isAuthenticated = instance.authState || false;
                    }
                } catch (error) {
                    console.warn('Erreur vérification auth state:', error);
                    isAuthenticated = false;
                }
                
                console.log('🔍 État authentification pour forfaits:', isAuthenticated ? 'connecté' : 'déconnecté');
                
                // Toujours aller à la page des forfaits, que l'utilisateur soit connecté ou pas
                // La logique de redirection se fera dans membership.html selon le statut
                console.log('🎯 Redirection vers page forfaits (connecté ou pas)');
                const href = forfaitsLink.dataset.href;
                if (href) {
                    window.location.href = href;
                }
            });
        }

        console.log('✅ Navbar FORNAP initialisée');
    }

    /**
     * Sauvegarde l'état d'authentification pour éviter le saut visuel
     */
    static saveAuthState(isAuthenticated) {
        try {
            localStorage.setItem('fornap_auth_state', isAuthenticated.toString());
        } catch (e) {
            console.warn('⚠️ Impossible de sauvegarder l\'état auth dans localStorage');
        }
    }
}

// Initialiser automatiquement l'instance globale
FornapComponents.init();

// Export pour utilisation globale
window.FornapComponents = FornapComponents; 