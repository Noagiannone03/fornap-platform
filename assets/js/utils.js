/**
 * FORNAP - Utilitaires
 * Fonctions communes réutilisables dans toute l'application
 */

class FornapUtils {
    constructor() {
        this.messageContainer = null;
        this.loadingModal = null;
        this.initMessageContainer();
    }

    /**
     * Initialise le conteneur de messages
     */
    initMessageContainer() {
        // Chercher ou créer le conteneur de messages
        this.messageContainer = document.getElementById('messageContainer');
        
        if (!this.messageContainer) {
            this.messageContainer = document.createElement('div');
            this.messageContainer.id = 'messageContainer';
            this.messageContainer.className = 'message-container';
            document.body.appendChild(this.messageContainer);
        }
    }

    /**
     * Affiche un message à l'utilisateur
     */
    showMessage(message, type = 'info', duration = 4000) {
        console.log(`💬 Message [${type}]:`, message);
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${this.getMessageIcon(type)}</span>
                <span class="message-text">${message}</span>
                <button class="message-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        this.messageContainer.appendChild(messageElement);

        // Animation d'entrée
        setTimeout(() => messageElement.classList.add('show'), 100);

        // Suppression automatique
        if (duration > 0) {
            setTimeout(() => {
                messageElement.classList.remove('show');
                setTimeout(() => messageElement.remove(), 300);
            }, duration);
        }

        return messageElement;
    }

    /**
     * Retourne l'icône appropriée pour le type de message
     */
    getMessageIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳'
        };
        return icons[type] || icons.info;
    }

    /**
     * Affiche la modal de chargement
     */
    showLoading(title = 'Chargement...', message = 'Veuillez patienter') {
        if (!this.loadingModal) {
            this.createLoadingModal();
        }

        const titleElement = this.loadingModal.querySelector('.loading-title');
        const messageElement = this.loadingModal.querySelector('.loading-message');

        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;

        this.loadingModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cache la modal de chargement
     */
    hideLoading() {
        if (this.loadingModal) {
            this.loadingModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    /**
     * Crée la modal de chargement
     */
    createLoadingModal() {
        this.loadingModal = document.createElement('div');
        this.loadingModal.id = 'fornapLoadingModal';
        this.loadingModal.className = 'fornap-modal hidden';
        this.loadingModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h3 class="loading-title">Chargement...</h3>
                    <p class="loading-message">Veuillez patienter</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.loadingModal);
    }

    /**
     * Valide une adresse email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valide un mot de passe
     */
    validatePassword(password, minLength = 6) {
        return password && password.length >= minLength;
    }

    /**
     * Valide un numéro de téléphone français
     */
    validatePhone(phone) {
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Formate un numéro de téléphone
     */
    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
        
        if (match) {
            return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
        }
        
        return phone;
    }

    /**
     * Fait défiler vers un élément
     */
    scrollToElement(element, offset = 0) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }
        
        if (element) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Débounce une fonction
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    /**
     * Gère les erreurs de façon uniforme
     */
    handleError(error, context = '') {
        console.error(`❌ Erreur ${context}:`, error);
        
        let message = 'Une erreur est survenue';
        
        if (error && error.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        
        this.showMessage(message, 'error');
    }

    /**
     * Stocke des données dans sessionStorage de façon sécurisée
     */
    setSessionData(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('❌ Erreur stockage session:', error);
        }
    }

    /**
     * Récupère des données depuis sessionStorage
     */
    getSessionData(key, defaultValue = null) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('❌ Erreur récupération session:', error);
            return defaultValue;
        }
    }

    /**
     * Supprime des données de sessionStorage
     */
    removeSessionData(key) {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error('❌ Erreur suppression session:', error);
        }
    }

    /**
     * Nettoie toutes les données de session FORNAP
     */
    clearSessionData() {
        const fornapKeys = [
            'selectedPlan',
            'membershipData',
            'paymentData',
            'profileData',
            'userProfile'
        ];
        
        fornapKeys.forEach(key => this.removeSessionData(key));
        console.log('✅ Données de session FORNAP nettoyées');
    }

    /**
     * Formate une date en français
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        };
        
        return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(new Date(date));
    }

    /**
     * Formate un prix en euros
     */
    formatPrice(price, currency = 'EUR') {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency
        }).format(price);
    }

    /**
     * Génère un ID unique
     */
    generateId(prefix = 'fornap') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Détecte si l'utilisateur est sur mobile
     */
    isMobile() {
        return window.innerWidth <= 768;
    }

    /**
     * Copie du texte dans le presse-papiers
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('Copié dans le presse-papiers', 'success', 2000);
        } catch (error) {
            console.error('❌ Erreur copie presse-papiers:', error);
            this.showMessage('Erreur lors de la copie', 'error');
        }
    }
}

// Instance globale des utilitaires
const fornapUtils = new FornapUtils();

// Export global
window.FornapUtils = fornapUtils;

console.log('✅ Utilitaires FORNAP chargés'); 