/**
 * FORNAP Admin - Script d'Installation
 * Script pour créer des comptes administrateur de test
 * 
 * ATTENTION: Ce script est à exécuter dans la console Firebase ou via un environnement Node.js
 * Il nécessite les privilèges administrateur Firebase pour créer des comptes
 */

// ===========================================
// CONFIGURATION - À ADAPTER SELON VOS BESOINS
// ===========================================

const ADMIN_ACCOUNTS = [
    {
        email: 'admin@fornap.com',
        password: 'Admin123!',
        role: 'super_admin',
        profile: {
            firstName: 'Super',
            lastName: 'Admin',
            department: 'Direction',
            phone: '+33123456789'
        }
    },
    {
        email: 'moderateur@fornap.com', 
        password: 'Modo123!',
        role: 'moderator',
        profile: {
            firstName: 'Jean',
            lastName: 'Moderateur', 
            department: 'Community',
            phone: '+33123456790'
        }
    },
    {
        email: 'editeur@fornap.com',
        password: 'Edit123!', 
        role: 'editor',
        profile: {
            firstName: 'Marie',
            lastName: 'Éditrice',
            department: 'Content',
            phone: '+33123456791'
        }
    }
];

// ===========================================
// FONCTIONS D'INSTALLATION
// ===========================================

/**
 * Créer tous les comptes administrateur
 * À exécuter dans la console Firebase Admin SDK
 */
async function createAdminAccounts() {
    console.log('🚀 Création des comptes administrateur FORNAP...');
    
    for (const accountData of ADMIN_ACCOUNTS) {
        try {
            await createSingleAdminAccount(accountData);
            console.log(`✅ Compte ${accountData.role} créé : ${accountData.email}`);
        } catch (error) {
            console.error(`❌ Erreur création ${accountData.email}:`, error.message);
        }
    }
    
    console.log('✅ Installation terminée !');
    console.log('\n📋 Comptes créés :');
    ADMIN_ACCOUNTS.forEach(account => {
        console.log(`  • ${account.email} (${account.role}) - Password: ${account.password}`);
    });
}

/**
 * Crée un seul compte administrateur  
 */
async function createSingleAdminAccount(accountData) {
    const { email, password, role, profile } = accountData;
    
    // 1. Créer l'utilisateur Firebase Auth
    const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        emailVerified: true,
        displayName: `${profile.firstName} ${profile.lastName}`
    });
    
    // 2. Créer le document admin dans Firestore
    const adminDoc = {
        email: email,
        role: role,
        status: 'active',
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: 'system',
        profile: profile,
        lastLogin: null,
        loginCount: 0,
        permissions: getPermissionsForRole(role)
    };
    
    await admin.firestore()
        .collection('admins')
        .doc(userRecord.uid)
        .set(adminDoc);
    
    return userRecord;
}

/**
 * Retourne les permissions selon le rôle
 */
function getPermissionsForRole(role) {
    const permissions = {
        'super_admin': ['*'], // Toutes les permissions
        'admin': [
            'users.read', 'users.write', 'users.delete',
            'events.read', 'events.write', 'events.delete', 
            'statistics.read', 'settings.read', 'settings.write',
            'admins.read'
        ],
        'moderator': [
            'users.read', 'users.write',
            'events.read', 'events.write',
            'statistics.read'
        ],
        'editor': [
            'events.read', 'events.write',
            'statistics.read'
        ]
    };
    
    return permissions[role] || [];
}

// ===========================================
// SCRIPTS DE TEST ET VÉRIFICATION
// ===========================================

/**
 * Vérifier que tous les comptes admin sont bien créés
 */
async function verifyAdminAccounts() {
    console.log('🔍 Vérification des comptes admin...');
    
    const adminsSnapshot = await admin.firestore()
        .collection('admins')
        .get();
    
    console.log(`📊 ${adminsSnapshot.size} compte(s) admin trouvé(s) :`);
    
    adminsSnapshot.forEach(doc => {
        const admin = doc.data();
        console.log(`  • ${admin.email} (${admin.role}) - Statut: ${admin.status}`);
    });
}

/**
 * Créer des données de test pour le dashboard
 */
async function createTestData() {
    console.log('📊 Création de données de test...');
    
    // Créer quelques événements de test
    const testEvents = [
        {
            title: 'Concert Jazz au FORNAP',
            description: 'Soirée jazz avec des musiciens locaux',
            category: 'musique',
            date: '2024-02-15',
            time: '20:00',
            location: 'Salle principale',
            price: 15,
            maxAttendees: 50,
            status: 'published',
            createdAt: admin.firestore.Timestamp.now(),
            attendees: 25
        },
        {
            title: 'Atelier Entrepreneuriat',
            description: 'Workshop sur la création d\'entreprise',
            category: 'atelier', 
            date: '2024-02-20',
            time: '14:00',
            location: 'Espace coworking',
            price: 0,
            maxAttendees: 20,
            status: 'published',
            createdAt: admin.firestore.Timestamp.now(),
            attendees: 12
        },
        {
            title: 'Conférence Tech Trends 2024',
            description: 'Les tendances technologiques de demain',
            category: 'conference',
            date: '2024-02-25', 
            time: '19:00',
            location: 'Auditorium',
            price: 25,
            maxAttendees: 100,
            status: 'draft',
            createdAt: admin.firestore.Timestamp.now(),
            attendees: 0
        }
    ];
    
    const eventsCollection = admin.firestore().collection('events');
    
    for (const event of testEvents) {
        await eventsCollection.add(event);
    }
    
    console.log(`✅ ${testEvents.length} événements de test créés`);
    
    // Créer quelques utilisateurs de test
    const testUsers = [
        {
            email: 'user1@test.com',
            firstName: 'Pierre',
            lastName: 'Dupont',
            phone: '+33123456792',
            city: 'Paris',
            profession: 'Développeur',
            subscription: {
                plan: 'mensuel',
                status: 'active',
                startDate: admin.firestore.Timestamp.now()
            },
            stats: { events: 3, coworkingHours: 25, savings: 50 },
            loyalty: { points: 120, level: 'Bronze' },
            createdAt: admin.firestore.Timestamp.fromDate(new Date('2023-12-01'))
        },
        {
            email: 'user2@test.com', 
            firstName: 'Sophie',
            lastName: 'Martin',
            phone: '+33123456793',
            city: 'Lyon',
            profession: 'Designer',
            subscription: {
                plan: 'annuel',
                status: 'active', 
                startDate: admin.firestore.Timestamp.now()
            },
            stats: { events: 8, coworkingHours: 45, savings: 150 },
            loyalty: { points: 350, level: 'Silver' },
            createdAt: admin.firestore.Timestamp.fromDate(new Date('2023-10-15'))
        },
        {
            email: 'user3@test.com',
            firstName: 'Thomas',
            lastName: 'Leroy', 
            phone: '+33123456794',
            city: 'Marseille',
            profession: 'Consultant',
            subscription: {
                plan: 'none',
                status: 'none'
            },
            stats: { events: 1, coworkingHours: 5, savings: 0 },
            loyalty: { points: 25, level: 'Bronze' },
            createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-10'))
        }
    ];
    
    const usersCollection = admin.firestore().collection('users');
    
    for (const user of testUsers) {
        await usersCollection.add(user);
    }
    
    console.log(`✅ ${testUsers.length} utilisateurs de test créés`);
}

/**
 * Nettoyer toutes les données de test
 */
async function cleanTestData() {
    console.log('🧹 Nettoyage des données de test...');
    
    // Supprimer les admins (sauf super admin)
    const adminsToDelete = await admin.firestore()
        .collection('admins')
        .where('role', '!=', 'super_admin')
        .get();
    
    for (const doc of adminsToDelete.docs) {
        await doc.ref.delete();
        // Supprimer aussi le compte Auth
        try {
            await admin.auth().deleteUser(doc.id);
        } catch (e) {
            console.warn(`Impossible de supprimer l'utilisateur Auth ${doc.id}`);
        }
    }
    
    console.log(`✅ ${adminsToDelete.size} comptes admin supprimés`);
}

// ===========================================
// INSTRUCTIONS D'UTILISATION 
// ===========================================

console.log(`
🎛️ FORNAP Admin Setup Script
============================

Pour installer le dashboard admin, exécutez dans la console Firebase Admin SDK :

1. Créer les comptes admin :
   await createAdminAccounts();

2. Créer des données de test (optionnel) :
   await createTestData();

3. Vérifier l'installation :
   await verifyAdminAccounts();

4. Nettoyer les données de test :
   await cleanTestData();

COMPTES ADMIN QUI SERONT CRÉÉS :
${ADMIN_ACCOUNTS.map(acc => `• ${acc.email} (${acc.role}) - ${acc.password}`).join('\n')}

⚠️  IMPORTANT : 
- Changez les mots de passe par défaut après installation
- Assurez-vous d'avoir les droits Firebase Admin SDK
- Testez d'abord sur un environnement de développement

🔗 Accès dashboard : /admin-panel/admin.html
`);

// Export des fonctions pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createAdminAccounts,
        createSingleAdminAccount, 
        verifyAdminAccounts,
        createTestData,
        cleanTestData,
        ADMIN_ACCOUNTS
    };
}