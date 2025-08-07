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
        
        const content = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="FornapAdminComponents.closeNotification('${notificationId}')">×</button>
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
     * Crée et affiche une modal
     */
    showModal(options = {}) {
        const modalId = `modal-${++this.modalId}`;
        
        const defaults = {
            title: 'Modal',
            content: '',
            size: 'medium', // small, medium, large, full
            closable: true,
            actions: [],
            onClose: null,
            onShow: null
        };
        
        const config = { ...defaults, ...options };
        
        // Créer la structure de la modal
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        modalBackdrop.id = modalId;
        
        const modal = document.createElement('div');
        modal.className = `modal modal-${config.size}`;
        
        let actionsHTML = '';
        if (config.actions.length > 0) {
            actionsHTML = '<div class="modal-footer">';
            config.actions.forEach(action => {
                const btnClass = action.class || 'btn-secondary';
                actionsHTML += `
                    <button class="btn-admin ${btnClass}" 
                            onclick="FornapAdminComponents.handleModalAction('${modalId}', '${action.id}')">
                        ${action.text}
                    </button>
                `;
            });
            actionsHTML += '</div>';
        }
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${config.title}</h3>
                ${config.closable ? `<button class="modal-close" onclick="FornapAdminComponents.closeModal('${modalId}')">×</button>` : ''}
            </div>
            <div class="modal-body">
                ${config.content}
            </div>
            ${actionsHTML}
        `;
        
        modalBackdrop.appendChild(modal);
        
        // Ajouter au DOM
        let container = document.getElementById('adminModals');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adminModals';
            container.className = 'admin-modals-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(modalBackdrop);
        
        // Event listeners
        if (config.closable) {
            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) {
                    this.closeModal(modalId);
                }
            });
        }
        
        // Stockage de la config
        this.activeModals.set(modalId, {
            element: modalBackdrop,
            config: config
        });
        
        // Animation d'ouverture
        modalBackdrop.style.opacity = '0';
        modal.style.transform = 'scale(0.9) translateY(20px)';
        
        setTimeout(() => {
            modalBackdrop.style.opacity = '1';
            modal.style.transform = 'scale(1) translateY(0)';
        }, 10);
        
        // Callback onShow
        if (config.onShow) {
            setTimeout(() => config.onShow(modalId), 100);
        }
        
        // Bloquer le scroll du body
        document.body.style.overflow = 'hidden';
        
        return modalId;
    }

    /**
     * Ferme une modal
     */
    closeModal(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;
        
        const { element, config } = modalData;
        const modal = element.querySelector('.modal');
        
        // Animation de fermeture
        element.style.opacity = '0';
        modal.style.transform = 'scale(0.9) translateY(20px)';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            
            // Réactiver le scroll si plus de modals
            if (this.activeModals.size <= 1) {
                document.body.style.overflow = '';
            }
            
            this.activeModals.delete(modalId);
            
            // Callback onClose
            if (config.onClose) {
                config.onClose(modalId);
            }
        }, this.animationDuration);
    }

    /**
     * Gère les actions des modals
     */
    handleModalAction(modalId, actionId) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;
        
        const action = modalData.config.actions.find(a => a.id === actionId);
        if (action && action.handler) {
            action.handler(modalId);
        }
    }

    /**
     * Crée un formulaire modal
     */
    showFormModal(options = {}) {
        const defaults = {
            title: 'Formulaire',
            fields: [],
            submitText: 'Valider',
            cancelText: 'Annuler',
            onSubmit: null,
            validation: true
        };
        
        const config = { ...defaults, ...options };
        
        // Générer le HTML du formulaire
        let formHTML = '<form id="modalForm" class="modal-form">';
        
        config.fields.forEach(field => {
            formHTML += this.generateFormField(field);
        });
        
        formHTML += '</form>';
        
        // Configuration des actions
        const actions = [
            {
                id: 'cancel',
                text: config.cancelText,
                class: 'btn-secondary',
                handler: (modalId) => this.closeModal(modalId)
            },
            {
                id: 'submit',
                text: config.submitText,
                class: 'btn-primary',
                handler: (modalId) => this.handleFormSubmit(modalId, config)
            }
        ];
        
        return this.showModal({
            title: config.title,
            content: formHTML,
            actions: actions,
            size: config.size || 'medium',
            onShow: (modalId) => {
                // Focus sur le premier champ
                const firstInput = document.querySelector(`#${modalId} input, #${modalId} textarea, #${modalId} select`);
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }
        });
    }

    /**
     * Génère un champ de formulaire
     */
    generateFormField(field) {
        const { type, name, label, placeholder, value, options, required, validation } = field;
        
        let fieldHTML = `
            <div class="form-group">
                <label class="form-label" for="${name}">
                    ${label}
                    ${required ? '<span class="required">*</span>' : ''}
                </label>
        `;
        
        switch (type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
                fieldHTML += `
                    <input type="${type}" 
                           id="${name}" 
                           name="${name}" 
                           class="form-input" 
                           placeholder="${placeholder || ''}"
                           value="${value || ''}"
                           ${required ? 'required' : ''}>
                `;
                break;
                
            case 'textarea':
                fieldHTML += `
                    <textarea id="${name}" 
                              name="${name}" 
                              class="form-textarea" 
                              placeholder="${placeholder || ''}"
                              ${required ? 'required' : ''}>${value || ''}</textarea>
                `;
                break;
                
            case 'select':
                fieldHTML += `<select id="${name}" name="${name}" class="form-select" ${required ? 'required' : ''}>`;
                if (options) {
                    options.forEach(option => {
                        const selected = option.value === value ? 'selected' : '';
                        fieldHTML += `<option value="${option.value}" ${selected}>${option.text}</option>`;
                    });
                }
                fieldHTML += '</select>';
                break;
                
            case 'checkbox':
                const checked = value ? 'checked' : '';
                fieldHTML += `
                    <div class="form-checkbox">
                        <input type="checkbox" 
                               id="${name}" 
                               name="${name}" 
                               value="1" 
                               ${checked}>
                        <label for="${name}">${label}</label>
                    </div>
                `;
                break;
        }
        
        fieldHTML += '<div class="form-error" id="error-' + name + '"></div>';
        fieldHTML += '</div>';
        
        return fieldHTML;
    }

    /**
     * Gère la soumission d'un formulaire modal
     */
    handleFormSubmit(modalId, config) {
        const form = document.getElementById('modalForm');
        if (!form) return;
        
        // Collecter les données
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Validation si activée
        if (config.validation) {
            const errors = this.validateForm(config.fields, data);
            if (Object.keys(errors).length > 0) {
                this.displayFormErrors(errors);
                return;
            }
        }
        
        // Callback de soumission
        if (config.onSubmit) {
            const result = config.onSubmit(data, modalId);
            
            // Si la fonction retourne une promesse
            if (result && typeof result.then === 'function') {
                // Désactiver le bouton pendant le traitement
                const submitBtn = form.closest('.modal').querySelector('.btn-primary');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = 'Traitement...';
                }
                
                result
                    .then(() => {
                        this.closeModal(modalId);
                        this.showNotification('success', 'Opération réussie');
                    })
                    .catch((error) => {
                        this.showNotification('error', error.message || 'Une erreur est survenue');
                    })
                    .finally(() => {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = config.submitText;
                        }
                    });
            } else {
                this.closeModal(modalId);
            }
        }
    }

    /**
     * Valide un formulaire
     */
    validateForm(fields, data) {
        const errors = {};
        
        fields.forEach(field => {
            const value = data[field.name];
            
            // Champ requis
            if (field.required && (!value || value.trim() === '')) {
                errors[field.name] = 'Ce champ est requis';
                return;
            }
            
            // Validation email
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors[field.name] = 'Format email invalide';
                }
            }
            
            // Validation personnalisée
            if (field.validation && value) {
                const validationResult = field.validation(value, data);
                if (validationResult !== true) {
                    errors[field.name] = validationResult;
                }
            }
        });
        
        return errors;
    }

    /**
     * Affiche les erreurs de formulaire
     */
    displayFormErrors(errors) {
        // Nettoyer les erreurs précédentes
        document.querySelectorAll('.form-error').forEach(el => {
            el.textContent = '';
            el.parentElement.classList.remove('has-error');
        });
        
        // Afficher les nouvelles erreurs
        Object.entries(errors).forEach(([field, message]) => {
            const errorEl = document.getElementById(`error-${field}`);
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.parentElement.classList.add('has-error');
            }
        });
    }

    /**
     * Crée une modal de confirmation
     */
    showConfirmModal(options = {}) {
        const defaults = {
            title: 'Confirmation',
            message: 'Êtes-vous sûr ?',
            confirmText: 'Confirmer',
            cancelText: 'Annuler',
            onConfirm: null,
            type: 'warning' // warning, danger, info
        };
        
        const config = { ...defaults, ...options };
        
        const icons = {
            warning: '⚠️',
            danger: '❌',
            info: 'ℹ️'
        };
        
        const content = `
            <div class="confirm-modal-content">
                <div class="confirm-icon ${config.type}">
                    ${icons[config.type] || icons.warning}
                </div>
                <div class="confirm-message">
                    ${config.message}
                </div>
            </div>
        `;
        
        const actions = [
            {
                id: 'cancel',
                text: config.cancelText,
                class: 'btn-secondary',
                handler: (modalId) => this.closeModal(modalId)
            },
            {
                id: 'confirm',
                text: config.confirmText,
                class: config.type === 'danger' ? 'btn-error' : 'btn-primary',
                handler: (modalId) => {
                    this.closeModal(modalId);
                    if (config.onConfirm) {
                        config.onConfirm();
                    }
                }
            }
        ];
        
        return this.showModal({
            title: config.title,
            content: content,
            actions: actions,
            size: 'small'
        });
    }

    /**
     * Affiche un loader dans un élément
     */
    showLoader(element, message = 'Chargement...') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (!element) return;
        
        const loader = document.createElement('div');
        loader.className = 'admin-loader-overlay';
        loader.innerHTML = `
            <div class="admin-loader-content">
                <div class="apple-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        element.style.position = 'relative';
        element.appendChild(loader);
        
        return loader;
    }

    /**
     * Masque un loader
     */
    hideLoader(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (!element) return;
        
        const loader = element.querySelector('.admin-loader-overlay');
        if (loader) {
            loader.remove();
        }
    }

    /**
     * Crée une table de données
     */
    createDataTable(container, options = {}) {
        const defaults = {
            columns: [],
            data: [],
            pagination: true,
            search: true,
            actions: [],
            rowsPerPage: 10
        };
        
        const config = { ...defaults, ...options };
        
        // Implementation de la table de données
        // Cette fonction sera étendue selon les besoins
        
        return {
            refresh: () => {
                // Rafraîchir les données
            },
            addRow: (row) => {
                // Ajouter une ligne
            },
            removeRow: (id) => {
                // Supprimer une ligne
            }
        };
    }
}

// Instance globale
const fornapAdminComponents = new FornapAdminComponents();

// Export global avec alias
window.FornapAdminComponents = fornapAdminComponents;
window.AdminComponents = fornapAdminComponents; // Alias plus court

console.log('✅ Composants admin chargés');