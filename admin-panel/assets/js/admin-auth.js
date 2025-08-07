/**
 * FORNAP Admin - Service d'Authentification Admin
 * Gestion spécialisée de l'authentification pour le dashboard admin
 * Étend le service d'authentification de base avec vérifications admin
 */

class FornapAdminAuthService {
    constructor() {
        this.baseAuth = window.FornapAuth;
        this.currentAdminUser = null;
        this.adminData = null;
        this.isAdminAuthenticated = false;
        this.authCallbacks = [];
        
        // Configuration des rôles admin
        this.adminRoles = {
            SUPER_ADMIN: 'super_admin',
            ADMIN: 'admin', 
            MODERATOR: 'moderator',
            EDITOR: 'editor'
        };
        
        // Permissions par rôle
        this.permissions = {
            [this.adminRoles.SUPER_ADMIN]: ['*'], // Toutes les permissions
            [this.adminRoles.ADMIN]: [
                'users.read', 'users.write', 'users.delete',
                'events.read', 'events.write', 'events.delete',
                'statistics.read', 'settings.read', 'settings.write'
            ],
            [this.adminRoles.MODERATOR]: [
                'users.read', 'users.write',
                'events.read', 'events.write',
                'statistics.read'
            ],
            [this.adminRoles.EDITOR]: [
                'events.read', 'events.write',
                'statistics.read'
            ]
        };
    }

    /**
     * Initialise le service d'authentification admin
     */
    async init() {
        try {
            // S'assurer que le service de base est initialisé
            if (!this.baseAuth.isInitialized) {
                await this.baseAuth.init();
            }

            // Écouter les changements d'état du service de base
            this.baseAuth.onAuthStateChanged(async (user) => {
                console.log('🔍 Service admin - changement état auth:', user ? user.email : 'déconnecté');
                
                if (user) {
                    try {
                        await this.checkAdminStatus(user);
                    } catch (error) {
                        console.error('❌ Erreur vérification admin status:', error);
                        this.clearAdminState();
                    }
                } else {
                    this.clearAdminState();
                }
            });

            console.log('✅ Service d\'authentification admin initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation admin auth:', error);
            throw error;
        }
    }

    /**
     * Vérifie le statut administrateur de l'utilisateur
     */
    async checkAdminStatus(user) {
        try {
            // Récupérer les données admin depuis Firestore
            const adminDoc = await this.baseAuth.db
                .collection('admins')
                .doc(user.uid)
                .get();

            if (adminDoc.exists) {
                const adminData = adminDoc.data();
                
                // Vérifier si le compte admin est actif
                if (adminData.status === 'active') {
                    this.currentAdminUser = user;
                    this.adminData = adminData;
                    this.isAdminAuthenticated = true;
                    
                    // La mise à jour de la dernière connexion est maintenant gérée
                    // automatiquement par le service d'auth de base lors du onAuthStateChanged
                    
                    console.log('✅ Utilisateur admin authentifié:', {
                        email: adminData.email,
                        role: adminData.role,
                        permissions: this.getUserPermissions()
                    });
                    
                    this.notifyAuthStateChange(true, adminData);
                } else {
                    console.warn('⚠️ Compte admin désactivé');
                    this.clearAdminState();
                    throw new Error('Compte administrateur désactivé');
                }
            } else {
                console.warn('⚠️ Utilisateur non autorisé pour l\'admin');
                this.clearAdminState();
                throw new Error('Accès administrateur non autorisé');
            }
        } catch (error) {
            console.error('❌ Erreur vérification statut admin:', error);
            
            // Éviter les boucles infinies en marquant l'erreur
            if (!error.adminCheckFailed) {
                error.adminCheckFailed = true;
                this.clearAdminState();
            }
            
            throw error;
        }
    }

    /**
     * Connexion admin avec vérification des privilèges
     */
    async signInAdmin(email, password) {
        try {
            // Connexion normale d'abord
            const user = await this.baseAuth.signIn(email, password);
            
            // Vérification admin automatique via onAuthStateChanged
            // Attendre un peu que la vérification se fasse
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (!this.isAdminAuthenticated) {
                // Forcer la déconnexion si pas admin
                await this.baseAuth.signOut();
                throw new Error('Privilèges administrateur requis');
            }
            
            return {
                user: this.currentAdminUser,
                adminData: this.adminData
            };
        } catch (error) {
            console.error('❌ Erreur connexion admin:', error);
            this.clearAdminState();
            throw error;
        }
    }

    /**
     * Déconnexion admin
     */
    async signOutAdmin() {
        try {
            // Nettoyer l'état admin d'abord
            this.clearAdminState();
            
            // Puis déconnexion normale
            await this.baseAuth.signOut();
            
            console.log('✅ Déconnexion admin réussie');
        } catch (error) {
            console.error('❌ Erreur déconnexion admin:', error);
            // Forcer le nettoyage même en cas d'erreur
            this.clearAdminState();
            throw error;
        }
    }

    /**
     * Vérifier si l'utilisateur a une permission spécifique
     */
    hasPermission(permission) {
        if (!this.isAdminAuthenticated || !this.adminData) {
            return false;
        }

        const userRole = this.adminData.role;
        const userPermissions = this.permissions[userRole] || [];

        // Super admin a toutes les permissions
        if (userPermissions.includes('*')) {
            return true;
        }

        return userPermissions.includes(permission);
    }

    /**
     * Récupérer toutes les permissions de l'utilisateur
     */
    getUserPermissions() {
        if (!this.isAdminAuthenticated || !this.adminData) {
            return [];
        }

        return this.permissions[this.adminData.role] || [];
    }

    /**
     * Créer un compte administrateur
     * (Seuls les super admins peuvent créer d'autres admins)
     */
    async createAdminAccount(userData) {
        if (!this.hasPermission('users.create') && !this.hasPermission('*')) {
            throw new Error('Permission insuffisante pour créer un compte admin');
        }

        try {
            const adminData = {
                email: userData.email,
                role: userData.role || this.adminRoles.EDITOR,
                status: 'active',
                createdAt: firebase.firestore.Timestamp.now(),
                createdBy: this.currentAdminUser.uid,
                profile: {
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    department: userData.department || '',
                    phone: userData.phone || ''
                },
                lastLogin: null,
                loginCount: 0
            };

            // Créer dans la collection admins
            await this.baseAuth.db
                .collection('admins')
                .doc(userData.uid)
                .set(adminData);

            console.log('✅ Compte admin créé:', userData.email);
            return adminData;
        } catch (error) {
            console.error('❌ Erreur création compte admin:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour les données d'un admin
     */
    async updateAdminData(uid, updateData) {
        if (!this.hasPermission('users.write') && !this.hasPermission('*')) {
            throw new Error('Permission insuffisante');
        }

        try {
            await this.baseAuth.db
                .collection('admins')
                .doc(uid)
                .update({
                    ...updateData,
                    updatedAt: firebase.firestore.Timestamp.now(),
                    updatedBy: this.currentAdminUser.uid
                });

            // Si c'est l'utilisateur actuel, mettre à jour les données locales
            if (uid === this.currentAdminUser.uid) {
                this.adminData = { ...this.adminData, ...updateData };
            }

            console.log('✅ Données admin mises à jour');
        } catch (error) {
            console.error('❌ Erreur mise à jour admin:', error);
            throw error;
        }
    }

    /**
     * Lister tous les administrateurs
     */
    async getAdminsList() {
        if (!this.hasPermission('users.read') && !this.hasPermission('*')) {
            throw new Error('Permission insuffisante');
        }

        try {
            const snapshot = await this.baseAuth.db
                .collection('admins')
                .orderBy('createdAt', 'desc')
                .get();

            const admins = [];
            snapshot.forEach(doc => {
                admins.push({
                    uid: doc.id,
                    ...doc.data()
                });
            });

            return admins;
        } catch (error) {
            console.error('❌ Erreur récupération liste admins:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour la dernière connexion
     * DEPRECATED: La mise à jour est maintenant gérée automatiquement 
     * par le service d'authentification de base qui détecte le type d'utilisateur
     */
    async updateAdminLastLogin(uid) {
        console.log('⚠️ updateAdminLastLogin est deprecated - utilisation automatique par le service de base');
        // La mise à jour est maintenant gérée par FornapAuthService.updateLastLogin()
        // qui détecte automatiquement si c'est un admin ou un membre
    }

    /**
     * Nettoyer l'état admin
     */
    clearAdminState() {
        this.currentAdminUser = null;
        this.adminData = null;
        this.isAdminAuthenticated = false;
        this.notifyAuthStateChange(false, null);
    }

    /**
     * Ajouter un callback pour les changements d'état admin
     */
    onAuthStateChanged(callback) {
        this.authCallbacks.push(callback);
        
        // Appeler immédiatement si déjà authentifié
        if (this.isAdminAuthenticated) {
            callback(true, this.adminData);
        }
    }

    /**
     * Notifier les changements d'état
     */
    notifyAuthStateChange(isAuthenticated, adminData) {
        this.authCallbacks.forEach(callback => {
            try {
                callback(isAuthenticated, adminData);
            } catch (error) {
                console.error('❌ Erreur callback admin auth:', error);
            }
        });
    }

    /**
     * Vérifier si l'utilisateur est admin
     */
    isAdmin() {
        return this.isAdminAuthenticated;
    }

    /**
     * Récupérer les données admin actuelles
     */
    getCurrentAdmin() {
        return this.adminData;
    }

    /**
     * Récupérer le rôle de l'admin actuel
     */
    getCurrentRole() {
        return this.adminData ? this.adminData.role : null;
    }

    /**
     * Vérifier si l'utilisateur peut accéder à un module
     */
    canAccessModule(moduleName) {
        const modulePermissions = {
            'dashboard': ['statistics.read'],
            'users': ['users.read'],
            'events': ['events.read'],
            'settings': ['settings.read']
        };

        const requiredPermissions = modulePermissions[moduleName] || [];
        return requiredPermissions.some(permission => this.hasPermission(permission));
    }
}

// Instance globale du service admin
const fornapAdminAuth = new FornapAdminAuthService();

// Export global
window.FornapAdminAuth = fornapAdminAuth;

console.log('✅ Service d\'authentification admin chargé');