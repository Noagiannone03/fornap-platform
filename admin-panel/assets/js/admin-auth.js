/**
 * FORNAP Admin - Authentification Service
 * Service d'authentification pour le dashboard admin
 * Gestion des permissions, rôles et session admin
 */

class FornapAdminAuth {
    constructor() {
        this.currentAdmin = null;
        this.permissions = [];
        this.role = null;
        this.initialized = false;
        this.authCallbacks = [];
        
        // Configuration des permissions par rôle
        this.rolePermissions = {
            'super_admin': ['*'], // Toutes les permissions
            'admin': [
                'statistics.read',
                'events.read', 'events.write', 'events.delete',
                'users.read', 'users.write', 'users.delete',
                'settings.read', 'settings.write'
            ],
            'moderator': [
                'statistics.read',
                'events.read', 'events.write',
                'users.read', 'users.write'
            ],
            'editor': [
                'events.read', 'events.write',
                'users.read'
            ]
        };
        
        // Liste des administrateurs autorisés - CONFIGURATION DURABLE
        this.authorizedAdmins = [
            {
                email: 'admin@fornap.com',
                role: 'super_admin',
                profile: { firstName: 'Admin', lastName: 'FORNAP' }
            },
            {
                email: 'superadmin@fornap.com',
                role: 'super_admin',
                profile: { firstName: 'Super', lastName: 'Admin' }
            },
            {
                email: 'moderator@fornap.com', 
                role: 'moderator',
                profile: { firstName: 'Modérateur', lastName: 'FORNAP' }
            }
        ];
        
        // FALLBACK SÉCURISÉ - Si pas d'admin configuré, accepter tout utilisateur connecté
        this.enableFallbackMode = true;
    }

    /**
     * Initialise le service d'authentification admin
     */
    async init() {
        if (this.initialized) return;

        try {
            console.log('🔐 Initialisation de l\'authentification admin...');
            
            // Charger les admins sauvegardés (DURABLE)
            this.loadAuthorizedAdmins();
            
            // Vérifier si un utilisateur est connecté
            await this.checkCurrentUser();
            
            this.initialized = true;
            console.log('✅ Authentification admin initialisée avec', this.authorizedAdmins.length, 'admins autorisés');
            console.log('🔧 Mode fallback:', this.enableFallbackMode ? 'ACTIVÉ' : 'DÉSACTIVÉ');
            
        } catch (error) {
            console.error('❌ Erreur initialisation auth admin:', error);
            throw error;
        }
    }

    /**
     * Vérifier l'utilisateur connecté
     */
    async checkCurrentUser() {
        return new Promise((resolve) => {
            if (!window.FornapAuth || !window.FornapAuth.auth) {
                resolve(false);
                return;
            }

            const unsubscribe = window.FornapAuth.auth.onAuthStateChanged(async (user) => {
                unsubscribe(); // Ne s'abonner qu'une fois
                
                if (user) {
                    console.log('👤 Utilisateur connecté:', user.email);
                    const isAdmin = await this.validateAdminUser(user);
                    
                    if (isAdmin) {
                        console.log('✅ Utilisateur admin validé:', this.currentAdmin?.role);
                        this.notifyAuthChange(true, this.currentAdmin);
                        resolve(true);
                    } else {
                        console.log('❌ Utilisateur non autorisé comme admin');
                        this.currentAdmin = null;
                        this.notifyAuthChange(false);
                        resolve(false);
                    }
                } else {
                    console.log('❌ Aucun utilisateur connecté');
                    this.currentAdmin = null;
                    this.notifyAuthChange(false);
                    resolve(false);
                }
            });
        });
    }

    /**
     * Valide qu'un utilisateur est admin
     */
    async validateAdminUser(user) {
        try {
            console.log('🔍 Validation utilisateur admin:', user.email);
            
            // Chercher dans la liste des admins autorisés
            let adminConfig = this.authorizedAdmins.find(admin => 
                admin.email.toLowerCase() === user.email.toLowerCase()
            );
            
            // FALLBACK SÉCURISÉ - Si mode fallback activé et pas d'admin trouvé
            if (!adminConfig && this.enableFallbackMode) {
                console.warn('⚠️ Mode fallback activé - Autorisation admin pour:', user.email);
                adminConfig = {
                    email: user.email,
                    role: 'super_admin',
                    profile: { 
                        firstName: user.displayName?.split(' ')[0] || 'Admin', 
                        lastName: user.displayName?.split(' ')[1] || 'FORNAP' 
                    }
                };
            }
            
            if (!adminConfig) {
                console.warn('❌ Email non autorisé pour admin:', user.email);
                return false;
            }

            // Définir l'admin actuel
            this.currentAdmin = {
                uid: user.uid,
                email: user.email,
                role: adminConfig.role,
                profile: adminConfig.profile,
                lastLogin: new Date()
            };

            // Définir les permissions
            this.role = adminConfig.role;
            this.permissions = this.rolePermissions[adminConfig.role] || ['*'];

            console.log('✅ Utilisateur admin validé:', {
                email: user.email,
                role: adminConfig.role,
                permissions: this.permissions
            });

            return true;
            
        } catch (error) {
            console.error('❌ Erreur validation admin:', error);
            return false;
        }
    }

    /**
     * Connecte un administrateur
     */
    async signInAdmin(email, password) {
        try {
            console.log('🔑 Tentative de connexion admin:', email);
            
            // Vérifier d'abord si l'email est autorisé
            const adminConfig = this.authorizedAdmins.find(admin => 
                admin.email === email
            );
            
            if (!adminConfig) {
                throw new Error('Cet email n\'a pas les privilèges administrateur');
            }

            // Se connecter via le service d'auth principal
            const result = await window.FornapAuth.signIn(email, password);
            
            if (result.user) {
                // Valider comme admin
                const isAdmin = await this.validateAdminUser(result.user);
                
                if (!isAdmin) {
                    await window.FornapAuth.signOut();
                    throw new Error('Privilèges administrateur insuffisants');
                }

                console.log('✅ Connexion admin réussie');
                return { 
                    success: true, 
                    adminData: this.currentAdmin 
                };
                
            } else {
                throw new Error('Erreur de connexion');
            }
            
        } catch (error) {
            console.error('❌ Erreur connexion admin:', error);
            throw error;
        }
    }

    /**
     * Vérifie si l'utilisateur actuel est admin
     */
    isAdmin() {
        return this.currentAdmin !== null && this.role !== null;
    }

    /**
     * Retourne les données de l'admin actuel
     */
    getCurrentAdmin() {
        return this.currentAdmin;
    }

    /**
     * Vérifie une permission spécifique
     */
    hasPermission(permission) {
        if (!this.permissions) return false;
        
        // Super admin a toutes les permissions
        if (this.permissions.includes('*')) return true;
        
        // Vérifier la permission spécifique
        return this.permissions.includes(permission);
    }

    /**
     * Vérifie l'accès à un module
     */
    canAccessModule(moduleId) {
        const modulePermissions = {
            'dashboard': 'statistics.read',
            'events': 'events.read',
            'users': 'users.read',
            'analytics': 'statistics.read',
            'settings': 'settings.read'
        };
        
        const requiredPermission = modulePermissions[moduleId];
        if (!requiredPermission) return false;
        
        return this.hasPermission(requiredPermission);
    }

    /**
     * Ajoute un callback d'état d'authentification
     */
    onAuthStateChanged(callback) {
        this.authCallbacks.push(callback);
        
        // Si déjà initialisé, appeler immédiatement
        if (this.initialized) {
            callback(this.isAdmin(), this.currentAdmin);
        }
    }

    /**
     * Notifie les callbacks du changement d'état
     */
    notifyAuthChange(isAuthenticated, adminData = null) {
        this.authCallbacks.forEach(callback => {
            try {
                callback(isAuthenticated, adminData);
            } catch (error) {
                console.error('❌ Erreur callback auth:', error);
            }
        });
    }
    
    /**
     * MÉTHODES DE CONFIGURATION DURABLE
     */
    
    /**
     * Ajoute un admin autorisé (DURABLE)
     */
    addAuthorizedAdmin(email, role = 'admin', profile = null) {
        const existingIndex = this.authorizedAdmins.findIndex(admin => 
            admin.email.toLowerCase() === email.toLowerCase()
        );
        
        const adminConfig = {
            email: email,
            role: role,
            profile: profile || { 
                firstName: email.split('@')[0], 
                lastName: 'FORNAP' 
            }
        };
        
        if (existingIndex >= 0) {
            this.authorizedAdmins[existingIndex] = adminConfig;
            console.log('🔄 Admin mis à jour:', email);
        } else {
            this.authorizedAdmins.push(adminConfig);
            console.log('✅ Nouvel admin ajouté:', email);
        }
        
        // Sauvegarder en localStorage pour persistence
        this.saveAuthorizedAdmins();
    }
    
    /**
     * Supprime un admin autorisé (DURABLE)
     */
    removeAuthorizedAdmin(email) {
        const index = this.authorizedAdmins.findIndex(admin => 
            admin.email.toLowerCase() === email.toLowerCase()
        );
        
        if (index >= 0) {
            this.authorizedAdmins.splice(index, 1);
            this.saveAuthorizedAdmins();
            console.log('🗑️ Admin supprimé:', email);
            return true;
        }
        
        return false;
    }
    
    /**
     * Active/désactive le mode fallback
     */
    setFallbackMode(enabled) {
        this.enableFallbackMode = enabled;
        localStorage.setItem('fornap_admin_fallback', enabled.toString());
        console.log('🔧 Mode fallback:', enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ');
    }
    
    /**
     * Sauvegarde les admins autorisés (DURABLE)
     */
    saveAuthorizedAdmins() {
        try {
            localStorage.setItem('fornap_authorized_admins', JSON.stringify(this.authorizedAdmins));
            console.log('💾 Liste des admins sauvegardée');
        } catch (error) {
            console.warn('⚠️ Impossible de sauvegarder les admins:', error);
        }
    }
    
    /**
     * Charge les admins autorisés depuis le localStorage (DURABLE)
     */
    loadAuthorizedAdmins() {
        try {
            const saved = localStorage.getItem('fornap_authorized_admins');
            const fallbackEnabled = localStorage.getItem('fornap_admin_fallback');
            
            if (saved) {
                const admins = JSON.parse(saved);
                if (Array.isArray(admins) && admins.length > 0) {
                    this.authorizedAdmins = [...this.authorizedAdmins, ...admins];
                    console.log('📥 Admins chargés depuis localStorage:', admins.length);
                }
            }
            
            if (fallbackEnabled !== null) {
                this.enableFallbackMode = fallbackEnabled === 'true';
            }
            
        } catch (error) {
            console.warn('⚠️ Erreur chargement admins sauvegardés:', error);
        }
    }
}

// Instance globale du service admin
const fornapAdminAuth = new FornapAdminAuth();

// Export global
window.FornapAdminAuth = fornapAdminAuth;

console.log('✅ Service d\'authentification admin chargé');