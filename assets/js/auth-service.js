/**
 * FORNAP - Service d'Authentification
 * Gestion centralisée de l'authentification Firebase
 */

class FornapAuthService {
    constructor() {
        this.currentUser = null;
        this.auth = null;
        this.db = null;
        this.isInitialized = false;
        this.authCallbacks = [];
    }

    /**
     * Initialise le service d'authentification
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // Vérifier que Firebase est disponible
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase non disponible');
            }

            // Vérifier que la configuration est disponible
            if (!window.FornapConfig) {
                throw new Error('Configuration FORNAP non trouvée');
            }

            // Initialiser Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(window.FornapConfig.firebase);
            }

            this.auth = firebase.auth();
            this.db = firebase.firestore();

            // Écouter les changements d'état d'authentification
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                console.log('🔄 Firebase Auth state changed:', user ? user.email : 'déconnecté');
                this.notifyAuthStateChange(user);
                
                // Mettre à jour la dernière connexion si connecté
                if (user) {
                    this.updateLastLogin(user.uid);
                }
            });

            this.isInitialized = true;
            console.log('✅ Service d\'authentification FORNAP initialisé');

        } catch (error) {
            console.error('❌ Erreur initialisation auth service:', error);
            throw error;
        }
    }

    /**
     * Ajoute un callback pour les changements d'état d'authentification
     */
    onAuthStateChanged(callback) {
        this.authCallbacks.push(callback);
        
        // Si déjà initialisé, appeler immédiatement le callback
        if (this.isInitialized) {
            callback(this.currentUser);
        }
    }

    /**
     * Notifie tous les callbacks des changements d'état
     */
    notifyAuthStateChange(user) {
        this.authCallbacks.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('❌ Erreur callback auth:', error);
            }
        });
        
        // Synchroniser l'état global des composants
        if (window.FornapComponents) {
            FornapComponents.syncAuthState(!!user);
        }
    }

    /**
     * Connexion avec email et mot de passe
     */
    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            
            // Mettre à jour la dernière connexion
            await this.updateLastLogin(userCredential.user.uid);
            
            return userCredential.user;
        } catch (error) {
            console.error('❌ Erreur connexion:', error);
            throw this.formatError(error);
        }
    }

    /**
     * Inscription avec email et mot de passe
     */
    async signUp(email, password, userData = {}) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Mettre à jour le profil Firebase si nom fourni
            if (userData.displayName) {
                await user.updateProfile({ displayName: userData.displayName });
            }
            
            // Créer le document utilisateur
            await this.createUserDocument(user, userData);
            
            return user;
        } catch (error) {
            console.error('❌ Erreur inscription:', error);
            throw this.formatError(error);
        }
    }

    /**
     * Déconnexion
     */
    async signOut() {
        try {
            // Nettoyer les variables locales AVANT la déconnexion Firebase
            this.currentUser = null;
            
            // Déconnexion Firebase
            await this.auth.signOut();
            
            // Nettoyer le stockage local
            try {
                localStorage.removeItem('fornap_auth_state');
                localStorage.removeItem('fornap_user_data');
                sessionStorage.clear();
            } catch (e) {
                console.warn('Nettoyage localStorage échoué:', e);
            }
            
            // Forcer la notification de changement d'état
            this.notifyAuthStateChange(null);
            
            console.log('✅ Déconnexion complète réussie');
        } catch (error) {
            console.error('❌ Erreur déconnexion:', error);
            
            // Même en cas d'erreur, nettoyer l'état local
            this.currentUser = null;
            this.notifyAuthStateChange(null);
            
            throw this.formatError(error);
        }
    }

    /**
     * Crée un document utilisateur dans Firestore
     */
    async createUserDocument(user, userData = {}) {
        const userDoc = {
            uid: user.uid,
            email: user.email,
            displayName: userData.displayName || user.displayName || '',
            createdAt: firebase.firestore.Timestamp.now(),
            lastLogin: firebase.firestore.Timestamp.now(),
            
            // Informations du profil
            profile: {
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phone: userData.phone || '',
                setupCompleted: false
            },
            
            // Statut de l'adhésion
            membership: {
                status: 'pending',
                plan: null,
                startDate: null
            },
            
            // Programme de fidélité
            loyalty: {
                points: 0,
                tier: 'bronze',
                totalEarned: 0,
                totalSpent: 0
            },
            
            // Préférences par défaut
            preferences: {
                notifications: true,
                newsletter: false,
                interests: []
            }
        };

        await this.db.collection('members').doc(user.uid).set(userDoc);
        console.log('✅ Document utilisateur créé');
        
        return userDoc;
    }

    /**
     * Met à jour la dernière connexion
     * Détecte automatiquement si c'est un admin ou un membre
     */
    async updateLastLogin(uid) {
        try {
            // Essayer d'abord dans la collection admins
            const adminDoc = await this.db.collection('admins').doc(uid).get();
            
            if (adminDoc.exists) {
                // C'est un admin - mettre à jour dans admins
                await this.db.collection('admins').doc(uid).update({
                    lastLogin: firebase.firestore.Timestamp.now(),
                    loginCount: firebase.firestore.FieldValue.increment(1)
                });
                console.log('✅ Dernière connexion admin mise à jour');
            } else {
                // Vérifier si le document existe dans users avant de le mettre à jour
                const userDoc = await this.db.collection('users').doc(uid).get();
                
                if (userDoc.exists) {
                    // C'est un utilisateur standard
                    await this.db.collection('users').doc(uid).update({
                        lastLogin: firebase.firestore.Timestamp.now()
                    });
                    console.log('✅ Dernière connexion utilisateur mise à jour');
                } else {
                    console.warn('⚠️ Aucun document trouvé pour UID:', uid);
                }
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour dernière connexion:', error);
        }
    }

    /**
     * Récupère les données utilisateur depuis Firestore
     */
    async getUserData(uid = null) {
        const userId = uid || (this.currentUser ? this.currentUser.uid : null);
        
        if (!userId) {
            throw new Error('Aucun utilisateur connecté');
        }

        try {
            // Essayer d'abord dans la collection admins
            const adminDoc = await this.db.collection('admins').doc(userId).get();
            
            if (adminDoc.exists) {
                const adminData = adminDoc.data();
                return {
                    email: adminData.email || this.currentUser.email,
                    userType: 'admin',
                    role: adminData.role,
                    profile: adminData.profile || {},
                    subscription: null, // Les admins n'ont pas d'abonnement
                    loyaltyPoints: 0,
                    createdAt: adminData.createdAt,
                    lastLogin: adminData.lastLogin
                };
            }
            
            // Puis dans la collection users
            const doc = await this.db.collection('users').doc(userId).get();
            
            if (doc.exists) {
                const userData = doc.data();
                
                // Formater les données pour le dashboard
                return {
                    email: userData.email || this.currentUser.email,
                    profile: {
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        phone: userData.phone || '',
                        city: userData.city || '',
                        profession: userData.profession || '',
                        motivation: userData.motivation || '',
                        discovery: userData.discovery || ''
                    },
                    stats: userData.stats || {
                        events: 0,
                        coworkingHours: 0,
                        savings: 0
                    },
                    subscription: userData.subscription || {},
                    loyalty: userData.loyalty || { enabled: false, points: 0, level: 'Débutant' }
                };
            } else {
                console.log('Document utilisateur non trouvé, création d\'un profil par défaut');
                // Retourner un profil par défaut basé sur les données Firebase Auth
                return {
                    email: this.currentUser.email,
                    profile: {
                        firstName: this.currentUser.displayName ? this.currentUser.displayName.split(' ')[0] : '',
                        lastName: this.currentUser.displayName ? this.currentUser.displayName.split(' ').slice(1).join(' ') : '',
                        phone: '',
                        city: '',
                        profession: '',
                        motivation: '',
                        discovery: ''
                    },
                    stats: {
                        events: 0,
                        coworkingHours: 0,
                        savings: 0
                    },
                    subscription: {},
                    loyalty: { enabled: false, points: 0, level: 'Débutant' }
                };
            }
        } catch (error) {
            console.error('❌ Erreur récupération données utilisateur:', error);
            throw error;
        }
    }

    /**
     * Met à jour les données utilisateur
     */
    async updateUserData(data, uid = null) {
        const userId = uid || (this.currentUser ? this.currentUser.uid : null);
        
        if (!userId) {
            throw new Error('Aucun utilisateur connecté');
        }

        try {
            await this.db.collection('users').doc(userId).update({
                ...data,
                updatedAt: firebase.firestore.Timestamp.now()
            });
            
            console.log('✅ Données utilisateur mises à jour');
        } catch (error) {
            console.error('❌ Erreur mise à jour données utilisateur:', error);
            throw error;
        }
    }

    /**
     * Vérifie si l'utilisateur est connecté
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Obtient l'utilisateur actuel
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Formate les erreurs Firebase
     */
    formatError(error) {
        const errorMessage = window.FornapConfig.errorMessages[error.code] || error.message;
        return {
            code: error.code,
            message: errorMessage,
            originalError: error
        };
    }

    /**
     * Réinitialise le mot de passe
     */
    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            console.log('✅ Email de réinitialisation envoyé');
        } catch (error) {
            console.error('❌ Erreur réinitialisation mot de passe:', error);
            throw this.formatError(error);
        }
    }

    /**
     * Vérifie si l'email est disponible
     */
    async isEmailAvailable(email) {
        try {
            const methods = await this.auth.fetchSignInMethodsForEmail(email);
            return methods.length === 0;
        } catch (error) {
            console.error('❌ Erreur vérification email:', error);
            return false;
        }
    }
}

// Instance globale du service
const fornapAuth = new FornapAuthService();

// Export global
window.FornapAuth = fornapAuth;

console.log('✅ Service d\'authentification FORNAP chargé'); 