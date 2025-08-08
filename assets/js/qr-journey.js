/**
 * FORNAP - Gestion du parcours QR Code pour anciens membres
 * Logique spécifique au scan QR code et reconnexion des anciens membres
 */

// Variables globales pour le parcours QR
let currentLegacyMember = null;
let qrScanResult = null;
let uploadedFile = null;

/**
 * Affiche la section de scan QR code
 */
function showQRScanner() {
    console.log('📱 Ouverture du scanner QR code');
    
    // Cacher toutes les autres sections
    document.querySelectorAll('.journey-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Afficher la section QR scan
    const qrSection = document.getElementById('qrScanSection');
    qrSection.classList.remove('hidden');
    
    // Mettre à jour la barre de progression si elle existe
    updateProgressStep(2);
    
    // Initialiser le service QR s'il ne l'est pas déjà
    initQRService();
    
    // Configurer l'upload zone
    setupQRUploadZone();
}

/**
 * Initialise le service QR scanner
 */
async function initQRService() {
    try {
        await window.FornapQRService.init();
        console.log('✅ Service QR scanner initialisé');
    } catch (error) {
        console.error('❌ Erreur initialisation QR service:', error);
        FornapUtils.showMessage('error', 'Erreur d\'initialisation du scanner QR');
    }
}

/**
 * Configure la zone d'upload QR code
 */
function setupQRUploadZone() {
    const uploadZone = document.getElementById('qrUploadZone');
    const fileInput = document.getElementById('qrFileInput');
    const processBtn = document.getElementById('processQRBtn');
    
    // Clic sur la zone d'upload
    uploadZone.addEventListener('click', () => {
        if (!uploadedFile) {
            fileInput.click();
        }
    });
    
    // Drag & drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleFileSelection(files[0]);
        } else {
            FornapUtils.showMessage('error', 'Veuillez sélectionner une image valide');
        }
    });
    
    // Changement de fichier
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });
}

/**
 * Gère la sélection d'un fichier image
 */
function handleFileSelection(file) {
    if (!file.type.startsWith('image/')) {
        FornapUtils.showMessage('error', 'Veuillez sélectionner une image (JPG, PNG)');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB max
        FornapUtils.showMessage('error', 'L\'image est trop volumineuse (maximum 10MB)');
        return;
    }
    
    uploadedFile = file;
    
    // Afficher la prévisualisation
    const preview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const uploadVisual = document.querySelector('.upload-visual');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadVisual.style.display = 'none';
        preview.style.display = 'block';
        
        // Activer le bouton de traitement
        document.getElementById('processQRBtn').disabled = false;
    };
    reader.readAsDataURL(file);
    
    console.log('📷 Fichier image sélectionné:', file.name);
}

/**
 * Remet à zéro l'upload QR
 */
function resetQRUpload() {
    uploadedFile = null;
    
    // Réinitialiser l'interface
    document.getElementById('qrFileInput').value = '';
    document.getElementById('uploadPreview').style.display = 'none';
    document.querySelector('.upload-visual').style.display = 'block';
    document.getElementById('processQRBtn').disabled = true;
}

/**
 * Traite le QR code uploadé
 */
async function processQRCode() {
    if (!uploadedFile) {
        FornapUtils.showMessage('error', 'Aucun fichier sélectionné');
        return;
    }
    
    try {
        // Afficher le loading
        FornapUtils.showLoading('Analyse du QR code en cours...', 'Reconnaissance du code QR');
        
        console.log('🔍 Traitement du QR code...');
        
        // Scanner le QR code dans l'image
        const qrData = await window.FornapQRService.processQRImage(uploadedFile);
        console.log('✅ QR code scanné:', qrData);
        
        // Traiter les données du membre
        const memberResult = await window.FornapQRService.processLegacyMember(qrData);
        
        // Cacher le loading
        FornapUtils.hideLoading();
        
        // Sauvegarder les résultats
        qrScanResult = qrData;
        currentLegacyMember = memberResult;
        
        // Rediriger selon l'état du membre
        if (memberResult.isActive) {
            showActiveMemberResult(memberResult);
        } else {
            showExpiredMemberResult(memberResult);
        }
        
    } catch (error) {
        FornapUtils.hideLoading();
        console.error('❌ Erreur traitement QR code:', error);
        
        let errorMessage = 'Erreur lors du scan du QR code';
        if (error.message.includes('Format de QR code')) {
            errorMessage = 'Ce QR code ne semble pas être un QR code FORNAP valide';
        } else if (error.message.includes('Aucun membre trouvé')) {
            errorMessage = 'Aucun membre trouvé avec cet identifiant';
        }
        
        FornapUtils.showMessage('error', errorMessage);
    }
}

/**
 * Affiche le résultat pour un membre actif
 */
function showActiveMemberResult(memberResult) {
    console.log('🎉 Membre actif retrouvé');
    
    // Mettre à jour les informations affichées
    const membershipDetails = document.getElementById('membershipDetails');
    const memberData = memberResult.memberData;
    
    membershipDetails.innerHTML = `
        <strong>${memberData.firstName} ${memberData.lastName}</strong><br>
        Type d'abonnement: ${memberData.memberType}<br>
        ${memberData.ticketType ? `Ticket: ${memberData.ticketType}<br>` : ''}
        Valable jusqu'au: ${formatDate(memberData.endMember)}
    `;
    
    // Cacher toutes les sections et afficher la section membre actif
    document.querySelectorAll('.journey-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    document.getElementById('activeMemberSection').classList.remove('hidden');
    updateProgressStep(5);
}

/**
 * Affiche le résultat pour un membre expiré
 */
function showExpiredMemberResult(memberResult) {
    console.log('⏰ Membre expiré retrouvé');
    
    // Mettre à jour les informations affichées
    const expiredDetails = document.getElementById('expiredMembershipDetails');
    const memberData = memberResult.memberData;
    
    expiredDetails.innerHTML = `
        <strong>${memberData.firstName} ${memberData.lastName}</strong><br>
        Ancien type d'abonnement: ${memberData.memberType}<br>
        ${memberData.ticketType ? `Ancien ticket: ${memberData.ticketType}<br>` : ''}
        Expiré le: ${formatDate(memberData.endMember)}
    `;
    
    // Cacher toutes les sections et afficher la section membre expiré
    document.querySelectorAll('.journey-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    document.getElementById('expiredMemberSection').classList.remove('hidden');
    updateProgressStep(3);
}

/**
 * Complète le profil d'un membre actif
 */
async function completeActiveMemberProfile() {
    try {
        // Afficher le loading
        FornapUtils.showLoading('Création de votre compte...', 'Configuration de votre profil');
        
        // Demander à l'utilisateur de créer un mot de passe
        showLegacyPasswordCreation(currentLegacyMember, 'active');
        
        FornapUtils.hideLoading();
        
    } catch (error) {
        FornapUtils.hideLoading();
        console.error('❌ Erreur complétion profil membre actif:', error);
        FornapUtils.showMessage('error', 'Erreur lors de la configuration du profil');
    }
}

/**
 * Renouvelle un abonnement expiré
 */
function renewExpiredMembership() {
    console.log('🔄 Renouvellement abonnement expiré');
    
    // Sauvegarder les données du membre pour pré-remplir le formulaire
    sessionStorage.setItem('legacyMemberData', JSON.stringify(currentLegacyMember.memberData));
    
    // Demander création de mot de passe d'abord
    showLegacyPasswordCreation(currentLegacyMember, 'expired');
}

/**
 * Affiche l'écran de création de mot de passe pour ancien membre
 */
function showLegacyPasswordCreation(memberResult, memberStatus) {
    const memberData = memberResult.memberData;
    
    // Mettre à jour le titre selon le statut
    const title = document.getElementById('legacyWelcomeTitle');
    const message = document.getElementById('legacyWelcomeMessage');
    
    if (memberStatus === 'active') {
        title.textContent = 'Heureux de vous revoir !';
        message.textContent = 'Créez votre mot de passe pour accéder à la nouvelle plateforme';
    } else {
        title.textContent = 'Bon retour parmi nous !';
        message.textContent = 'Créez votre mot de passe pour renouveler votre abonnement';
    }
    
    // Afficher les informations du membre
    const memberInfoCard = document.getElementById('memberInfoCard');
    memberInfoCard.innerHTML = `
        <div class="member-info">
            <div class="member-avatar">
                ${memberData.firstName.charAt(0)}${memberData.lastName.charAt(0)}
            </div>
            <div class="member-details">
                <h4>${memberData.firstName} ${memberData.lastName}</h4>
                <p>${memberData.email}</p>
                <p>${memberData.phone}</p>
                <small>Membre depuis: ${formatDate(memberData.createdAt)}</small>
            </div>
        </div>
    `;
    
    // Configurer la validation du mot de passe
    setupLegacyPasswordValidation();
    
    // Cacher toutes les sections et afficher la section mot de passe
    document.querySelectorAll('.journey-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    document.getElementById('legacyPasswordSection').classList.remove('hidden');
    updateProgressStep(4);
}

/**
 * Configure la validation du mot de passe pour ancien membre
 */
function setupLegacyPasswordValidation() {
    const passwordInput = document.getElementById('legacyPassword');
    const confirmInput = document.getElementById('legacyPasswordConfirm');
    const createBtn = document.getElementById('createLegacyBtn');
    
    function validatePasswords() {
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        
        const isValid = password.length >= 6 && password === confirm;
        createBtn.disabled = !isValid;
        
        // Validation visuelle
        if (password.length > 0 && password.length < 6) {
            passwordInput.classList.add('error');
        } else {
            passwordInput.classList.remove('error');
        }
        
        if (confirm.length > 0 && password !== confirm) {
            confirmInput.classList.add('error');
        } else {
            confirmInput.classList.remove('error');
        }
    }
    
    passwordInput.addEventListener('input', validatePasswords);
    confirmInput.addEventListener('input', validatePasswords);
}

/**
 * Crée le compte pour un ancien membre
 */
async function createLegacyAccount() {
    const password = document.getElementById('legacyPassword').value;
    
    if (password.length < 6) {
        FornapUtils.showMessage('error', 'Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    try {
        // Afficher le loading
        FornapUtils.showLoading('Création de votre compte...', 'Configuration de votre profil FORNAP');
        
        // Traiter le membre avec le mot de passe
        const result = await window.FornapQRService.processLegacyMember(qrScanResult, password);
        
        console.log('✅ Compte ancien membre créé:', result);
        
        // Sauvegarder les données utilisateur
        sessionStorage.setItem('legacyUserData', JSON.stringify(result.userData));
        sessionStorage.setItem('memberStatus', currentLegacyMember.isActive ? 'active' : 'expired');
        
        FornapUtils.hideLoading();
        
        // Rediriger selon le statut
        if (currentLegacyMember.isActive) {
            // Membre actif -> aller au profil setup pour compléter les infos manquantes
            window.location.href = 'profile-setup.html?legacy=active';
        } else {
            // Membre expiré -> aller vers la sélection de forfait avec données pré-remplies
            sessionStorage.setItem('preFillData', JSON.stringify({
                firstName: currentLegacyMember.memberData.firstName,
                lastName: currentLegacyMember.memberData.lastName,
                email: currentLegacyMember.memberData.email,
                phone: currentLegacyMember.memberData.phone,
                isLegacyMember: true
            }));
            
            // Retour à la sélection de forfait
            showSection('planSection');
            updateProgressStep(3);
        }
        
    } catch (error) {
        FornapUtils.hideLoading();
        console.error('❌ Erreur création compte ancien membre:', error);
        
        let errorMessage = 'Erreur lors de la création du compte';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Un compte existe déjà avec cette adresse email. Essayez de vous connecter.';
        }
        
        FornapUtils.showMessage('error', errorMessage);
    }
}

/**
 * Retour vers le scan QR
 */
function backToQRScan() {
    showQRScanner();
}

/**
 * Utilitaire pour formater les dates
 */
function formatDate(date) {
    if (!date) return 'Non défini';
    
    try {
        let dateObj;
        if (date.toDate) {
            dateObj = date.toDate();
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            dateObj = new Date(date);
        }
        
        return dateObj.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Erreur formatage date:', error);
        return 'Date invalide';
    }
}

/**
 * Met à jour l'étape de progression
 */
function updateProgressStep(step) {
    const indicators = document.querySelectorAll('.progress-indicator');
    const progressFill = document.getElementById('progressFill');
    
    if (indicators.length === 0 || !progressFill) return;
    
    // Mettre à jour les indicateurs
    indicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        if (stepNumber <= step) {
            indicator.classList.add('completed');
        } else {
            indicator.classList.remove('completed');
        }
        
        if (stepNumber === step) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
    
    // Mettre à jour la barre de progression
    const progress = (step / indicators.length) * 100;
    progressFill.style.width = `${progress}%`;
}

/**
 * Affiche une section spécifique
 */
function showSection(sectionId) {
    document.querySelectorAll('.journey-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

console.log('✅ Module QR Journey chargé');