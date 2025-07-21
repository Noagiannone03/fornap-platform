/* ========================================
   FORNAP PRODUCT DETAIL JAVASCRIPT
   Gestion de la page détail produit
   ======================================== */

/* ========================================
   DONNÉES PRODUITS (Simulées - Remplacer par API)
   ======================================== */
const PRODUCT_DATABASE = {
    'sweat-fornap-premium': {
        id: 'sweat-fornap-premium',
        name: 'Sweat FORNAP Premium',
        category: 'Vêtements',
        price: 89.99,
        originalPrice: 109.99,
        description: 'Sweat premium FORNAP en coton bio. Design moderne avec logo brodé, coupe confortable et qualité premium. Parfait pour un style décontracté chic.',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        badges: ['bestseller', 'limited'],
        rating: { stars: 5, count: 124 },
        options: {
            'Taille': ['S', 'M', 'L', 'XL'],
            'Couleur': ['Noir', 'Blanc', 'Gris']
        },
        specifications: {
            'Matériau': 'Coton bio 100%',
            'Entretien': 'Lavage machine 30°C',
            'Origine': 'Made in France',
            'Poids': '450g',
            'Coupe': 'Regular fit'
        },
        inStock: true,
        stockQuantity: 15
    },
    'casquette-fornap-pro': {
        id: 'casquette-fornap-pro',
        name: 'Casquette FORNAP Pro',
        category: 'Accessoires',
        price: 34.99,
        description: 'Casquette FORNAP ajustable avec logo brodé. Style streetwear moderne, parfaite pour compléter votre look urbain.',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        badges: ['new'],
        rating: { stars: 4, count: 67 },
        options: {
            'Couleur': ['Noir', 'Blanc', 'Navy']
        },
        specifications: {
            'Matériau': 'Coton 100%',
            'Ajustement': 'Réglable',
            'Origine': 'Made in France'
        },
        inStock: true,
        stockQuantity: 32
    },
    'powerbank-fornap-10000': {
        id: 'powerbank-fornap-10000',
        name: 'Powerbank FORNAP 10000mAh',
        category: 'Tech',
        price: 44.99,
        originalPrice: 59.99,
        description: 'Powerbank FORNAP 10000mAh avec charge rapide. Design compact et élégant, compatible avec tous vos appareils. Indispensable pour vos déplacements.',
        image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1625842268584-8f3296236761?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        badges: ['sale'],
        rating: { stars: 5, count: 203 },
        options: {
            'Couleur': ['Noir', 'Blanc']
        },
        specifications: {
            'Capacité': '10000mAh',
            'Ports': '2x USB-A, 1x USB-C',
            'Charge rapide': 'Oui (18W)',
            'Dimensions': '15 x 7 x 2cm',
            'Poids': '220g'
        },
        inStock: true,
        stockQuantity: 48
    },
    'mug-fornap-ceramic': {
        id: 'mug-fornap-ceramic',
        name: 'Mug FORNAP Ceramic',
        category: 'Bureau',
        price: 19.99,
        description: 'Mug en céramique FORNAP avec logo gravé. Parfait pour vos pauses café au bureau ou à la maison. Design élégant et qualité durable.',
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        badges: ['exclusive'],
        rating: { stars: 4, count: 89 },
        options: {
            'Couleur': ['Blanc', 'Noir']
        },
        specifications: {
            'Matériau': 'Céramique premium',
            'Capacité': '350ml',
            'Entretien': 'Lave-vaisselle',
            'Origine': 'Made in France'
        },
        inStock: true,
        stockQuantity: 25
    },
    // Ajouter d'autres produits...
    'tshirt-fornap-classic': {
        id: 'tshirt-fornap-classic',
        name: 'T-shirt FORNAP Classic',
        category: 'Vêtements',
        price: 29.99,
        description: 'T-shirt FORNAP en coton bio. Coupe classique, logo discret. Un essentiel de votre garde-robe.',
        image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        badges: [],
        rating: { stars: 4, count: 156 },
        options: {
            'Taille': ['S', 'M', 'L', 'XL'],
            'Couleur': ['Noir', 'Blanc', 'Marine']
        },
        inStock: true,
        stockQuantity: 42
    }
};

/* ========================================
   VARIABLES GLOBALES
   ======================================== */
let currentProduct = null;
let currentOptions = {};
let recommendedSliderIndex = 0;

/* ========================================
   INITIALISATION
   ======================================== */
function initializeProductDetail() {
    console.log('🛍️ Initialisation page produit détail...');
    
    // Récupérer l'ID du produit depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    
    if (!productId) {
        showError('Aucun produit spécifié');
        return;
    }
    
    // Charger le produit
    loadProduct(productId);
    
    // Initialiser les event listeners
    initializeEventListeners();
    
    console.log('✅ Page produit initialisée');
}

/* ========================================
   CHARGEMENT PRODUIT
   ======================================== */
function loadProduct(productId) {
    const loadingState = document.getElementById('loading-state');
    const productContent = document.getElementById('product-content');
    const errorState = document.getElementById('error-state');
    
    // Afficher le loading
    loadingState.classList.remove('hidden');
    productContent.classList.add('hidden');
    errorState.classList.add('hidden');
    
    // Simuler un délai de chargement
    setTimeout(() => {
        const product = PRODUCT_DATABASE[productId];
        
        if (!product) {
            showError('Produit introuvable');
            return;
        }
        
        currentProduct = product;
        renderProduct(product);
        loadRecommendedProducts();
        
        // Masquer le loading et afficher le contenu
        loadingState.classList.add('hidden');
        productContent.classList.remove('hidden');
        
    }, 800); // Délai simulé
}

/* ========================================
   RENDU DU PRODUIT
   ======================================== */
function renderProduct(product) {
    // Title et breadcrumb
    document.getElementById('product-title').textContent = `${product.name} - FORNAP Shop`;
    document.getElementById('breadcrumb-product').textContent = product.name;
    
    // Image principale
    const mainImage = document.getElementById('main-product-image');
    mainImage.src = product.image;
    mainImage.alt = product.name;
    
    // Galerie d'images (si disponible)
    if (product.images && product.images.length > 1) {
        renderImageGallery(product.images);
    }
    
    // Badges
    renderBadges(product.badges);
    
    // Informations de base
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-category').textContent = product.category;
    
    // Rating
    if (product.rating) {
        const stars = '★'.repeat(product.rating.stars) + '☆'.repeat(5 - product.rating.stars);
        document.getElementById('product-stars').textContent = stars;
        document.getElementById('rating-count').textContent = `(${product.rating.count} avis)`;
    }
    
    // Prix
    document.getElementById('product-price').textContent = `${product.price}€`;
    
    if (product.originalPrice && product.originalPrice > product.price) {
        const originalPriceEl = document.getElementById('product-original-price');
        const savingsEl = document.getElementById('price-savings');
        
        originalPriceEl.textContent = `${product.originalPrice}€`;
        originalPriceEl.classList.remove('hidden');
        
        const savings = (product.originalPrice - product.price).toFixed(2);
        savingsEl.textContent = `Vous économisez ${savings}€`;
        savingsEl.classList.remove('hidden');
    }
    
    // Description
    document.getElementById('product-description').innerHTML = `<p>${product.description}</p>`;
    
    // Options
    renderOptions(product.options);
    
    // Spécifications
    renderSpecifications(product.specifications);
    
    // Bouton d'ajout au panier
    setupAddToCartButton(product);
    
    // Stock
    updateStockDisplay(product);
}

function renderImageGallery(images) {
    const thumbnails = document.getElementById('image-thumbnails');
    
    if (images.length <= 1) {
        thumbnails.style.display = 'none';
        return;
    }
    
    thumbnails.innerHTML = '';
    
    images.forEach((imageUrl, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = imageUrl;
        thumbnail.alt = `Image ${index + 1}`;
        thumbnail.className = `thumbnail-image ${index === 0 ? 'active' : ''}`;
        thumbnail.onclick = () => changeMainImage(imageUrl, index);
        
        thumbnails.appendChild(thumbnail);
    });
}

function changeMainImage(imageUrl, index) {
    const mainImage = document.getElementById('main-product-image');
    mainImage.src = imageUrl;
    
    // Mettre à jour les thumbnails
    document.querySelectorAll('.thumbnail-image').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function renderBadges(badges) {
    const badgesContainer = document.getElementById('product-badges');
    
    if (!badges || badges.length === 0) {
        badgesContainer.innerHTML = '';
        return;
    }
    
    badgesContainer.innerHTML = badges.map(badge => {
        const badgeText = {
            'bestseller': 'Bestseller',
            'new': 'Nouveau',
            'sale': '-25%',
            'limited': 'Édition Limitée',
            'exclusive': 'Exclusif',
            'popular': 'Populaire',
            'luxury': 'Luxe'
        };
        
        return `<span class="badge ${badge}">${badgeText[badge] || badge}</span>`;
    }).join('');
}

function renderOptions(options) {
    const optionsContainer = document.getElementById('product-options');
    
    if (!options || Object.keys(options).length === 0) {
        optionsContainer.innerHTML = '';
        return;
    }
    
    optionsContainer.innerHTML = Object.entries(options).map(([optionName, values]) => {
        return `
            <div class="option-group">
                <label class="option-label">${optionName}:</label>
                <div class="option-buttons">
                    ${values.map(value => `
                        <button class="option-btn" 
                                onclick="selectOption('${optionName}', '${value}')"
                                data-option="${optionName}" 
                                data-value="${value}">
                            ${value}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Sélectionner les premières options par défaut
    Object.entries(options).forEach(([optionName, values]) => {
        if (values.length > 0) {
            currentOptions[optionName] = values[0];
            const firstBtn = document.querySelector(`[data-option="${optionName}"][data-value="${values[0]}"]`);
            if (firstBtn) firstBtn.classList.add('active');
        }
    });
}

function renderSpecifications(specifications) {
    const specsContainer = document.getElementById('specifications-content');
    
    if (!specifications) return;
    
    specsContainer.innerHTML = Object.entries(specifications).map(([label, value]) => `
        <div class="spec-item">
            <span class="spec-label">${label}:</span>
            <span class="spec-value">${value}</span>
        </div>
    `).join('');
}

function setupAddToCartButton(product) {
    const addToCartBtn = document.getElementById('main-add-to-cart');
    
    // Configurer les attributs Snipcart
    addToCartBtn.setAttribute('data-item-id', product.id);
    addToCartBtn.setAttribute('data-item-price', product.price.toString());
    addToCartBtn.setAttribute('data-item-url', window.location.href);
    addToCartBtn.setAttribute('data-item-description', product.description);
    addToCartBtn.setAttribute('data-item-image', product.image);
    addToCartBtn.setAttribute('data-item-name', product.name);
    
    // Options personnalisées
    if (product.options) {
        let customIndex = 1;
        Object.entries(product.options).forEach(([optionName, values]) => {
            addToCartBtn.setAttribute(`data-item-custom${customIndex}-name`, optionName);
            addToCartBtn.setAttribute(`data-item-custom${customIndex}-options`, values.join('|'));
            addToCartBtn.setAttribute(`data-item-custom${customIndex}-value`, currentOptions[optionName] || values[0]);
            customIndex++;
        });
    }
}

/* ========================================
   GESTION DES OPTIONS
   ======================================== */
function selectOption(optionName, value) {
    // Mettre à jour l'option sélectionnée
    currentOptions[optionName] = value;
    
    // Mettre à jour l'interface
    const allButtons = document.querySelectorAll(`[data-option="${optionName}"]`);
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    const selectedButton = document.querySelector(`[data-option="${optionName}"][data-value="${value}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Mettre à jour le bouton d'ajout au panier
    if (currentProduct) {
        setupAddToCartButton(currentProduct);
    }
    
    // Animation du bouton
    if (selectedButton) {
        selectedButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            selectedButton.style.transform = '';
        }, 150);
    }
}

/* ========================================
   GESTION DE LA QUANTITÉ
   ======================================== */
function updateQuantity(delta) {
    const quantityInput = document.getElementById('product-quantity');
    const currentQuantity = parseInt(quantityInput.value) || 1;
    const newQuantity = Math.max(1, Math.min(10, currentQuantity + delta));
    
    quantityInput.value = newQuantity;
    
    // Mettre à jour le bouton d'ajout au panier
    const addToCartBtn = document.getElementById('main-add-to-cart');
    addToCartBtn.setAttribute('data-item-quantity', newQuantity.toString());
    
    // Animation visuelle
    quantityInput.style.transform = 'scale(1.05)';
    setTimeout(() => {
        quantityInput.style.transform = '';
    }, 200);
}

/* ========================================
   ONGLETS
   ======================================== */
function showTab(tabName) {
    // Masquer tous les panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Désactiver tous les boutons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activer le panel et bouton sélectionnés
    const selectedPanel = document.getElementById(`${tabName}-panel`);
    const selectedBtn = event.target;
    
    if (selectedPanel) {
        selectedPanel.classList.add('active');
    }
    
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Animation du bouton
    if (selectedBtn) {
        selectedBtn.style.transform = 'translateY(2px)';
        setTimeout(() => {
            selectedBtn.style.transform = '';
        }, 150);
    }
}

/* ========================================
   ACTIONS SECONDAIRES
   ======================================== */
function toggleWishlist() {
    const wishlistBtn = document.querySelector('.wishlist-btn');
    const heartIcon = wishlistBtn.querySelector('.heart-icon');
    
    const isInWishlist = heartIcon.textContent === '♥';
    
    if (isInWishlist) {
        heartIcon.textContent = '♡';
        wishlistBtn.innerHTML = wishlistBtn.innerHTML.replace('Retirer des favoris', 'Ajouter aux favoris');
        showNotification('💔 Retiré des favoris', 'info');
    } else {
        heartIcon.textContent = '♥';
        wishlistBtn.innerHTML = wishlistBtn.innerHTML.replace('Ajouter aux favoris', 'Retirer des favoris');
        showNotification('❤️ Ajouté aux favoris', 'success');
    }
    
    // Animation
    wishlistBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        wishlistBtn.style.transform = '';
    }, 200);
}

function shareProduct() {
    const shareBtn = document.querySelector('.share-btn');
    
    if (navigator.share && currentProduct) {
        navigator.share({
            title: currentProduct.name,
            text: currentProduct.description,
            url: window.location.href
        }).then(() => {
            showNotification('📤 Produit partagé !', 'success');
        }).catch(err => {
            console.log('Erreur partage:', err);
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
    
    // Animation
    shareBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        shareBtn.style.transform = '';
    }, 200);
}

function fallbackShare() {
    // Copier l'URL dans le presse-papiers
    navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification('🔗 Lien copié dans le presse-papiers !', 'success');
    }).catch(() => {
        showNotification('⚠️ Impossible de copier le lien', 'warning');
    });
}

/* ========================================
   PRODUITS RECOMMANDÉS
   ======================================== */
function loadRecommendedProducts() {
    const recommendedTrack = document.getElementById('recommendedTrack');
    
    // Récupérer des produits similaires (même catégorie ou aléatoires)
    const allProducts = Object.values(PRODUCT_DATABASE);
    const similarProducts = allProducts
        .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
        .slice(0, 4);
    
    // Si pas assez de produits similaires, ajouter d'autres produits
    if (similarProducts.length < 4) {
        const otherProducts = allProducts
            .filter(p => p.id !== currentProduct.id && p.category !== currentProduct.category)
            .slice(0, 4 - similarProducts.length);
        
        similarProducts.push(...otherProducts);
    }
    
    recommendedTrack.innerHTML = similarProducts.map(product => {
        const hasOriginalPrice = product.originalPrice && product.originalPrice > product.price;
        
        return `
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    ${product.badges ? `
                        <div class="product-badges">
                            ${product.badges.map(badge => `<span class="badge ${badge}">${getBadgeText(badge)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="price-current">${product.price}€</span>
                        ${hasOriginalPrice ? `<span class="price-original">${product.originalPrice}€</span>` : ''}
                    </div>
                    <button 
                        class="btn btn-primary add-to-cart snipcart-add-item"
                        data-item-id="${product.id}"
                        data-item-price="${product.price}"
                        data-item-url="product-detail.html?product=${product.id}"
                        data-item-description="${product.description}"
                        data-item-image="${product.image}"
                        data-item-name="${product.name}">
                        Ajouter
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getBadgeText(badge) {
    const badgeTexts = {
        'bestseller': 'Bestseller',
        'new': 'Nouveau',
        'sale': '-25%',
        'limited': 'Édition Limitée',
        'exclusive': 'Exclusif',
        'popular': 'Populaire',
        'luxury': 'Luxe'
    };
    return badgeTexts[badge] || badge;
}

function moveRecommendedSlider(direction) {
    const track = document.getElementById('recommendedTrack');
    const cards = track.querySelectorAll('.product-card');
    
    if (cards.length === 0) return;
    
    const cardWidth = cards[0].offsetWidth + 24; // + gap
    const maxIndex = Math.max(0, cards.length - 3);
    
    recommendedSliderIndex = Math.max(0, Math.min(maxIndex, recommendedSliderIndex + direction));
    
    const translateX = -recommendedSliderIndex * cardWidth;
    track.style.transform = `translateX(${translateX}px)`;
}

/* ========================================
   GESTION DU STOCK
   ======================================== */
function updateStockDisplay(product) {
    if (!product.inStock) {
        const addToCartBtn = document.getElementById('main-add-to-cart');
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Rupture de stock';
        addToCartBtn.classList.add('sold-out');
    } else if (product.stockQuantity <= 5) {
        // Afficher un avertissement de stock faible
        const stockWarning = document.createElement('div');
        stockWarning.className = 'stock-warning';
        stockWarning.innerHTML = `⚠️ Plus que ${product.stockQuantity} en stock !`;
        stockWarning.style.cssText = `
            background-color: var(--attention);
            color: var(--blanc-principal);
            padding: var(--space-2) var(--space-4);
            margin-top: var(--space-3);
            font-size: var(--text-sm);
            font-weight: var(--font-bold);
            text-align: center;
        `;
        
        const productActions = document.querySelector('.product-actions');
        productActions.appendChild(stockWarning);
    }
}

/* ========================================
   GESTION DES ERREURS
   ======================================== */
function showError(message) {
    const loadingState = document.getElementById('loading-state');
    const productContent = document.getElementById('product-content');
    const errorState = document.getElementById('error-state');
    
    loadingState.classList.add('hidden');
    productContent.classList.add('hidden');
    errorState.classList.remove('hidden');
    
    const errorContent = errorState.querySelector('.error-content p');
    if (errorContent) {
        errorContent.textContent = message;
    }
}

/* ========================================
   EVENT LISTENERS
   ======================================== */
function initializeEventListeners() {
    // Gestion de la quantité
    const quantityInput = document.getElementById('product-quantity');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            const value = Math.max(1, Math.min(10, parseInt(this.value) || 1));
            this.value = value;
            
            const addToCartBtn = document.getElementById('main-add-to-cart');
            addToCartBtn.setAttribute('data-item-quantity', value.toString());
        });
    }
    
    // Snipcart events
    document.addEventListener('snipcart.ready', function() {
        window.Snipcart.events.on('item.added', function(item) {
            if (item.id === currentProduct?.id) {
                showNotification('✅ Produit ajouté au panier !', 'success');
            }
        });
    });
    
    // Gestion du retour clavier
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Fermer les modales ou retour
            window.history.back();
        }
    });
}

/* ========================================
   UTILITAIRES
   ======================================== */
function showNotification(message, type = 'info') {
    // Réutiliser la fonction de shop-scripts.js
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback simple
        alert(message);
    }
}

/* ========================================
   FONCTIONS GLOBALES
   ======================================== */
window.selectOption = selectOption;
window.updateQuantity = updateQuantity;
window.showTab = showTab;
window.toggleWishlist = toggleWishlist;
window.shareProduct = shareProduct;
window.moveRecommendedSlider = moveRecommendedSlider;
window.initializeProductDetail = initializeProductDetail;

console.log('🛍️ Product Detail Scripts - Chargés'); 