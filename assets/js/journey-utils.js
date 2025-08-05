/**
 * FORNAP Journey Utils - Mécaniques centralisées réutilisables
 * Fonctions communes pour les processus d'inscription et parcours utilisateur
 */

// Utilitaires de progression
class JourneyProgressManager {
    constructor() {
        this.stepMapping = {
            'welcome': 1,
            'signup': 2,
            'login': 2,
            'plan': 3,
            'payment': 4,
            'congratulations': 5,
            'gettingToKnow': 5,
            'final': 5
        };
    }

    updateProgress(currentSection) {
        const currentStepNumber = this.stepMapping[currentSection] || 1;
        const progressWidth = ((currentStepNumber - 1) / 4) * 100;
        
        gsap.to('#progressFill', {
            width: `${progressWidth}%`,
            duration: 0.6,
            ease: "power2.out"
        });
        
        // Mettre à jour les indicateurs
        for (let i = 1; i <= 5; i++) {
            const indicator = document.getElementById(`step${i}`);
            if (!indicator) continue;
            
            const circle = indicator.querySelector('.indicator-circle');
            
            indicator.classList.remove('active', 'completed');
            
            if (i < currentStepNumber) {
                indicator.classList.add('completed');
                gsap.to(circle, { scale: 1.1, duration: 0.3, ease: "back.out(1.7)" });
            } else if (i === currentStepNumber) {
                indicator.classList.add('active');
                gsap.to(circle, { scale: 1.2, duration: 0.3, ease: "back.out(1.7)" });
            } else {
                gsap.to(circle, { scale: 1, duration: 0.3, ease: "power2.out" });
            }
        }
    }
}

// Gestionnaire de navigation entre sections
class JourneyNavigationManager {
    static showSection(sectionId, onComplete = null) {
        const currentActiveSection = document.querySelector('.journey-section.active');
        const targetSection = document.getElementById(sectionId);
        
        if (!targetSection) return;

        // Animation de sortie
        if (currentActiveSection) {
            gsap.to(currentActiveSection, {
                opacity: 0,
                y: -30,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    currentActiveSection.classList.remove('active');
                    currentActiveSection.classList.add('hidden');
                    
                    // Animation d'entrée
                    targetSection.classList.remove('hidden');
                    targetSection.classList.add('active');
                    
                    gsap.fromTo(targetSection, 
                        { opacity: 0, y: 30 },
                        { 
                            opacity: 1, 
                            y: 0, 
                            duration: 0.5, 
                            ease: "power2.out",
                            onComplete: () => {
                                // Focus sur le premier input si présent
                                const firstInput = targetSection.querySelector('input');
                                if (firstInput) firstInput.focus();
                                
                                if (onComplete) onComplete();
                            }
                        }
                    );
                }
            });
        } else {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
            gsap.fromTo(targetSection, 
                { opacity: 0, y: 30 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.5, 
                    ease: "power2.out",
                    onComplete: () => {
                        if (onComplete) onComplete();
                    }
                }
            );
        }
    }

    static animateStepTransition(currentStepId, nextStepId, direction = 'forward') {
        const currentStep = document.getElementById(currentStepId);
        const nextStep = document.getElementById(nextStepId);
        
        if (!currentStep || !nextStep) return;

        const exitX = direction === 'forward' ? -100 : 100;
        const enterX = direction === 'forward' ? 100 : -100;

        gsap.to(currentStep, {
            x: exitX,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                
                gsap.fromTo(nextStep, 
                    { x: enterX, opacity: 0 },
                    { 
                        x: 0, 
                        opacity: 1, 
                        duration: 0.4, 
                        ease: "power2.out",
                        onComplete: () => {
                            const input = nextStep.querySelector('input');
                            if (input) input.focus();
                        }
                    }
                );
            }
        });
    }
}

// Gestionnaire de messages utilisateur
class JourneyMessageManager {
    static showMessage(message, type = 'info') {
        let container = document.getElementById('messageContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'messageContainer';
            document.body.appendChild(container);
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        container.appendChild(messageElement);

        gsap.fromTo(messageElement, 
            { x: 400, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
        );
        
        setTimeout(() => {
            gsap.to(messageElement, {
                x: 400,
                opacity: 0,
                duration: 0.3,
                ease: "back.in(1.7)",
                onComplete: () => messageElement.remove()
            });
        }, 4000);
    }
}

// Gestionnaire de modales de chargement
class JourneyLoadingManager {
    static showLoadingModal(message = 'Traitement en cours...') {
        const modal = document.getElementById('loadingModal');
        if (!modal) return;

        const title = document.getElementById('loadingTitle');
        const messageEl = document.getElementById('loadingMessage');
        
        if (title) title.textContent = message;
        if (messageEl) messageEl.textContent = 'Veuillez patienter...';
        
        modal.classList.remove('hidden');
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            gsap.fromTo(modalContent, 
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
        }
    }

    static hideLoadingModal() {
        const modal = document.getElementById('loadingModal');
        if (!modal) return;

        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            gsap.to(modalContent, {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                ease: "back.in(1.7)",
                onComplete: () => modal.classList.add('hidden')
            });
        }
    }

    static async simulateProgressSteps(steps) {
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => {
                setTimeout(() => {
                    const step = document.getElementById(steps[i].id);
                    if (step) {
                        step.style.color = '#28A745';
                        step.innerHTML = step.innerHTML.replace('🔄', '✓');
                    }
                    resolve();
                }, steps[i].delay);
            });
        }
    }
}

// Gestionnaire de validation en temps réel
class JourneyValidationManager {
    static setupFieldValidation(fields) {
        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const btn = document.getElementById(field.btnId);
            
            if (input && btn) {
                input.addEventListener('input', () => {
                    const isValid = field.validator ? field.validator(input.value) : input.value.trim();
                    btn.disabled = !isValid;
                    
                    if (isValid) {
                        gsap.to(btn, { scale: 1, opacity: 1, duration: 0.3 });
                    } else {
                        gsap.to(btn, { scale: 0.95, opacity: 0.6, duration: 0.3 });
                    }
                });
            }
        });
    }

    static setupRadioValidation(radioName, buttonId) {
        document.querySelectorAll(`input[name="${radioName}"]`).forEach(radio => {
            radio.addEventListener('change', () => {
                const btn = document.getElementById(buttonId);
                if (btn) {
                    btn.disabled = false;
                    gsap.to(btn, { scale: 1, opacity: 1, duration: 0.3 });
                }
            });
        });
    }

    static validateEmail(email) {
        return email && email.includes('@') && email.includes('.');
    }

    static validatePhone(phone) {
        return phone && phone.length >= 10;
    }

    static validatePassword(password) {
        return password && password.length >= 6;
    }
}

// Gestionnaire d'interactions avancées
class JourneyInteractionManager {
    static setupChoiceOptions() {
        document.querySelectorAll('.choice-option[data-value]').forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            
            // Gestion du clic sur l'option entière
            option.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (radio && !radio.checked) {
                    // Décocher tous les autres radios du même groupe
                    document.querySelectorAll(`input[name="${radio.name}"]`).forEach(r => {
                        r.checked = false;
                        const opt = r.closest('.choice-option');
                        if (opt) {
                            opt.classList.remove('selected');
                            gsap.to(opt, { scale: 1, duration: 0.2 });
                        }
                    });
                    
                    // Cocher ce radio et appliquer les animations
                    radio.checked = true;
                    option.classList.add('selected');
                    
                    // Trigger l'événement change manuellement
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Animation de sélection
                    gsap.to(option, { 
                        scale: 1.05, 
                        duration: 0.2, 
                        ease: "back.out(1.7)",
                        onComplete: () => {
                            gsap.to(option, { scale: 1.02, duration: 0.2 });
                        }
                    });
                }
            });
            
            // Hover effects
            option.addEventListener('mouseenter', () => {
                if (!radio.checked) {
                    gsap.to(option, { scale: 1.01, duration: 0.2 });
                }
            });
            
            option.addEventListener('mouseleave', () => {
                if (!radio.checked) {
                    gsap.to(option, { scale: 1, duration: 0.2 });
                }
            });
        });
    }

    static setupPaymentMethods() {
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                // Réinitialiser tous les éléments
                document.querySelectorAll('.payment-method').forEach(method => {
                    method.classList.remove('active');
                });
                
                // Activer l'élément sélectionné
                const selectedMethod = e.target.closest('.payment-method');
                if (selectedMethod) {
                    selectedMethod.classList.add('active');
                    gsap.to(selectedMethod, { 
                        scale: 1.02, 
                        duration: 0.2, 
                        ease: "back.out(1.7)",
                        onComplete: () => {
                            gsap.to(selectedMethod, { scale: 1, duration: 0.2 });
                        }
                    });
                }
            });
        });
    }

    static formatPaymentInputs() {
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');

        if (cardNumber) {
            cardNumber.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        if (expiryDate) {
            expiryDate.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        if (cvv) {
            cvv.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    }
}

// Gestionnaire d'animations
class JourneyAnimationManager {
    static triggerSuccessAnimation(iconId) {
        const icon = document.getElementById(iconId);
        if (!icon) return;
        
        gsap.set(icon, { scale: 0, rotation: -180 });
        gsap.to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
        });
    }

    static triggerBounceAnimation(iconId) {
        const icon = document.getElementById(iconId);
        if (!icon) return;
        
        gsap.set(icon, { scale: 0 });
        gsap.to(icon, {
            scale: 1,
            duration: 1,
            ease: "bounce.out"
        });
    }

    static animateCardSelection(selectedCard, allCards) {
        allCards.forEach(card => {
            if (card === selectedCard) {
                gsap.to(card, {
                    scale: 1.05,
                    borderColor: '#28A745',
                    backgroundColor: '#F8F9FA',
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            } else {
                gsap.to(card, {
                    scale: 1,
                    borderColor: '#E9ECEF',
                    backgroundColor: '#FFFFFF',
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
    }

    static animateElementEntrance(element, delay = 0) {
        gsap.fromTo(element, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 1, 
                delay: delay,
                ease: "power2.out" 
            }
        );
    }

    static animateElementFadeIn(element, duration = 0.5) {
        gsap.fromTo(element, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: duration, ease: "power2.out" }
        );
    }
}

// Gestionnaire de session storage
class JourneyStorageManager {
    static saveUserProgress(data) {
        sessionStorage.setItem('userProgress', JSON.stringify(data));
    }

    static getUserProgress() {
        const progress = sessionStorage.getItem('userProgress');
        return progress ? JSON.parse(progress) : null;
    }

    static clearUserProgress() {
        sessionStorage.removeItem('userProgress');
    }

    static savePreselectedPlan(plan) {
        sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
    }

    static getPreselectedPlan() {
        const plan = sessionStorage.getItem('selectedPlan');
        return plan ? JSON.parse(plan) : null;
    }

    static clearPreselectedPlan() {
        sessionStorage.removeItem('selectedPlan');
    }
}

// Export des classes pour utilisation globale
if (typeof window !== 'undefined') {
    window.JourneyProgressManager = JourneyProgressManager;
    window.JourneyNavigationManager = JourneyNavigationManager;
    window.JourneyMessageManager = JourneyMessageManager;
    window.JourneyLoadingManager = JourneyLoadingManager;
    window.JourneyValidationManager = JourneyValidationManager;
    window.JourneyInteractionManager = JourneyInteractionManager;
    window.JourneyAnimationManager = JourneyAnimationManager;
    window.JourneyStorageManager = JourneyStorageManager;
}