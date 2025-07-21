/* ========================================
   FORNAP SHOP JAVASCRIPT
   Fonctionnalités interactives du shop
   ======================================== */

/* ========================================
   VARIABLES GLOBALES
   ======================================== */
const sliderStates = {
    featured: { currentIndex: 0, itemsVisible: 3 },
    vetement: { currentIndex: 0, itemsVisible: 4 },
    accessoire: { currentIndex: 0, itemsVisible: 4 },
    tech: { currentIndex: 0, itemsVisible: 4 },
    bureau: { currentIndex: 0, itemsVisible: 4 }
};

let currentCategory = 'all';
let cartCount = 0;

/* ========================================
   INITIALISATION
   ======================================== */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 FORNAP Shop - Initialisation...');
    
    initializeSliders();
    initializeFilters();
    initializeCart();
    initializeQuickView();
    initializeNewsletter();
    initializeResponsive();
    
    // Snipcart events
    initializeSnipcartEvents();
    
    console.log('✅ FORNAP Shop - Initialisé avec succès');
});

/* ========================================
   SYSTÈME DE SLIDERS
   ======================================== */
function initializeSliders() {
    // Calculer les items visibles selon la taille d'écran
    updateVisibleItems();
    
    // Event listeners pour resize
    window.addEventListener('resize', debounce(updateVisibleItems, 250));
    
    // Auto-play pour le slider principal
    startAutoPlay();
}

function updateVisibleItems() {
    const screenWidth = window.innerWidth;
    
    if (screenWidth <= 480) {
        sliderStates.featured.itemsVisible = 1;
        sliderStates.vetement.itemsVisible = 1;
        sliderStates.accessoire.itemsVisible = 1;
        sliderStates.tech.itemsVisible = 1;
        sliderStates.bureau.itemsVisible = 1;
    } else if (screenWidth <= 768) {
        sliderStates.featured.itemsVisible = 2;
        sliderStates.vetement.itemsVisible = 2;
        sliderStates.accessoire.itemsVisible = 2;
        sliderStates.tech.itemsVisible = 2;
        sliderStates.bureau.itemsVisible = 2;
    } else if (screenWidth <= 1200) {
        sliderStates.featured.itemsVisible = 3;
        sliderStates.vetement.itemsVisible = 3;
        sliderStates.accessoire.itemsVisible = 3;
        sliderStates.tech.itemsVisible = 3;
        sliderStates.bureau.itemsVisible = 3;
    } else {
        sliderStates.featured.itemsVisible = 3;
        sliderStates.vetement.itemsVisible = 4;
        sliderStates.accessoire.itemsVisible = 4;
        sliderStates.tech.itemsVisible = 4;
        sliderStates.bureau.itemsVisible = 4;
    }
    
    // Ajuster tous les sliders
    Object.keys(sliderStates).forEach(sliderId => {
        adjustSliderPosition(sliderId);
    });
}

function moveSlider(sliderId, direction) {
    const state = sliderStates[sliderId];
    if (!state) return;
    
    const track = document.getElementById(`${sliderId}Track`);
    if (!track) return;
    
    const cards = track.querySelectorAll('.product-card');
    const totalItems = cards.length;
    const maxIndex = Math.max(0, totalItems - state.itemsVisible);
    
    // Calculer le nouvel index
    const newIndex = Math.max(0, Math.min(maxIndex, state.currentIndex + direction));
    
    if (newIndex !== state.currentIndex) {
        state.currentIndex = newIndex;
        adjustSliderPosition(sliderId);
        
        // Animation du bouton
        const button = event.target;
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
}

function adjustSliderPosition(sliderId) {
    const state = sliderStates[sliderId];
    const track = document.getElementById(`${sliderId}Track`);
    
    if (!track || !state) return;
    
    const cards = track.querySelectorAll('.product-card');
    if (cards.length === 0) return;
    
    // Calculer la largeur d'une carte + gap
    const firstCard = cards[0];
    const cardWidth = firstCard.offsetWidth;
    const gap = 24; // var(--space-6)
    
    const translateX = -state.currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(${translateX}px)`;
    
    // Mettre à jour l'état des boutons
    updateSliderButtons(sliderId);
}

function updateSliderButtons(sliderId) {
    const state = sliderStates[sliderId];
    const track = document.getElementById(`${sliderId}Track`);
    if (!track) return;
    
    const totalItems = track.querySelectorAll('.product-card').length;
    const maxIndex = Math.max(0, totalItems - state.itemsVisible);
    
    const slider = document.getElementById(`${sliderId}Slider`);
    if (!slider) return;
    
    const prevBtn = slider.querySelector('.slider-btn.prev');
    const nextBtn = slider.querySelector('.slider-btn.next');
    
    if (prevBtn) {
        prevBtn.style.opacity = state.currentIndex === 0 ? '0.5' : '1';
        prevBtn.style.cursor = state.currentIndex === 0 ? 'not-allowed' : 'pointer';
    }
    
    if (nextBtn) {
        nextBtn.style.opacity = state.currentIndex >= maxIndex ? '0.5' : '1';
        nextBtn.style.cursor = state.currentIndex >= maxIndex ? 'not-allowed' : 'pointer';
    }
}

function startAutoPlay() {
    // Auto-play uniquement pour le slider principal
    setInterval(() => {
        const track = document.getElementById('featuredTrack');
        if (!track) return;
        
        const totalItems = track.querySelectorAll('.product-card').length;
        const state = sliderStates.featured;
        const maxIndex = Math.max(0, totalItems - state.itemsVisible);
        
        if (state.currentIndex >= maxIndex) {
            // Retour au début
            state.currentIndex = 0;
        } else {
            state.currentIndex++;
        }
        
        adjustSliderPosition('featured');
    }, 5000); // 5 secondes
}

/* ========================================
   SYSTÈME DE FILTRES
   ======================================== */
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProducts(category);
            
            // Mettre à jour l'état actif
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Animation du bouton
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

function filterProducts(category) {
    currentCategory = category;
    
    // Filtrer les sections de catégories
    const categorySections = document.querySelectorAll('.category-section');
    
    categorySections.forEach(section => {
        const sectionCategory = section.dataset.category;
        
        if (category === 'all' || category === sectionCategory) {
            section.classList.remove('hidden');
            // Animation d'apparition
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            setTimeout(() => {
                section.style.transition = 'all 0.5s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 50);
        } else {
            section.classList.add('hidden');
        }
    });
    
    // Filtrer aussi les produits phares
    const featuredCards = document.querySelectorAll('.featured-products .product-card');
    featuredCards.forEach(card => {
        const cardCategory = card.dataset.category;
        
        if (category === 'all' || category === cardCategory) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
    
    // Réajuster les sliders après filtrage
    setTimeout(() => {
        Object.keys(sliderStates).forEach(sliderId => {
            sliderStates[sliderId].currentIndex = 0;
            adjustSliderPosition(sliderId);
        });
    }, 100);
}

function showCategory(category) {
    // Simuler un clic sur le filtre correspondant
    const filterBtn = document.querySelector(`[data-category="${category}"]`);
    if (filterBtn) {
        filterBtn.click();
    }
    
    // Scroll vers la section
    const categorySection = document.querySelector(`[data-category="${category}"]`);
    if (categorySection) {
        categorySection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/* ========================================
   PANIER SNIPCART
   ======================================== */
function initializeCart() {
    const floatingCartBtn = document.getElementById('floating-cart');
    const cartCountElement = document.getElementById('cart-count');
    
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', function() {
            // Animation du bouton
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }
    
    // Animation de hover pour le panier flottant
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        floatingCartBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
}

function initializeSnipcartEvents() {
    document.addEventListener('snipcart.ready', function() {
        console.log('✅ Snipcart prêt');
        
        // Event listeners Snipcart
        window.Snipcart.events.on('item.added', handleItemAdded);
        window.Snipcart.events.on('item.removed', handleItemRemoved);
        window.Snipcart.events.on('cart.opened', handleCartOpened);
        window.Snipcart.events.on('cart.closed', handleCartClosed);
    });
}

function handleItemAdded(item) {
    console.log('📦 Produit ajouté:', item);
    
    // Animation de la carte produit
    const productCards = document.querySelectorAll('[data-item-id="' + item.id + '"]');
    productCards.forEach(card => {
        const productCard = card.closest('.product-card');
        if (productCard) {
            productCard.classList.add('adding-to-cart');
            setTimeout(() => {
                productCard.classList.remove('adding-to-cart');
            }, 600);
        }
    });
    
    // Mettre à jour le compteur
    updateCartCount();
    
    // Notification success
    showNotification('✅ Produit ajouté au panier !', 'success');
}

function handleItemRemoved(item) {
    console.log('🗑️ Produit retiré:', item);
    updateCartCount();
    showNotification('🗑️ Produit retiré du panier', 'info');
}

function handleCartOpened() {
    console.log('🛒 Panier ouvert');
}

function handleCartClosed() {
    console.log('🛒 Panier fermé');
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    
    if (window.Snipcart) {
        const count = window.Snipcart.api.items.count();
        cartCount = count;
        
        if (cartCountElement) {
            cartCountElement.textContent = count;
            cartCountElement.classList.toggle('hidden', count === 0);
            
            // Animation du compteur
            if (count > 0) {
                cartCountElement.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    cartCountElement.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }
}

/* ========================================
   APERÇU RAPIDE - REDIRECTION VERS PAGE DÉTAIL
   ======================================== */
function initializeQuickView() {
    // Event listeners pour les boutons aperçu rapide
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quick-view-btn')) {
            e.preventDefault();
            e.stopPropagation();
            
            // Récupérer l'ID du produit depuis le bouton d'ajout au panier
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const addToCartBtn = productCard.querySelector('.snipcart-add-item');
                if (addToCartBtn) {
                    const productId = addToCartBtn.getAttribute('data-item-id');
                    if (productId) {
                        // Redirection vers la page détail
                        window.location.href = `product-detail.html?product=${productId}`;
                    }
                }
            }
        }
    });
}

// Fonctions de modal supprimées - redirection directe vers page détail

/* ========================================
   NEWSLETTER
   ======================================== */
function initializeNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('.newsletter-input');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                // Simuler l'inscription
                showNotification('✅ Merci pour votre inscription !', 'success');
                emailInput.value = '';
                
                // Animation du bouton
                const submitBtn = this.querySelector('.btn');
                submitBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    submitBtn.style.transform = '';
                }, 150);
                
                // TODO: Intégrer avec votre service d'email
                console.log('📧 Inscription newsletter:', email);
            } else {
                showNotification('⚠️ Veuillez saisir un email valide', 'warning');
            }
        });
    }
}

/* ========================================
   RESPONSIVE
   ======================================== */
function initializeResponsive() {
    // Touch events pour mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Améliorer les interactions tactiles
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    }
}

/* ========================================
   UTILITAIRES
   ======================================== */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Créer le conteneur de notifications s'il n'existe pas
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        pointer-events: auto;
        cursor: pointer;
        font-weight: 500;
    `;
    
    container.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-suppression
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Suppression au clic
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

/* ========================================
   ANALYTICS ET TRACKING
   ======================================== */
function trackEvent(action, category = 'Shop', label = null, value = null) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', action, { category: category, label: label });
    }
    
    console.log(`📊 Event tracked: ${action} | ${category} | ${label}`);
}

/* ========================================
   FONCTIONS GLOBALES (appelées depuis HTML)
   ======================================== */
window.moveSlider = moveSlider;
window.showCategory = showCategory;

console.log('🛒 FORNAP Shop Scripts - Chargés'); 