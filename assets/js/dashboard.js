/* ========================================
   FORNAP - Module Dashboard
   Gestion du compte membre et dashboard
   ======================================== */

let userDashboardData = null;

/* ========================================
   AFFICHAGE DU DASHBOARD
   ======================================== */

async function showDashboard() {
    const currentUser = window.FORNAP.currentUser();
    
    if (!currentUser) {
        window.FORNAP.showMessage('Vous devez être connecté pour accéder au dashboard', 'error');
        return;
    }

    console.log('📊 Chargement du dashboard...');
    window.FORNAP.hideAllSections();
    
    try {
        // Charger les données utilisateur
        userDashboardData = await loadUserDashboardData(currentUser);
        
        // Créer l'interface du dashboard
        createDashboardInterface();
        
    } catch (error) {
        console.error('❌ Erreur chargement dashboard:', error);
        window.FORNAP.showMessage('Erreur lors du chargement du dashboard', 'error');
    }
}

async function loadUserDashboardData(user) {
    const [userDoc, subscriptionDoc, loyaltyPoints] = await Promise.all([
        firebase.firestore().collection('users').doc(user.uid).get(),
        firebase.firestore().collection('subscriptions').doc(user.uid).get(),
        firebase.firestore().collection('loyalty_points')
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .limit(10)
            .get()
    ]);

    const userData = userDoc.exists ? userDoc.data() : {};
    const subscriptionData = subscriptionDoc.exists ? subscriptionDoc.data() : null;
    const loyaltyHistory = loyaltyPoints.docs.map(doc => doc.data());

    return {
        user: userData,
        subscription: subscriptionData,
        loyaltyHistory: loyaltyHistory
    };
}

function createDashboardInterface() {
    const data = userDashboardData;
    const loyaltyLevel = calculateLoyaltyLevel(data.user.loyaltyPoints || 0);
    const nextBilling = data.subscription?.nextBillingDate?.toDate();

    const dashboardHTML = `
        <section class="form-section" id="dashboardSection">
            <div style="max-width: 1200px; margin: 0 auto;">
                <h2 class="text-center mb-2">Tableau de bord</h2>
                
                <!-- Stats principales -->
                <div class="dashboard-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                    
                    <!-- Abonnement -->
                    <div class="stats-card">
                        <h3>Mon abonnement</h3>
                        <div class="stats-content">
                            <p><strong>Forfait :</strong> ${data.subscription?.planName || 'Aucun'}</p>
                            <p><strong>Statut :</strong> 
                                <span class="status ${data.user.membershipStatus === 'active' ? 'active' : 'inactive'}">
                                    ${getStatusText(data.user.membershipStatus)}
                                </span>
                            </p>
                            ${nextBilling ? `<p><strong>Prochaine échéance :</strong> ${nextBilling.toLocaleDateString('fr-FR')}</p>` : ''}
                            <p><strong>Prix :</strong> ${data.subscription?.price || 0}€/mois</p>
                        </div>
                        <button id="managePlanBtn" class="btn btn-secondary mt-1" style="width: 100%;">
                            Gérer mon forfait
                        </button>
                    </div>

                    <!-- Programme fidélité -->
                    <div class="stats-card">
                        <h3>Programme fidélité</h3>
                        <div class="stats-content">
                            <p><strong>Points :</strong> ${data.user.loyaltyPoints || 0}</p>
                            <p><strong>Niveau :</strong> 
                                <span class="loyalty-level ${loyaltyLevel.name.toLowerCase()}" style="color: ${loyaltyLevel.color};">
                                    ${loyaltyLevel.name}
                                </span>
                            </p>
                            <div class="loyalty-progress" style="background: var(--gris-clair); height: 10px; margin-top: 1rem; border: 1px solid var(--noir-principal);">
                                <div style="background: ${loyaltyLevel.color}; height: 100%; width: ${loyaltyLevel.progress}%; transition: width 0.3s ease;"></div>
                            </div>
                            <p style="font-size: 0.8rem; color: var(--gris-moyen); margin-top: 0.5rem;">
                                ${loyaltyLevel.nextLevelPoints - (data.user.loyaltyPoints || 0)} points pour ${loyaltyLevel.nextLevel}
                            </p>
                        </div>
                    </div>

                    <!-- Activité récente -->
                    <div class="stats-card">
                        <h3>Activité récente</h3>
                        <div class="stats-content">
                            <p><strong>Dernière connexion :</strong> ${data.user.lastLogin ? new Date(data.user.lastLogin.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A'}</p>
                            <p><strong>Membre depuis :</strong> ${data.user.createdAt ? new Date(data.user.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A'}</p>
                            <p><strong>Visites ce mois :</strong> 12</p>
                            <p><strong>Événements participés :</strong> 3</p>
                        </div>
                    </div>
                </div>

                <!-- Navigation principale -->
                <div class="dashboard-nav" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <button id="profileBtn" class="nav-card-btn">
                        <h4>👤 Profil</h4>
                        <p>Gérer mes informations</p>
                    </button>
                    <button id="reservationsBtn" class="nav-card-btn">
                        <h4>📅 Réservations</h4>
                        <p>Espaces & événements</p>
                    </button>
                    <button id="loyaltyBtn" class="nav-card-btn">
                        <h4>⭐ Fidélité</h4>
                        <p>Points & récompenses</p>
                    </button>
                    <button id="settingsBtn" class="nav-card-btn">
                        <h4>⚙️ Paramètres</h4>
                        <p>Configuration compte</p>
                    </button>
                </div>

                <!-- Contenu dynamique -->
                <div id="dashboardContent" class="dashboard-content">
                    ${createProfileSection()}
                </div>
            </div>
        </section>
    `;

    // Injecter le HTML
    const mainContent = document.querySelector('.main-content');
    const tempSection = document.createElement('div');
    tempSection.innerHTML = dashboardHTML;
    const dashboardSection = tempSection.firstElementChild;
    mainContent.appendChild(dashboardSection);

    // Ajouter le CSS du dashboard
    addDashboardStyles();

    // Configurer les événements
    setupDashboardEvents();

    // Faire défiler vers la section
    dashboardSection.scrollIntoView({ behavior: 'smooth' });
}

/* ========================================
   SECTIONS DU DASHBOARD
   ======================================== */

function createProfileSection() {
    const data = userDashboardData;
    const profile = data.user.profile || {};

    return `
        <div class="content-section active" id="profileSection">
            <h3 class="mb-2">Informations personnelles</h3>
            
            <div class="profile-form">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div>
                        <div class="form-group">
                            <label for="editName">Nom complet</label>
                            <input type="text" id="editName" value="${data.user.displayName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="editEmail">Email</label>
                            <input type="email" id="editEmail" value="${data.user.email || ''}" disabled style="background: var(--gris-clair);">
                        </div>
                        <div class="form-group">
                            <label for="editPhone">Téléphone</label>
                            <input type="tel" id="editPhone" value="${profile.phone || ''}" required>
                        </div>
                    </div>
                    <div>
                        <div class="form-group">
                            <label for="editAddress">Adresse</label>
                            <input type="text" id="editAddress" value="${profile.address || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="editCompany">Entreprise</label>
                            <input type="text" id="editCompany" value="${profile.company || ''}" placeholder="Optionnel">
                        </div>
                        <div class="form-group">
                            <label for="editBio">Bio</label>
                            <textarea id="editBio" rows="3" placeholder="Parlez-nous de vous...">${profile.bio || ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions" style="margin-top: 2rem;">
                    <button id="saveProfileBtn" class="btn btn-primary">Sauvegarder les modifications</button>
                    <button id="cancelProfileBtn" class="btn btn-secondary">Annuler</button>
                </div>
            </div>
        </div>
    `;
}

function createReservationsSection() {
    return `
        <div class="content-section" id="reservationsSection">
            <h3 class="mb-2">Mes réservations</h3>
            
            <div class="reservations-tabs" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 2px solid var(--noir-principal);">
                <button class="tab-btn active" data-tab="spaces">Espaces</button>
                <button class="tab-btn" data-tab="events">Événements</button>
            </div>
            
            <div id="spacesTab" class="tab-content active">
                <div class="reservation-item">
                    <h4>Salle de réunion A</h4>
                    <p><strong>Date :</strong> 25 juillet 2025, 14:00 - 16:00</p>
                    <p><strong>Statut :</strong> <span class="status active">Confirmée</span></p>
                    <button class="btn btn-secondary">Modifier</button>
                </div>
                
                <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--gris-moyen);">
                    <p>Aucune autre réservation d'espace</p>
                    <button class="btn btn-primary">Réserver un espace</button>
                </div>
            </div>
            
            <div id="eventsTab" class="tab-content">
                <div class="reservation-item">
                    <h4>Workshop Innovation</h4>
                    <p><strong>Date :</strong> 30 juillet 2025, 18:30</p>
                    <p><strong>Statut :</strong> <span class="status active">Inscrit</span></p>
                </div>
                
                <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--gris-moyen);">
                    <p>Aucun autre événement inscrit</p>
                    <button class="btn btn-primary">Découvrir les événements</button>
                </div>
            </div>
        </div>
    `;
}

function createLoyaltySection() {
    const data = userDashboardData;
    const recentPoints = data.loyaltyHistory.slice(0, 5);

    return `
        <div class="content-section" id="loyaltySection">
            <h3 class="mb-2">Programme de fidélité</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div class="loyalty-summary">
                    <h4>Mes points</h4>
                    <div class="points-display" style="font-size: 2rem; font-weight: bold; color: var(--noir-principal);">
                        ${data.user.loyaltyPoints || 0}
                    </div>
                    <p style="color: var(--gris-moyen);">Points disponibles</p>
                </div>
                
                <div class="loyalty-rewards">
                    <h4>Récompenses disponibles</h4>
                    <div class="reward-item">
                        <span>Café gratuit (50 pts)</span>
                        <button class="btn btn-small ${(data.user.loyaltyPoints || 0) >= 50 ? 'btn-primary' : 'btn-secondary'}" ${(data.user.loyaltyPoints || 0) < 50 ? 'disabled' : ''}>
                            Échanger
                        </button>
                    </div>
                    <div class="reward-item">
                        <span>-10% boutique (200 pts)</span>
                        <button class="btn btn-small ${(data.user.loyaltyPoints || 0) >= 200 ? 'btn-primary' : 'btn-secondary'}" ${(data.user.loyaltyPoints || 0) < 200 ? 'disabled' : ''}>
                            Échanger
                        </button>
                    </div>
                </div>
            </div>
            
            <h4 class="mb-1">Historique des points</h4>
            <div class="points-history">
                ${recentPoints.map(point => `
                    <div class="history-item">
                        <span>${point.reason}</span>
                        <span class="points">+${point.points} pts</span>
                        <span class="date">${point.date ? new Date(point.date.seconds * 1000).toLocaleDateString('fr-FR') : ''}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createSettingsSection() {
    return `
        <div class="content-section" id="settingsSection">
            <h3 class="mb-2">Paramètres du compte</h3>
            
            <div class="settings-group">
                <h4>Notifications</h4>
                <label class="setting-item">
                    <input type="checkbox" checked> Email de facturation
                </label>
                <label class="setting-item">
                    <input type="checkbox" checked> Notifications d'événements
                </label>
                <label class="setting-item">
                    <input type="checkbox"> Newsletter FORNAP
                </label>
            </div>
            
            <div class="settings-group">
                <h4>Sécurité</h4>
                <button class="btn btn-secondary">Changer le mot de passe</button>
                <button class="btn btn-secondary">Configurer 2FA</button>
            </div>
            
            <div class="settings-group">
                <h4>Abonnement</h4>
                <button class="btn btn-secondary">Modifier le forfait</button>
                <button class="btn btn-secondary">Voir les factures</button>
                <button class="btn btn-error">Annuler l'abonnement</button>
            </div>
        </div>
    `;
}

/* ========================================
   GESTION DES ÉVÉNEMENTS DU DASHBOARD
   ======================================== */

function setupDashboardEvents() {
    // Navigation entre sections
    document.getElementById('profileBtn').addEventListener('click', () => showDashboardSection('profile'));
    document.getElementById('reservationsBtn').addEventListener('click', () => showDashboardSection('reservations'));
    document.getElementById('loyaltyBtn').addEventListener('click', () => showDashboardSection('loyalty'));
    document.getElementById('settingsBtn').addEventListener('click', () => showDashboardSection('settings'));

    // Sauvegarde du profil
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    document.getElementById('cancelProfileBtn').addEventListener('click', () => showDashboardSection('profile'));

    // Gestion du forfait
    document.getElementById('managePlanBtn').addEventListener('click', showPlanManagement);
}

function showDashboardSection(sectionName) {
    const content = document.getElementById('dashboardContent');
    
    // Retirer la classe active des boutons de navigation
    document.querySelectorAll('.nav-card-btn').forEach(btn => btn.classList.remove('active'));
    
    // Ajouter la classe active au bouton sélectionné
    document.getElementById(`${sectionName}Btn`).classList.add('active');
    
    // Charger le contenu approprié
    switch(sectionName) {
        case 'profile':
            content.innerHTML = createProfileSection();
            setupProfileEvents();
            break;
        case 'reservations':
            content.innerHTML = createReservationsSection();
            setupReservationsEvents();
            break;
        case 'loyalty':
            content.innerHTML = createLoyaltySection();
            break;
        case 'settings':
            content.innerHTML = createSettingsSection();
            break;
    }
}

function setupProfileEvents() {
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    document.getElementById('cancelProfileBtn').addEventListener('click', () => {
        showDashboardSection('profile');
    });
}

function setupReservationsEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            
            // Retirer active de tous les onglets
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Ajouter active à l'onglet sélectionné
            e.target.classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });
}

/* ========================================
   ACTIONS DU DASHBOARD
   ======================================== */

async function saveProfile() {
    const currentUser = window.FORNAP.currentUser();
    if (!currentUser) return;

    const profileData = {
        displayName: document.getElementById('editName').value,
        'profile.phone': document.getElementById('editPhone').value,
        'profile.address': document.getElementById('editAddress').value,
        'profile.company': document.getElementById('editCompany').value,
        'profile.bio': document.getElementById('editBio').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .update(profileData);

        // Mettre à jour le profil Firebase Auth
        await currentUser.updateProfile({
            displayName: profileData.displayName
        });

        window.FORNAP.showMessage('Profil mis à jour avec succès !', 'success');
        
        // Recharger les données
        userDashboardData = await loadUserDashboardData(currentUser);

    } catch (error) {
        console.error('❌ Erreur sauvegarde profil:', error);
        window.FORNAP.showMessage('Erreur lors de la sauvegarde', 'error');
    }
}

function showPlanManagement() {
    window.FORNAP.showMessage('Gestion des forfaits bientôt disponible', 'info');
}

/* ========================================
   UTILITAIRES
   ======================================== */

function calculateLoyaltyLevel(points) {
    const levels = [
        { name: 'Bronze', min: 0, max: 499, color: '#CD7F32', next: 'Argent' },
        { name: 'Argent', min: 500, max: 1499, color: '#C0C0C0', next: 'Or' },
        { name: 'Or', min: 1500, max: 2999, color: '#FFD700', next: 'Platine' },
        { name: 'Platine', min: 3000, max: Infinity, color: '#E5E4E2', next: 'Max' }
    ];

    const currentLevel = levels.find(level => points >= level.min && points <= level.max);
    const progress = currentLevel.max === Infinity ? 100 : 
        ((points - currentLevel.min) / (currentLevel.max - currentLevel.min + 1)) * 100;

    return {
        ...currentLevel,
        progress: Math.min(progress, 100),
        nextLevelPoints: currentLevel.max === Infinity ? currentLevel.min : currentLevel.max + 1
    };
}

function getStatusText(status) {
    const statusMap = {
        'active': 'Actif',
        'pending_payment': 'Paiement en attente',
        'suspended': 'Suspendu',
        'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
}

function addDashboardStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .stats-card {
            border: 2px solid var(--noir-principal);
            background: var(--blanc-principal);
            padding: 1.5rem;
            transition: var(--transition-base);
        }
        
        .stats-card:hover {
            background: var(--gris-tres-clair);
        }
        
        .nav-card-btn {
            border: 2px solid var(--noir-principal);
            background: var(--blanc-principal);
            color: var(--noir-principal);
            padding: 1.5rem;
            text-align: center;
            cursor: pointer;
            transition: var(--transition-base);
            font-family: inherit;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .nav-card-btn:hover,
        .nav-card-btn.active {
            background: var(--noir-principal);
            color: var(--blanc-principal);
        }
        
        .nav-card-btn h4 {
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .nav-card-btn p {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .content-section {
            display: none;
        }
        
        .content-section.active {
            display: block;
        }
        
        .status.active {
            color: var(--succes);
            font-weight: bold;
        }
        
        .status.inactive {
            color: var(--erreur);
            font-weight: bold;
        }
        
        .reservation-item,
        .history-item,
        .reward-item {
            border: 1px solid var(--gris-clair);
            padding: 1rem;
            margin-bottom: 1rem;
            background: var(--blanc-principal);
        }
        
        .reward-item,
        .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .tab-btn {
            padding: 0.5rem 1rem;
            border: none;
            background: transparent;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            font-weight: bold;
        }
        
        .tab-btn.active {
            border-bottom-color: var(--noir-principal);
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .setting-item {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
            cursor: pointer;
        }
        
        .setting-item input {
            margin-right: 0.5rem;
        }
        
        .settings-group {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--gris-clair);
        }
        
        .btn-small {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
        }
    `;
    document.head.appendChild(style);
}

/* ========================================
   EXPORT DES FONCTIONS PUBLIQUES
   ======================================== */

window.showDashboard = showDashboard;

console.log('📊 Module Dashboard FORNAP chargé'); 