/**
 * FORNAP Admin - Components Service
 * Composants UI réutilisables pour le dashboard admin
 * Modals, notifications, forms, etc.
 */

class FornapAdminComponents {
    constructor() {
        this.activeModals = new Map();
        this.activeNotifications = new Map();
        this.notificationId = 0;
        this.modalId = 0;
        
        // Configuration des animations
        this.animationDuration = 300;
    }

    /**
     * Affiche une notification toast
     */
    showNotification(type = 'info', message, title = null, duration = 5000) {
        const notificationId = `notification-${++this.notificationId}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.id = notificationId;
        notification.dataset.timestamp = Date.now();
        
        const content = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="window.AdminComponents.closeNotification('${notificationId}')">×</button>
        `;
        
        notification.innerHTML = content;
        
        // Ajouter au container
        let container = document.getElementById('adminNotifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adminNotifications';
            container.className = 'admin-notifications-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Animation d'entrée
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Stockage et auto-fermeture
        this.activeNotifications.set(notificationId, notification);
        
        if (duration > 0) {
            setTimeout(() => {
                this.closeNotification(notificationId);
            }, duration);
        }
        
        return notificationId;
    }

    /**
     * Ferme une notification
     */
    closeNotification(notificationId) {
        const notification = this.activeNotifications.get(notificationId);
        if (!notification) return;
        
        // Animation de sortie
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.activeNotifications.delete(notificationId);
        }, this.animationDuration);
    }

    /**
     * Affiche une modal de confirmation
     */
    showConfirmModal(options = {}) {
        const {
            title = 'Confirmation',
            message = 'Êtes-vous sûr ?',
            type = 'default',
            confirmText = 'Confirmer',
            cancelText = 'Annuler',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;

        const modalId = `confirm-modal-${++this.modalId}`;
        
        const iconsByType = {
            danger: '⚠️',
            warning: '⚠️',
            success: '✅',
            info: 'ℹ️',
            default: '❓'
        };

        const modalHtml = `
            <div class="modal-backdrop" id="${modalId}">
                <div class="modal confirm-modal">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <span class="modal-icon">${iconsByType[type] || iconsByType.default}</span>
                            ${title}
                        </h3>
                    </div>
                    <div class="modal-body">
                        <p class="confirm-message">${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-admin btn-secondary" onclick="window.AdminComponents.closeModal('${modalId}', true)">
                            ${cancelText}
                        </button>
                        <button class="btn-admin btn-${type === 'danger' ? 'error' : 'primary'}" 
                                onclick="window.AdminComponents.confirmAction('${modalId}')">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter au DOM
        let container = document.getElementById('adminModals');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adminModals';
            container.className = 'admin-modals-container';
            document.body.appendChild(container);
        }

        container.innerHTML = modalHtml;

        // Stocker les callbacks
        this.activeModals.set(modalId, {
            onConfirm,
            onCancel,
            element: document.getElementById(modalId)
        });

        return modalId;
    }

    /**
     * Ferme une modal
     */
    closeModal(modalId, cancelled = false) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;

        const modal = modalData.element;
        if (modal) {
            // Animation de fermeture
            modal.style.opacity = '0';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, this.animationDuration);
        }

        // Appeler le callback d'annulation si nécessaire
        if (cancelled && modalData.onCancel) {
            modalData.onCancel();
        }

        this.activeModals.delete(modalId);
    }

    /**
     * Confirme une action et ferme la modal
     */
    confirmAction(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;

        // Appeler le callback de confirmation
        if (modalData.onConfirm) {
            modalData.onConfirm();
        }

        this.closeModal(modalId);
    }

    /**
     * Affiche un indicateur de chargement
     */
    showLoading(message = 'Chargement...') {
        let loader = document.getElementById('globalLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.className = 'loading-overlay';
            document.body.appendChild(loader);
        }

        loader.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;

        loader.style.display = 'flex';
    }

    /**
     * Cache l'indicateur de chargement
     */
    hideLoading() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Crée un formulaire modal générique
     */
    showFormModal(options = {}) {
        const {
            title = 'Formulaire',
            fields = [],
            submitText = 'Valider',
            cancelText = 'Annuler',
            onSubmit = () => {},
            onCancel = () => {}
        } = options;

        const modalId = `form-modal-${++this.modalId}`;
        
        const fieldsHtml = fields.map(field => {
            const {
                name,
                label,
                type = 'text',
                required = false,
                placeholder = '',
                value = '',
                options = []
            } = field;

            let inputHtml = '';
            
            switch (type) {
                case 'select':
                    inputHtml = `
                        <select name="${name}" class="form-input" ${required ? 'required' : ''}>
                            <option value="">Sélectionner...</option>
                            ${options.map(opt => 
                                `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
                            ).join('')}
                        </select>
                    `;
                    break;
                    
                case 'textarea':
                    inputHtml = `
                        <textarea name="${name}" class="form-textarea" rows="4" 
                                placeholder="${placeholder}" ${required ? 'required' : ''}>${value}</textarea>
                    `;
                    break;
                    
                default:
                    inputHtml = `
                        <input type="${type}" name="${name}" class="form-input" 
                               placeholder="${placeholder}" value="${value}" ${required ? 'required' : ''}>
                    `;
            }

            return `
                <div class="form-group">
                    <label class="form-label">${label}${required ? ' *' : ''}</label>
                    ${inputHtml}
                </div>
            `;
        }).join('');

        const modalHtml = `
            <div class="modal-backdrop" id="${modalId}">
                <div class="modal form-modal">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="window.AdminComponents.closeModal('${modalId}', true)">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="${modalId}-form">
                            ${fieldsHtml}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-admin btn-secondary" onclick="window.AdminComponents.closeModal('${modalId}', true)">
                            ${cancelText}
                        </button>
                        <button class="btn-admin btn-primary" onclick="window.AdminComponents.submitForm('${modalId}')">
                            ${submitText}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter au DOM
        let container = document.getElementById('adminModals');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adminModals';
            container.className = 'admin-modals-container';
            document.body.appendChild(container);
        }

        container.innerHTML = modalHtml;

        // Stocker les callbacks
        this.activeModals.set(modalId, {
            onSubmit,
            onCancel,
            element: document.getElementById(modalId)
        });

        return modalId;
    }

    /**
     * Soumet un formulaire modal
     */
    submitForm(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;

        const form = document.getElementById(`${modalId}-form`);
        if (!form) return;

        // Valider le formulaire
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Récupérer les données
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Appeler le callback
        if (modalData.onSubmit) {
            modalData.onSubmit(data);
        }

        this.closeModal(modalId);
    }

    /**
     * Nettoie toutes les notifications et modals
     */
    cleanup() {
        // Fermer toutes les notifications
        for (const [id] of this.activeNotifications) {
            this.closeNotification(id);
        }

        // Fermer toutes les modals
        for (const [id] of this.activeModals) {
            this.closeModal(id);
        }

        // Cacher le loader
        this.hideLoading();
    }
}

// Instance globale
const adminComponents = new FornapAdminComponents();
window.AdminComponents = adminComponents;

// Méthodes statiques pour compatibilité
window.AdminComponents.closeNotification = (id) => adminComponents.closeNotification(id);
window.AdminComponents.closeModal = (id, cancelled) => adminComponents.closeModal(id, cancelled);
window.AdminComponents.confirmAction = (id) => adminComponents.confirmAction(id);
window.AdminComponents.submitForm = (id) => adminComponents.submitForm(id);

console.log('✅ Service Admin Components chargé');