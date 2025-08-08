/**
 * FORNAP - Service de scan QR code pour migration membres
 * Gestion du scan QR code et migration des anciens membres vers le nouveau système
 */

class FornapQRService {
    constructor() {
        this.isInitialized = false;
        this.canvas = null;
        this.context = null;
    }

    /**
     * Initialise le service QR scanner
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // Créer un canvas pour traiter l'image
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');
            
            this.isInitialized = true;
            console.log('✅ Service QR Scanner FORNAP initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation QR service:', error);
            throw error;
        }
    }

    /**
     * Traite l'upload d'une image QR code
     */
    async processQRImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const imageData = e.target.result;
                    const qrData = await this.scanQRFromImage(imageData);
                    resolve(qrData);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Erreur lecture du fichier'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Scan d'un QR code depuis une image
     * Pour une implémentation basique, nous allons simuler le scan
     */
    async scanQRFromImage(imageDataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                try {
                    // Redimensionner l'image si nécessaire
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;
                    this.context.drawImage(img, 0, 0);
                    
                    // Pour une démonstration, on va simuler l'extraction
                    // Dans un vrai projet, on utiliserait une bibliothèque comme jsQR
                    const simulatedQRData = this.simulateQRScan();
                    
                    if (simulatedQRData) {
                        resolve(simulatedQRData);
                    } else {
                        reject(new Error('Aucun QR code FORNAP détecté dans cette image'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => {
                reject(new Error('Impossible de charger l\'image'));
            };
            
            img.src = imageDataURL;
        });
    }

    /**
     * Simulation de scan QR pour démonstration
     * En production, remplacer par une vraie bibliothèque de scan QR
     */
    simulateQRScan() {
        // Pour la démo, on génère un UID simulé
        // En réalité, on analyserait vraiment l'image
        const possibleUIDs = [
            '04f18e92-28b4-49ca-8bc9-024e06453bf1',
            'a8b7c2d1-3e4f-5678-9abc-def012345678',
            'f9e8d7c6-b5a4-9382-7165-504938271635'
        ];
        
        const randomUID = possibleUIDs[Math.floor(Math.random() * possibleUIDs.length)];
        return `FORNAP-MEMBER: ${randomUID}`;
    }

    /**
     * Extrait l'UID depuis les données QR scannées
     */
    extractUID(qrData) {
        if (!qrData || typeof qrData !== 'string') {
            throw new Error('Données QR invalides');
        }

        // Vérifier le format FORNAP-MEMBER: UID
        const pattern = /^FORNAP-MEMBER:\s+(.+)$/;
        const match = qrData.match(pattern);
        
        if (!match) {
            throw new Error('Format de QR code FORNAP invalide. Le format attendu est "FORNAP-MEMBER: [UID]"');
        }
        
        const uid = match[1].trim();
        
        if (!uid) {
            throw new Error('UID manquant dans le QR code');
        }
        
        console.log('✅ UID extrait du QR code:', uid);
        return uid;
    }

    /**
     * Récupère les données d'un ancien membre depuis la collection members
     */
    async getMemberData(uid) {
        if (!window.FornapAuth.isInitialized || !window.FornapAuth.db) {
            throw new Error('Service d\'authentification non initialisé');
        }

        try {
            const memberDoc = await window.FornapAuth.db.collection('members').doc(uid).get();
            
            if (!memberDoc.exists) {
                throw new Error('Aucun membre trouvé avec cet identifiant');
            }
            
            const memberData = memberDoc.data();
            console.log('✅ Données membre récupérées:', memberData);
            
            return {
                uid: uid,
                email: memberData.email,
                firstName: memberData.firstName,
                lastName: memberData.lastName,
                phone: memberData.phone,
                birthDate: memberData.birthDate,
                postalCode: memberData.postalCode,
                memberType: memberData['member-type'],
                ticketType: memberData.ticketType,
                createdAt: memberData.createdAt,
                endMember: memberData['end-member'],
                // Champs calculés
                isActive: this.checkMembershipActive(memberData['end-member'])
            };
        } catch (error) {
            console.error('❌ Erreur récupération données membre:', error);
            throw error;
        }
    }

    /**
     * Vérifie si l'abonnement d'un membre est encore actif
     */
    checkMembershipActive(endMemberDate) {
        if (!endMemberDate) return false;
        
        try {
            let endDate;
            
            // Gérer les différents formats de date possible
            if (endMemberDate.toDate) {
                // Timestamp Firebase
                endDate = endMemberDate.toDate();
            } else if (endMemberDate instanceof Date) {
                endDate = endMemberDate;
            } else if (typeof endMemberDate === 'string') {
                endDate = new Date(endMemberDate);
            } else {
                console.warn('⚠️ Format de date non reconnu:', endMemberDate);
                return false;
            }
            
            const now = new Date();
            return endDate > now;
        } catch (error) {
            console.error('❌ Erreur vérification date expiration:', error);
            return false;
        }
    }

    /**
     * Migre un ancien membre vers la nouvelle collection users
     */
    async migrateMemberToUsers(memberData) {
        if (!window.FornapAuth.isInitialized || !window.FornapAuth.db) {
            throw new Error('Service d\'authentification non initialisé');
        }

        try {
            // Vérifier si l'utilisateur existe déjà dans users
            const existingUser = await window.FornapAuth.db.collection('users').doc(memberData.uid).get();
            
            if (existingUser.exists) {
                console.log('✅ Utilisateur déjà migré dans la collection users');
                return existingUser.data();
            }

            // Créer le nouveau document user avec les données migrées
            const userData = {
                uid: memberData.uid,
                email: memberData.email,
                firstName: memberData.firstName,
                lastName: memberData.lastName,
                phone: memberData.phone,
                
                // Informations de migration
                migratedFrom: 'members',
                migratedAt: firebase.firestore.Timestamp.now(),
                originalCreatedAt: memberData.createdAt,
                
                // Profil étendu
                profile: {
                    firstName: memberData.firstName,
                    lastName: memberData.lastName,
                    phone: memberData.phone,
                    postalCode: memberData.postalCode,
                    setupCompleted: false // Il faudra compléter le profil
                },
                
                // Abonnement basé sur les données anciennes
                subscription: {
                    status: memberData.isActive ? 'active' : 'expired',
                    plan: memberData.memberType,
                    originalEndDate: memberData.endMember,
                    ticketType: memberData.ticketType,
                    needsRenewal: !memberData.isActive
                },
                
                // Métadonnées
                createdAt: firebase.firestore.Timestamp.now(),
                updatedAt: firebase.firestore.Timestamp.now(),
                lastLogin: firebase.firestore.Timestamp.now(),
                
                // Données par défaut pour le nouveau système
                preferences: {
                    notifications: true,
                    newsletter: false,
                    interests: []
                },
                
                loyalty: {
                    points: 0,
                    tier: 'bronze',
                    totalEarned: 0,
                    totalSpent: 0
                }
            };

            // Sauvegarder dans la collection users
            await window.FornapAuth.db.collection('users').doc(memberData.uid).set(userData);
            
            console.log('✅ Membre migré vers collection users');
            return userData;
            
        } catch (error) {
            console.error('❌ Erreur migration membre:', error);
            throw error;
        }
    }

    /**
     * Crée un compte Firebase Auth pour un ancien membre
     */
    async createFirebaseAccount(memberData, password) {
        try {
            // Créer le compte Firebase Auth
            const userCredential = await window.FornapAuth.auth.createUserWithEmailAndPassword(
                memberData.email, 
                password
            );
            
            const firebaseUser = userCredential.user;
            
            // Mettre à jour le profil Firebase
            await firebaseUser.updateProfile({
                displayName: `${memberData.firstName} ${memberData.lastName}`
            });
            
            console.log('✅ Compte Firebase créé pour ancien membre');
            return firebaseUser;
            
        } catch (error) {
            console.error('❌ Erreur création compte Firebase:', error);
            throw error;
        }
    }

    /**
     * Processus complet de reconnaissance d'un ancien membre
     */
    async processLegacyMember(qrData, password = null) {
        try {
            // 1. Extraire l'UID du QR code
            const uid = this.extractUID(qrData);
            
            // 2. Récupérer les données de l'ancien membre
            const memberData = await this.getMemberData(uid);
            
            // 3. Vérifier l'état de l'abonnement
            const result = {
                memberData: memberData,
                isActive: memberData.isActive,
                needsRenewal: !memberData.isActive,
                needsPasswordCreation: !password
            };
            
            // 4. Si un mot de passe est fourni, créer le compte complet
            if (password) {
                try {
                    const firebaseUser = await this.createFirebaseAccount(memberData, password);
                    result.firebaseUser = firebaseUser;
                    
                    // 5. Migrer vers la collection users
                    const userData = await this.migrateMemberToUsers(memberData);
                    result.userData = userData;
                    
                } catch (authError) {
                    // Si l'email existe déjà, on peut quand même faire la migration des données
                    if (authError.code === 'auth/email-already-in-use') {
                        console.log('📧 Email déjà utilisé, migration des données seulement');
                        const userData = await this.migrateMemberToUsers(memberData);
                        result.userData = userData;
                        result.emailAlreadyExists = true;
                    } else {
                        throw authError;
                    }
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Erreur traitement ancien membre:', error);
            throw error;
        }
    }
}

// Instance globale du service
const fornapQRService = new FornapQRService();

// Export global
window.FornapQRService = fornapQRService;

console.log('✅ Service QR Scanner FORNAP chargé');