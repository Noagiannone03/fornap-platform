/**
 * FORNAP Admin - Initialisation
 * Script d'initialisation principal du dashboard admin
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Démarrage du dashboard admin FORNAP...');
    
    try {
        // Étape 1: Initialiser l'authentification de base
        console.log('📝 Initialisation de l\'authentification...');
        await window.FornapAuth.init();
        
        // Étape 2: Initialiser l'authentification admin
        console.log('🔐 Initialisation de l\'authentification admin...');
        await window.FornapAdminAuth.init();
        
        // Étape 3: Vérifier si l'utilisateur est admin
        window.FornapAdminAuth.onAuthStateChanged(async (isAuthenticated, adminData) => {
            console.log('🔄 État admin changé:', isAuthenticated, adminData?.role);
            
            if (isAuthenticated && adminData) {
                console.log('✅ Utilisateur admin authentifié:', adminData.role);
                await initializeDashboard(adminData);
            } else {
                console.log('❌ Authentification admin échouée ou données manquantes');
                // Ne montrer le login que si on n'est pas en train de se connecter
                if (!document.getElementById('loginBtn')?.disabled) {
                    showLoginForm();
                }
            }
        });
        
        // Attendre que Firebase Auth soit prêt avant de vérifier l'état
        // Le callback onAuthStateChanged ci-dessus gère déjà l'initialisation
        console.log('🕐 En attente de l\'état d\'authentification Firebase...');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showError('Erreur lors de l\'initialisation du dashboard');
    }
});

/**
 * Initialise le dashboard admin
 */
async function initializeDashboard(adminData) {
    try {
        console.log('🎛️ Initialisation du dashboard pour:', adminData?.email || 'utilisateur');
        
        // Masquer le formulaire de login et afficher le dashboard
        const loginEl = document.getElementById('adminLogin');
        const dashboardEl = document.getElementById('adminDashboard');
        
        console.log('🔍 Elements trouvés:', { loginEl: !!loginEl, dashboardEl: !!dashboardEl });
        
        if (loginEl) {
            loginEl.style.display = 'none';
        }
        
        if (dashboardEl) {
            dashboardEl.style.display = 'block';
            dashboardEl.classList.remove('hidden');
        } else {
            console.error('❌ Element adminDashboard non trouvé !');
        }
        
        // Forcer l'affichage du dashboard et cacher le loader
        document.body.classList.add('admin-body');
        const loader = document.getElementById('adminLoader');
        if (loader) {
            loader.style.display = 'none';
        }
        
        // Initialiser le core admin
        await window.FornapAdminCore.init();
        
        // Initialiser les modules
        await initializeModules();
        
        // S'assurer que le dashboard est bien affiché
        setTimeout(() => {
            const dashboard = document.getElementById('adminDashboard');
            if (dashboard) {
                dashboard.classList.remove('hidden');
                dashboard.style.display = 'flex';
            }
        }, 100);
        
        // Configurer les préférences utilisateur
        loadUserPreferences();
        
        // Setup des notifications
        setupNotifications();
        
        // Démarrer les tâches périodiques
        startPeriodicTasks();
        
        // Test final pour s'assurer que tout fonctionne
        performFinalCheck();
        
        console.log('✅ Dashboard admin prêt');
        
    } catch (error) {
        console.error('❌ Erreur initialisation dashboard:', error);
        showError('Erreur lors de l\'initialisation du dashboard');
    }
}

/**
 * Initialise tous les modules disponibles
 */
async function initializeModules() {
    try {
        console.log('📦 Initialisation des modules...');
        
        // Créer les instances de modules disponibles
        const modules = {
            events: window.FornapEventsModule,
            users: window.FornapUsersModule
        };
        
        // Vérifier que tous les modules sont disponibles
        for (const [name, module] of Object.entries(modules)) {
            if (module) {
                console.log(`✅ Module ${name} disponible`);
            } else {
                console.warn(`⚠️ Module ${name} non disponible`);
            }
        }
        
        console.log('✅ Modules initialisés');
        
    } catch (error) {
        console.error('❌ Erreur initialisation modules:', error);
    }
}

/**
 * Affiche le formulaire de connexion admin
 */
function showLoginForm() {
    const dashboard = document.getElementById('adminDashboard');
    const loader = document.getElementById('adminLoader');
    
    if (loader) loader.style.display = 'none';
    if (dashboard) dashboard.classList.add('hidden');
    
    document.body.innerHTML = `
        <div class="admin-login-container">
            <div class="admin-login-form">
                <div class="login-header">
                    <h1>FORNAP</h1>
                    <h2>Dashboard Admin</h2>
                    <p>Accès réservé aux administrateurs</p>
                </div>
                
                <form id="adminLoginForm">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" 
                               id="adminEmail" 
                               class="form-input" 
                               required 
                               placeholder="votre.email@fornap.com">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Mot de passe</label>
                        <input type="password" 
                               id="adminPassword" 
                               class="form-input" 
                               required 
                               placeholder="Votre mot de passe">
                    </div>
                    
                    <button type="submit" class="btn-admin btn-primary btn-lg" id="loginBtn">
                        Se connecter
                    </button>
                </form>
                
                <div class="login-footer">
                    <p><a href="../index.html">← Retour au site principal</a></p>
                </div>
                
                <div id="loginMessage" class="login-message"></div>
            </div>
        </div>
    `;
    
    // Ajouter les styles de login
    addLoginStyles();
    
    // Configuration du formulaire
    const form = document.getElementById('adminLoginForm');
    form.addEventListener('submit', handleAdminLogin);
}

/**
 * Gère la connexion admin
 */
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const messageDiv = document.getElementById('loginMessage');
    
    if (!email || !password) {
        showLoginMessage('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    try {
        // Désactiver le bouton et afficher le loading
        loginBtn.disabled = true;
        loginBtn.innerHTML = 'Connexion...';
        
        // Tentative de connexion admin
        const result = await window.FornapAdminAuth.signInAdmin(email, password);
        
        showLoginMessage('Connexion réussie !', 'success');
        
        // Initialiser directement le dashboard sans reload
        setTimeout(async () => {
            await initializeDashboard(result.adminData);
        }, 500);
        
    } catch (error) {
        console.error('❌ Erreur connexion admin:', error);
        
        let errorMessage = 'Erreur de connexion';
        
        if (error.message.includes('privilèges')) {
            errorMessage = 'Accès administrateur non autorisé';
        } else if (error.message.includes('mot de passe')) {
            errorMessage = 'Mot de passe incorrect';
        } else if (error.message.includes('email')) {
            errorMessage = 'Email non reconnu';
        } else if (error.message.includes('désactivé')) {
            errorMessage = 'Compte administrateur désactivé';
        }
        
        showLoginMessage(errorMessage, 'error');
        
        // Réactiver le bouton
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Se connecter';
    }
}

/**
 * Affiche un message de login
 */
function showLoginMessage(message, type) {
    const messageDiv = document.getElementById('loginMessage');
    if (!messageDiv) return;
    
    messageDiv.className = `login-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    // Auto-hide après 5 secondes pour les messages de succès
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

/**
 * Ajoute les styles CSS pour la page de login
 */
function addLoginStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .admin-login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .admin-login-form {
            background: white;
            border-radius: 16px;
            padding: 48px;
            box-shadow: 0 20px 64px rgba(0, 0, 0, 0.15);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .login-header h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 8px;
            color: #1C1C1E;
        }
        
        .login-header h2 {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 8px;
            color: #007AFF;
        }
        
        .login-header p {
            color: #8E8E93;
            margin: 0 0 32px;
        }
        
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        
        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #1C1C1E;
            font-size: 14px;
        }
        
        .form-input {
            width: 100%;
            padding: 16px;
            border: 1px solid #D1D1D6;
            border-radius: 12px;
            font-size: 16px;
            background-color: #F9F9F9;
            transition: all 0.2s ease;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #007AFF;
            background-color: white;
            box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
        }
        
        .btn-lg {
            width: 100%;
            padding: 16px 24px;
            font-size: 16px;
            margin-top: 8px;
        }
        
        .login-footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #F2F2F7;
        }
        
        .login-footer a {
            color: #007AFF;
            text-decoration: none;
            font-size: 14px;
        }
        
        .login-footer a:hover {
            text-decoration: underline;
        }
        
        .login-message {
            margin-top: 16px;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            display: none;
        }
        
        .login-message.error {
            background-color: rgba(255, 59, 48, 0.1);
            color: #FF3B30;
            border: 1px solid rgba(255, 59, 48, 0.2);
        }
        
        .login-message.success {
            background-color: rgba(48, 209, 88, 0.1);
            color: #30D158;
            border: 1px solid rgba(48, 209, 88, 0.2);
        }
        
        @media (max-width: 480px) {
            .admin-login-form {
                margin: 20px;
                padding: 32px 24px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Charge les préférences utilisateur
 */
function loadUserPreferences() {
    try {
        // Sidebar collapsed state
        const sidebarCollapsed = localStorage.getItem('admin_sidebar_collapsed');
        if (sidebarCollapsed === 'true') {
            const sidebar = document.querySelector('.admin-sidebar');
            if (sidebar) {
                sidebar.classList.add('collapsed');
                window.FornapAdminCore.sidebarCollapsed = true;
            }
        }
        
        // Autres préférences...
        
    } catch (error) {
        console.warn('⚠️ Erreur chargement préférences:', error);
    }
}

/**
 * Configure le système de notifications
 */
function setupNotifications() {
    try {
        // Vérifier les permissions de notification du navigateur
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
        
        // Configuration des notifications push si nécessaire
        
    } catch (error) {
        console.warn('⚠️ Erreur setup notifications:', error);
    }
}

/**
 * Démarre les tâches périodiques
 */
function startPeriodicTasks() {
    try {
        // Rafraîchissement des données toutes les 5 minutes
        setInterval(async () => {
            if (window.FornapAdminCore.initialized) {
                await window.FornapAdminCore.refreshData();
            }
        }, 5 * 60 * 1000);
        
        // Vérification de la session admin toutes les 30 minutes
        setInterval(() => {
            if (!window.FornapAdminAuth.isAdmin()) {
                console.log('🔄 Session admin expirée, redirection...');
                showLoginForm();
            }
        }, 30 * 60 * 1000);
        
        // Nettoyage des notifications anciennes toutes les minutes
        setInterval(() => {
            const notifications = document.querySelectorAll('.admin-notification');
            notifications.forEach(notification => {
                const age = Date.now() - parseInt(notification.dataset.timestamp || '0');
                if (age > 5 * 60 * 1000) { // 5 minutes
                    notification.remove();
                }
            });
        }, 60 * 1000);
        
    } catch (error) {
        console.warn('⚠️ Erreur setup tâches périodiques:', error);
    }
}

/**
 * Vérification finale que tout fonctionne
 */
function performFinalCheck() {
    console.log('🔍 Vérification finale du dashboard...');
    
    const checks = {
        body: !!document.querySelector('body.admin-body'),
        dashboard: !!document.getElementById('adminDashboard'),
        sidebar: !!document.querySelector('.admin-sidebar'),
        main: !!document.querySelector('.admin-main'),
        content: !!document.getElementById('adminContent'),
        dashboardModule: !!document.querySelector('[data-module="dashboard"].active'),
        navigation: !!document.querySelector('.nav-menu')
    };
    
    console.log('📊 État du dashboard:', checks);
    
    // Diagnostics détaillés
    Object.entries(checks).forEach(([element, isOk]) => {
        console.log(`${isOk ? '✅' : '❌'} ${element}: ${isOk ? 'OK' : 'MANQUANT'}`);
    });
    
    // Correction automatique si problème détecté
    if (!checks.body) {
        document.body.classList.add('admin-body');
        console.log('🔧 Classe admin-body ajoutée au body');
    }
    
    if (!checks.dashboardModule) {
        const dashboardModule = document.querySelector('[data-module="dashboard"]');
        if (dashboardModule) {
            dashboardModule.classList.add('active');
            console.log('🔧 Module dashboard activé manuellement');
        }
    }
    
    // Si problèmes critiques, essayer de forcer l'affichage
    const criticalChecks = ['dashboard', 'sidebar', 'main', 'content'];
    const criticalIssues = criticalChecks.filter(check => !checks[check]);
    
    if (criticalIssues.length > 0) {
        console.error('🚨 Problèmes critiques détectés:', criticalIssues);
        
        // Forcer l'affichage en dernier recours
        setTimeout(() => {
            const dashboard = document.getElementById('adminDashboard');
            if (dashboard) {
                dashboard.style.cssText = 'display: flex !important; min-height: 100vh !important;';
            }
        }, 500);
    } else {
        console.log('🎉 Dashboard parfaitement fonctionnel !');
    }
}

/**
 * Affiche une erreur critique
 */
function showError(message) {
    document.body.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #F2F2F7;
        ">
            <div style="
                text-align: center;
                background: white;
                padding: 48px;
                border-radius: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            ">
                <div style="font-size: 64px; margin-bottom: 24px;">❌</div>
                <h1 style="margin: 0 0 16px; color: #1C1C1E;">Erreur</h1>
                <p style="margin: 0 0 24px; color: #8E8E93;">${message}</p>
                <button onclick="location.reload()" style="
                    background: #007AFF;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Recharger la page
                </button>
                <div style="margin-top: 24px;">
                    <a href="../index.html" style="color: #007AFF; text-decoration: none;">
                        ← Retour au site principal
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Export global pour accès depuis d'autres scripts
window.AdminInit = {
    showLoginForm,
    showError,
    initializeDashboard
};

console.log('✅ Script d\'initialisation admin chargé');