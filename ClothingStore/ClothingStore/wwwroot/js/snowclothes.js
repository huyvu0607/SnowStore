// SnowClothes JavaScript - Updated with auto-close popup and success notification
(function () {
    'use strict';

    // Global variables
    let currentProduct = null;
    let isLoading = false;
    let currentPopupProductId = null;
    let currentPopupProductData = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function () {
        initializeSnowClothes();
        initializePopupFunctionality();
        initializeSuccessNotification();
    });

    // Main initialization function
    function initializeSnowClothes() {
        initializeSnowAnimation();
        setupEventListeners();
        initializeProductGrid();
        initializePopup();
        initializeLazyLoading();
        initializeSearchEnhancements();
    }

    // Initialize success notification system
    function initializeSuccessNotification() {
        // Create success overlay if it doesn't exist
        if (!document.getElementById('successOverlay')) {
            createSuccessOverlay();
        }
    }

    // Create success notification overlay
    function createSuccessOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'successOverlay';
        overlay.className = 'success-overlay';
        overlay.innerHTML = `
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="success-message">
                    <h3>Thành công!</h3>
                    <p id="successText">Đã thêm sản phẩm vào giỏ hàng</p>
                </div>
                <div class="success-actions">
                    <button class="btn-continue" onclick="closeSuccessNotification()">
                        <i class="fas fa-shopping-bag"></i>
                        Tiếp tục mua sắm
                    </button>
                    <button class="btn-view-cart" onclick="goToCart()">
                        <i class="fas fa-shopping-cart"></i>
                        Xem giỏ hàng
                    </button>
                </div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .success-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all 0.4s ease;
            }

            .success-overlay.show {
                display: flex !important;
                opacity: 1;
            }

            .success-content {
                background: white;
                border-radius: 20px;
                padding: 3rem 2rem;
                text-align: center;
                max-width: 400px;
                width: 90%;
                transform: scale(0.7) translateY(50px);
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }

            .success-overlay.show .success-content {
                transform: scale(1) translateY(0);
            }

            .success-icon {
                font-size: 4rem;
                color: #28a745;
                margin-bottom: 1.5rem;
                animation: successBounce 0.6s ease 0.2s both;
            }

            .success-message h3 {
                color: var(--deep-blue, #2c5aa0);
                font-size: 1.8rem;
                margin-bottom: 0.5rem;
                font-weight: 700;
            }

            .success-message p {
                color: #666;
                font-size: 1.1rem;
                margin-bottom: 2rem;
            }

            .success-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            .btn-continue, .btn-view-cart {
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
                min-width: 140px;
                justify-content: center;
            }

            .btn-continue {
                background: var(--ice-blue, #f0f8ff);
                color: var(--deep-blue, #2c5aa0);
                border: 2px solid var(--frost-blue, #87CEEB);
            }

            .btn-continue:hover {
                background: var(--frost-blue, #87CEEB);
                color: white;
                transform: translateY(-2px);
            }

            .btn-view-cart {
                background: linear-gradient(135deg, var(--winter-blue, #4A90E2), var(--frost-blue, #87CEEB));
                color: white;
            }

            .btn-view-cart:hover {
                background: var(--deep-blue, #2c5aa0);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
            }

            @keyframes successBounce {
                0% {
                    transform: scale(0);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.2);
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            /* Mobile responsive */
            @media (max-width: 480px) {
                .success-content {
                    padding: 2rem 1.5rem;
                }

                .success-icon {
                    font-size: 3rem;
                }

                .success-message h3 {
                    font-size: 1.5rem;
                }

                .success-actions {
                    flex-direction: column;
                    gap: 0.8rem;
                }

                .btn-continue, .btn-view-cart {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(styles);
        document.body.appendChild(overlay);
    }

    // Show success notification
    function showSuccessNotification(message, productData) {
        const overlay = document.getElementById('successOverlay');
        const messageElement = document.getElementById('successText');

        if (overlay && messageElement) {
            messageElement.textContent = message || 'Đã thêm sản phẩm vào giỏ hàng';

            // Show with animation
            overlay.classList.add('show');

            // Auto hide after 5 seconds if user doesn't interact
            setTimeout(() => {
                if (overlay.classList.contains('show')) {
                    closeSuccessNotification();
                }
            }, 2500);
        }
    }

    // Close success notification
    window.closeSuccessNotification = function () {
        const overlay = document.getElementById('successOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    };

    // Go to cart function
    window.goToCart = function () {
        closeSuccessNotification();
        setTimeout(() => {
            window.location.href = '/Cart';
        }, 300);
    };

    // Initialize popup functionality (merged from artifact)
    function initializePopupFunctionality() {
        // Make sure popup close button works
        const closeBtn = document.querySelector('.popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                closeProductPopup();
            });
        }

        // Close popup when clicking overlay
        const popupOverlay = document.getElementById('productPopup');
        if (popupOverlay) {
            popupOverlay.addEventListener('click', function (e) {
                if (e.target === this) {
                    closeProductPopup();
                }
            });
        }

        // ESC key to close popup
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (document.getElementById('successOverlay').classList.contains('show')) {
                    closeSuccessNotification();
                } else if (currentPopupProductId) {
                    closeProductPopup();
                }
            }
        });
    }

    // Snow animation for winter theme
    function initializeSnowAnimation() {
        // Create subtle snow effect
        if (window.innerWidth > 768) {
            createSnowflakes();
        }
    }

    function createSnowflakes() {
        const snowContainer = document.createElement('div');
        snowContainer.id = 'snow-container';
        snowContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.appendChild(snowContainer);

        // Create snowflakes periodically
        setInterval(() => {
            if (document.querySelectorAll('.snowflake').length < 50) {
                createSnowflake(snowContainer);
            }
        }, 300);
    }

    function createSnowflake(container) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = Math.random() > 0.5 ? '❄' : '❅';

        const size = Math.random() * 0.8 + 0.2;
        const left = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;

        snowflake.style.cssText = `
            position: absolute;
            top: -10px;
            left: ${left}%;
            font-size: ${size}rem;
            color: rgba(135, 206, 235, 0.6);
            animation: snowfall ${duration}s linear ${delay}s infinite;
            pointer-events: none;
        `;

        container.appendChild(snowflake);

        // Remove snowflake after animation
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.parentNode.removeChild(snowflake);
            }
        }, (duration + delay) * 1000);
    }

    // Add CSS animation for snowfall
    const style = document.createElement('style');
    style.textContent = `
        @keyframes snowfall {
            0% {
                transform: translateY(-10px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Setup event listeners
    function setupEventListeners() {
        // Close popup with Escape key
        document.addEventListener('keydown', handleKeyDown);

        // Handle category filter changes - FIXED VERSION
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', handleCategoryChange);
        });

        // Handle product card clicks
        document.addEventListener('click', handleProductClick);

        // Handle popup close
        document.addEventListener('click', handlePopupClose);

        // Handle window resize
        window.addEventListener('resize', handleResize);

        // Handle scroll for lazy loading
        window.addEventListener('scroll', throttle(handleScroll, 100));
    }

    // Initialize product grid enhancements
    function initializeProductGrid() {
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach((card, index) => {
            // Add staggered animation delay
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');

            // Add hover effects for images
            const image = card.querySelector('.product-image');
            if (image) {
                setupImageHoverEffect(image);
            }

            // Add loading state
            card.addEventListener('click', function () {
                if (!card.classList.contains('loading')) {
                    card.classList.add('loading');
                    setTimeout(() => card.classList.remove('loading'), 1000);
                }
            });
        });
    }

    // Setup image hover effects
    function setupImageHoverEffect(image) {
        image.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });

        image.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    }

    // Initialize popup functionality
    function initializePopup() {
        const popupOverlay = document.getElementById('productPopup');
        if (!popupOverlay) {
            console.warn('Product popup not found');
            return;
        }

        // Add loading animation styles
        const popupContent = popupOverlay.querySelector('.popup-content');
        if (popupContent) {
            popupContent.style.transition = 'all 0.3s ease';
        }
    }

    // MERGED: Product popup functions - combining both approaches
    window.openProductPopup = function (productId) {
        console.log('Opening popup for product:', productId);

        if (!productId) {
            console.error('Product ID is required');
            return;
        }

        if (isLoading) return;

        currentPopupProductId = productId;
        isLoading = true;

        // Show popup with loading state
        const popup = document.getElementById('productPopup');
        const loadingDiv = document.getElementById('popup-loading');
        const contentDiv = document.getElementById('popup-product-content');

        if (!popup) {
            console.error('Popup elements not found');
            return;
        }

        // Try to load from DOM first (for current page products)
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);

        if (productCard) {
            // Load from DOM data
            loadProductDataFromDOM(productId);
        } else {
            // Load from API
            loadProductDataFromAPI(productId);
        }

        // Show popup
        if (loadingDiv) loadingDiv.classList.remove('d-none');
        if (contentDiv) contentDiv.classList.add('d-none');
        popup.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    // Load product data from DOM (for products on current page)
    function loadProductDataFromDOM(productId) {
        console.log('Loading product data from DOM for:', productId);

        const productCard = document.querySelector(`[data-product-id="${productId}"]`);

        if (!productCard) {
            console.error('Product card not found for ID:', productId);
            showToast('Không tìm thấy thông tin sản phẩm', 'error');
            closeProductPopup();
            return;
        }

        try {
            // Extract product data from the card
            const productName = productCard.querySelector('.product-name')?.textContent || 'Sản phẩm không có tên';
            const productPrice = productCard.querySelector('.product-price')?.textContent || '0 ₫';
            const productImage = productCard.querySelector('.product-image');
            const categoryElement = productCard.querySelector('.product-category');
            const stockElement = productCard.querySelector('.stock-info');

            // Get detail tags
            const detailTags = productCard.querySelectorAll('.detail-tag');
            let size = '', color = '';

            detailTags.forEach(tag => {
                const icon = tag.querySelector('i');
                if (icon?.classList.contains('fa-ruler')) {
                    size = tag.textContent.replace(/.*\s/, '').trim();
                }
                if (icon?.classList.contains('fa-palette')) {
                    color = tag.textContent.replace(/.*\s/, '').trim();
                }
            });

            const productData = {
                id: productId,
                productId: productId,
                productName: productName,
                name: productName,
                price: productPrice,
                image: productImage?.src || 'https://via.placeholder.com/400x400?text=No+Image',
                alt: productImage?.alt || productName,
                images: productImage ? [{ imageUrl: productImage.src, isPrimary: true }] : [],
                category: categoryElement?.textContent.trim().replace(/.*\s/, '') || 'Chưa phân loại',
                categoryName: categoryElement?.textContent.trim().replace(/.*\s/, '') || 'Chưa phân loại',
                stock: stockElement?.textContent.trim() || 'Không có thông tin',
                size: size,
                color: color,
                stockCount: getStockCount(stockElement),
                stockQuantity: getStockCount(stockElement),
                isInStock: checkIfInStock(stockElement),
                description: 'Không có mô tả chi tiết',
                material: 'Chưa có thông tin'
            };

            console.log('Product data from DOM:', productData);

            // Simulate loading delay for better UX
            setTimeout(() => {
                populatePopupMerged(productData);
                isLoading = false;
            }, 500);

        } catch (error) {
            console.error('Error extracting product data:', error);
            showToast('Lỗi khi tải thông tin sản phẩm', 'error');
            closeProductPopup();
            isLoading = false;
        }
    }

    // Load product data from API (fallback)
    async function loadProductDataFromAPI(productId) {
        try {
            const baseUrl = window.location.origin;
            const response = await fetch(`${baseUrl}/Home/GetProductDetails?productId=${productId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const product = await response.json();
            currentProduct = product;

            populatePopupMerged(product);

        } catch (error) {
            console.error('Error loading product details from API:', error);
            showToast('Không thể tải thông tin sản phẩm. Vui lòng thử lại.', 'error');
            closeProductPopup();
        } finally {
            isLoading = false;
        }
    }

    // MERGED: Populate popup with both DOM and API data support
    function populatePopupMerged(productData) {
        console.log('Populating popup with:', productData);
        currentPopupProductData = productData;
        currentProduct = productData;

        try {
            // Check if we have the new popup structure or old structure
            const newPopupContent = document.getElementById('popup-product-content');

            if (newPopupContent) {
                // Use new popup structure (from Razor view)
                populateNewPopupStructure(productData);
            } else {
                // Use old popup structure or create it
                populateOldPopupStructure(productData);
            }

        } catch (error) {
            console.error('Error populating popup:', error);
            showToast('Lỗi khi hiển thị thông tin sản phẩm', 'error');
            closeProductPopup();
        }
    }

    // Populate new popup structure (from Razor view)
    function populateNewPopupStructure(productData) {
        // Populate basic info
        const elements = {
            'popup-product-name': productData.productName || productData.name,
            'popup-price': productData.price,
            'popup-main-image': { src: getMainImageUrl(productData), alt: productData.productName || productData.name },
            'popup-stock-count': (productData.stockQuantity || productData.stockCount || 0).toString()
        };

        // Set text content for simple elements
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element && typeof elements[id] === 'string') {
                element.textContent = elements[id];
            } else if (element && typeof elements[id] === 'object') {
                // Handle image
                if (id === 'popup-main-image') {
                    element.src = elements[id].src;
                    element.alt = elements[id].alt;
                }
            }
        });

        // Category
        const categorySpan = document.querySelector('#popup-category span');
        if (categorySpan) {
            categorySpan.textContent = productData.categoryName || productData.category || 'Chưa phân loại';
        }

        // Stock status
        const stockElement = document.getElementById('popup-stock');
        if (stockElement) {
            const stockQuantity = productData.stockQuantity || productData.stockCount || 0;
            const isInStock = productData.isInStock !== undefined ? productData.isInStock : checkIfInStock({ textContent: productData.stock });

            stockElement.textContent = isInStock ? `Còn ${stockQuantity} sản phẩm` : 'Hết hàng';
            stockElement.className = `stock-status ${isInStock ?
                (stockQuantity > 10 ? 'in-stock' : 'low-stock') : 'out-of-stock'}`;
        }

        // Product details
        toggleDetailRow('popup-size-row', 'popup-size', productData.size);
        toggleDetailRow('popup-color-row', 'popup-color', productData.color);
        toggleDetailRow('popup-material-row', 'popup-material', productData.material);

        // Description
        const descElement = document.getElementById('popup-description');
        if (descElement) {
            descElement.textContent = productData.description || 'Chưa có mô tả chi tiết cho sản phẩm này.';
        }

        // Quantity controls
        const qtyInput = document.getElementById('popup-quantity');
        if (qtyInput) {
            const maxQty = Math.max(1, productData.stockQuantity || productData.stockCount || 1);
            qtyInput.max = maxQty;
            qtyInput.value = 1;
        }

        // Show appropriate buttons based on stock
        const cartSection = document.querySelector('.cart-actions-section');
        const outOfStockSection = document.getElementById('popup-out-of-stock');
        const isInStock = productData.isInStock !== undefined ? productData.isInStock :
            (productData.stockQuantity || productData.stockCount || 0) > 0;

        if (isInStock) {
            if (cartSection) cartSection.classList.remove('d-none');
            if (outOfStockSection) outOfStockSection.classList.add('d-none');
        } else {
            if (cartSection) cartSection.classList.add('d-none');
            if (outOfStockSection) outOfStockSection.classList.remove('d-none');
        }

        // Initialize quantity controls
        initializeQuantityControlsNew();

        // Hide loading and show content
        const loadingDiv = document.getElementById('popup-loading');
        const contentDiv = document.getElementById('popup-product-content');

        if (loadingDiv) loadingDiv.classList.add('d-none');
        if (contentDiv) contentDiv.classList.remove('d-none');

        console.log('New popup structure populated successfully');
    }

    // Populate old popup structure (fallback)
    function populateOldPopupStructure(productData) {
        const popup = document.getElementById('productPopup');
        const popupContent = popup.querySelector('.popup-content');

        // Create the popup HTML structure
        const popupHTML = `
            <button class="popup-close" onclick="closeProductPopup()">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="popup-inner">
                <div class="row">
                    <div class="col-lg-6">
                        <div class="popup-images">
                            <img id="mainImage" src="${getMainImageUrl(productData)}" alt="${productData.productName || productData.name}" class="main-image">
                            <div id="thumbnailList" class="thumbnail-list">
                                ${generateThumbnailsHTML(productData.images)}
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-6">
                        <div class="popup-details">
                            <h2 class="popup-title">${productData.productName || productData.name}</h2>
                            <div class="popup-price">${formatPrice(productData.price)}</div>

                            <div class="detail-item">
                                <div class="detail-label"><i class="fas fa-tags"></i> Danh mục:</div>
                                <div class="detail-value">${productData.categoryName || productData.category || 'Không có thông tin'}</div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-label"><i class="fas fa-ruler"></i> Kích thước:</div>
                                <div class="detail-value">${productData.size || 'Không có thông tin'}</div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-label"><i class="fas fa-palette"></i> Màu sắc:</div>
                                <div class="detail-value">${productData.color || 'Không có thông tin'}</div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-label"><i class="fas fa-tshirt"></i> Chất liệu:</div>
                                <div class="detail-value">${productData.material || 'Không có thông tin'}</div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-label"><i class="fas fa-warehouse"></i> Số lượng còn lại:</div>
                                <div class="detail-value ${getStockClass(productData.stockQuantity || productData.stockCount)}">
                                    ${getStockText(productData.stockQuantity || productData.stockCount)}
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-label"><i class="fas fa-info-circle"></i> Mô tả:</div>
                                <div class="detail-value description-text">${productData.description || 'Không có mô tả'}</div>
                            </div>

                            <div class="popup-actions">
                                <button class="popup-btn add-to-cart-btn" onclick="addToCartFromPopup()">
                                    <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                                </button>
                                <button class="popup-btn buy-now-btn" onclick="buyNowFromPopup()">
                                    <i class="fas fa-bolt"></i> Mua ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        popupContent.innerHTML = popupHTML;

        // Setup thumbnail click events
        setupThumbnailEvents();

        console.log('Old popup structure populated successfully');
    }

    function getMainImageUrl(product) {
        if (!product.images || product.images.length === 0) {
            return product.image || '/images/no-image.jpg'; // fallback image
        }

        const primaryImage = product.images.find(img => img.isPrimary);
        return primaryImage ? primaryImage.imageUrl : product.images[0].imageUrl;
    }

    function generateThumbnailsHTML(images) {
        if (!images || images.length === 0) {
            return '<p style="color: var(--text-light); text-align: center;">Không có hình ảnh</p>';
        }

        return images.map((image, index) => `
            <img src="${image.imageUrl}" 
                 alt="${image.altText || ''}" 
                 class="thumbnail ${image.isPrimary ? 'active' : ''}" 
                 onclick="changeMainImage('${image.imageUrl}', this)">
        `).join('');
    }

    function setupThumbnailEvents() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('mouseenter', function () {
                this.style.transform = 'scale(1.1)';
            });

            thumbnail.addEventListener('mouseleave', function () {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'scale(1)';
                }
            });
        });
    }

    // Helper functions
    function getStockCount(stockElement) {
        if (typeof stockElement === 'number') return stockElement;
        if (!stockElement) return 0;
        if (typeof stockElement === 'object' && stockElement.textContent) {
            const text = stockElement.textContent;
            const match = text.match(/Còn\s+(\d+)/i) || text.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        }
        return 0;
    }

    function checkIfInStock(stockElement) {
        if (typeof stockElement === 'boolean') return stockElement;
        if (!stockElement) return false;
        if (typeof stockElement === 'object' && stockElement.textContent) {
            const text = stockElement.textContent.toLowerCase();
            return !text.includes('hết hàng') && !text.includes('out of stock');
        }
        return false;
    }

    function toggleDetailRow(rowId, valueId, value) {
        const row = document.getElementById(rowId);
        const valueElement = document.getElementById(valueId);

        if (value && value.trim() && value !== 'undefined') {
            if (row) row.classList.remove('d-none');
            if (valueElement) valueElement.textContent = value;
        } else {
            if (row) row.classList.add('d-none');
        }
    }

    function initializeQuantityControlsNew() {
        const qtyInput = document.getElementById('popup-quantity');
        const decreaseBtn = document.getElementById('popup-qty-decrease');
        const increaseBtn = document.getElementById('popup-qty-increase');

        if (!qtyInput || !decreaseBtn || !increaseBtn) {
            console.warn('Quantity control elements not found');
            return;
        }

        // Remove existing event listeners to avoid duplicates
        const newDecreaseBtn = decreaseBtn.cloneNode(true);
        const newIncreaseBtn = increaseBtn.cloneNode(true);
        decreaseBtn.parentNode.replaceChild(newDecreaseBtn, decreaseBtn);
        increaseBtn.parentNode.replaceChild(newIncreaseBtn, increaseBtn);

        newDecreaseBtn.addEventListener('click', function () {
            const current = parseInt(qtyInput.value) || 1;
            if (current > 1) {
                qtyInput.value = current - 1;
            }
        });

        newIncreaseBtn.addEventListener('click', function () {
            const current = parseInt(qtyInput.value) || 1;
            const max = parseInt(qtyInput.max) || 1;
            if (current < max) {
                qtyInput.value = current + 1;
            } else {
                showToast('Đã đạt số lượng tối đa', 'warning');
            }
        });

        // Validate input on change
        qtyInput.addEventListener('change', function () {
            const value = parseInt(this.value) || 1;
            const max = parseInt(this.max) || 1;
            const min = parseInt(this.min) || 1;

            if (value > max) this.value = max;
            if (value < min) this.value = min;
        });
    }

    // Change main image function
    window.changeMainImage = function (imageUrl, clickedThumbnail) {
        const mainImage = document.getElementById('mainImage') || document.getElementById('popup-main-image');
        if (mainImage) {
            // Add fade effect
            mainImage.style.opacity = '0.5';

            setTimeout(() => {
                mainImage.src = imageUrl;
                mainImage.style.opacity = '1';
            }, 150);
        }

        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
            thumb.style.transform = 'scale(1)';
        });

        if (clickedThumbnail) {
            clickedThumbnail.classList.add('active');
            clickedThumbnail.style.transform = 'scale(1.1)';
        }
    };

    // MERGED: Close product popup with smooth animation
    window.closeProductPopup = function (event) {
        console.log('Closing popup');

        const popup = document.getElementById('productPopup');
        if (!popup) return;

        // Add closing animation
        const popupContent = popup.querySelector('.popup-content');
        if (popupContent) {
            popupContent.style.transform = 'scale(0.7)';
            popupContent.style.opacity = '0.5';
        }

        popup.classList.remove('show');
        document.body.style.overflow = '';

        // Reset popup state after animation
        setTimeout(() => {
            const loadingDiv = document.getElementById('popup-loading');
            const contentDiv = document.getElementById('popup-product-content');

            if (loadingDiv) loadingDiv.classList.remove('d-none');
            if (contentDiv) contentDiv.classList.add('d-none');

            // Reset popup content transform
            if (popupContent) {
                popupContent.style.transform = '';
                popupContent.style.opacity = '';
            }

            currentPopupProductId = null;
            currentPopupProductData = null;
            currentProduct = null;
            isLoading = false;
        }, 300);
    };

    // UPDATED: Add to cart with auto-close popup and success notification
    window.addToCartFromPopup = function () {
        if (!currentPopupProductId || !currentPopupProductData) {
            console.error('No product data available');
            return;
        }

        if (!isUserAuthenticated()) {
            showLoginModal();
            return;
        }

        const qtyInput = document.getElementById('popup-quantity');
        const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        const button = document.getElementById('popup-add-to-cart') || document.querySelector('.add-to-cart-btn');

        if (!button) {
            console.error('Add to cart button not found');
            return;
        }

        const originalHTML = button.innerHTML;
        const productName = currentPopupProductData.productName || currentPopupProductData.name;

        // Show loading state
        //button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Đang thêm...</span>';
        //button.classList.add('loading');
        //button.disabled = true;

        // Get anti-forgery token
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

        $.ajax({
            url: '/Cart/AddToCart',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                ProductId: currentPopupProductId,
                Quantity: quantity
            }),
            headers: token ? {
                'RequestVerificationToken': token
            } : {},
            success: function (response) {
                if (response && response.success) {
                    // Update cart badge immediately
                    if (typeof updateCartBadge === 'function' && response.cartCount) {
                        updateCartBadge(response.cartCount);
                    }

                    // Close popup with animation
                    closeProductPopup();

                    // Show success notification after popup closes
                    setTimeout(() => {
                        const successMessage = quantity > 1
                            ? `Đã thêm ${quantity} "${productName}" vào giỏ hàng`
                            : `Đã thêm "${productName}" vào giỏ hàng`;
                        showSuccessNotification(successMessage, currentPopupProductData);
                    }, 400);

                } else {
                    showToast(response?.message || 'Có lỗi xảy ra', 'error');
                    // Restore button state on error
                    button.innerHTML = originalHTML;
                    button.classList.remove('loading');
                    button.disabled = false;
                }
            },
            error: function (xhr, status, error) {
                console.error('Ajax error:', error);
                showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
                // Restore button state on error
                button.innerHTML = originalHTML;
                button.classList.remove('loading');
                button.disabled = false;
            }
        });
    };

    // UPDATED: Buy now with auto-close popup
    window.buyNowFromPopup = function () {
        if (!currentPopupProductId || !currentPopupProductData) {
            console.error('No product data available');
            return;
        }

        if (!isUserAuthenticated()) {
            showLoginModal();
            return;
        }

        const qtyInput = document.getElementById('popup-quantity');
        const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        const button = document.getElementById('popup-buy-now') || document.querySelector('.buy-now-btn');

        if (!button) {
            console.error('Buy now button not found');
            return;
        }

        const originalHTML = button.innerHTML;

        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Đang xử lý...</span>';
        button.classList.add('loading');
        button.disabled = true;

        // Get anti-forgery token
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

        $.ajax({
            url: '/Cart/AddToCart',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                ProductId: currentPopupProductId,
                Quantity: quantity
            }),
            headers: token ? {
                'RequestVerificationToken': token
            } : {},
            success: function (response) {
                if (response && response.success) {
                    // Close popup first
                    closeProductPopup();

                    // Then redirect to checkout after a short delay
                    setTimeout(() => {
                        window.location.href = '/Cart/Checkout';
                    }, 400);
                } else {
                    showToast(response?.message || 'Có lỗi xảy ra', 'error');
                    button.innerHTML = originalHTML;
                    button.classList.remove('loading');
                    button.disabled = false;
                }
            },
            error: function (xhr, status, error) {
                console.error('Ajax error:', error);
                showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
                button.innerHTML = originalHTML;
                button.classList.remove('loading');
                button.disabled = false;
            }
        });
    };

    // Notify when available function
    window.notifyWhenAvailable = function () {
        if (!isUserAuthenticated()) {
            showLoginModal();
            return;
        }
        showToast('Tính năng thông báo khi có hàng sẽ được cập nhật sớm!', 'info');
    };

    // Original shopping cart functions (legacy support)
    window.addToCart = function (productId) {
        // Legacy function - redirect to new implementation
        currentPopupProductId = productId;
        currentPopupProductData = currentProduct;
        addToCartFromPopup();
    };

    window.buyNow = function (productId) {
        // Legacy function - redirect to new implementation  
        currentPopupProductId = productId;
        currentPopupProductData = currentProduct;
        buyNowFromPopup();
    };

    // Utility functions
    function formatPrice(price) {
        if (typeof price === 'string') {
            // If already formatted, return as is
            return price;
        }
        return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
    }

    function getStockClass(quantity) {
        if (!quantity || quantity === 0) return 'stock-out';
        return quantity <= 10 ? 'stock-low' : 'stock-ok';
    }

    function getStockText(quantity) {
        if (!quantity || quantity === 0) return 'Hết hàng';
        return `${quantity} sản phẩm`;
    }

    // Helper functions for authentication and UI
    function isUserAuthenticated() {
        // Check if user authenticated span exists (added in Razor view)
        return document.querySelector('.user-authenticated') !== null;
    }

    function showLoginModal() {
        if (confirm('Bạn cần đăng nhập để sử dụng giỏ hàng. Chuyển đến trang đăng nhập?')) {
            window.location.href = '/Account/Login?returnUrl=' + encodeURIComponent(window.location.href);
        }
    }

    // Toast notification function (fallback if not exists)
    if (typeof showToast !== 'function') {
        window.showToast = function (message, type = 'info') {
            console.log(`Toast (${type}): ${message}`);

            // Create simple toast notification
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 5px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(400px);
                transition: transform 0.3s ease;
            `;
            toast.textContent = message;

            document.body.appendChild(toast);

            // Show toast
            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
            }, 100);

            // Hide toast after 3 seconds
            setTimeout(() => {
                toast.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        };
    }

    // Cart badge update function (fallback if not exists)
    if (typeof updateCartBadge !== 'function') {
        window.updateCartBadge = function (count) {
            console.log('Update cart badge:', count);
            const badges = document.querySelectorAll('.cart-badge, .badge, [class*="cart-count"]');
            badges.forEach(badge => {
                badge.textContent = count;
                if (count > 0) {
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            });
        };
    }

    // Cart count update function (fallback if not exists)
    if (typeof updateCartCount !== 'function') {
        window.updateCartCount = function () {
            console.log('Update cart count called');
            // This could make an AJAX call to get current cart count
        };
    }

    // Event handlers
    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            if (document.getElementById('successOverlay').classList.contains('show')) {
                closeSuccessNotification();
            } else {
                closeProductPopup();
            }
        }
    }

    // FIXED: Category change handler - không preventDefault
    function handleCategoryChange(event) {
        // KHÔNG preventDefault() - để link hoạt động bình thường
        // Chỉ thêm visual effects

        const clickedBtn = event.currentTarget;

        // Debug log
        console.log('Category clicked:', {
            text: clickedBtn.textContent.trim(),
            href: clickedBtn.href
        });

        // Add loading effect
        clickedBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            clickedBtn.style.transform = 'scale(1)';
        }, 150);

        // Server sẽ handle việc thay đổi active class khi render lại page
    }

    function handleProductClick(event) {
        const productCard = event.target.closest('.product-card');
        if (productCard && !event.target.closest('.popup-overlay')) {
            const productId = productCard.getAttribute('onclick')?.match(/\d+/)?.[0] ||
                productCard.getAttribute('data-product-id');
            if (productId) {
                // Add click effect
                productCard.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    productCard.style.transform = '';
                }, 100);
            }
        }
    }

    function handlePopupClose(event) {
        if (event.target.id === 'productPopup') {
            closeProductPopup();
        }
    }

    function handleResize() {
        // Recreate snow effect on larger screens
        if (window.innerWidth > 768 && !document.getElementById('snow-container')) {
            initializeSnowAnimation();
        } else if (window.innerWidth <= 768) {
            const snowContainer = document.getElementById('snow-container');
            if (snowContainer) {
                snowContainer.remove();
            }
        }
    }

    function handleScroll() {
        const scrolled = window.pageYOffset;

        // 1. Sticky navigation (nếu có)
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (scrolled > 100) {
                navbar.classList.add('sticky');
            } else {
                navbar.classList.remove('sticky');
            }
        }

        // 2. Back-to-top button
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            if (scrolled > 300) {
                backToTopBtn.style.display = 'block';
                backToTopBtn.style.opacity = '1';
            } else {
                backToTopBtn.style.opacity = '0';
                setTimeout(() => {
                    if (window.pageYOffset <= 300) {
                        backToTopBtn.style.display = 'none';
                    }
                }, 300);
            }
        }

        // 3. Scroll progress indicator
        const scrollProgress = document.getElementById('scrollProgress');
        if (scrollProgress) {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrolled / windowHeight) * 100;
            scrollProgress.style.width = progress + '%';
        }

        // 4. Fade in elements when scrolling into view
        const fadeElements = document.querySelectorAll('.fade-on-scroll');
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100) {
                element.classList.add('visible');
            }
        });

        // 5. Hide/show categories on scroll (optional)
        const categoriesSection = document.querySelector('.categories-section');
        if (categoriesSection) {
            if (scrolled > 200) {
                categoriesSection.classList.add('compact');
            } else {
                categoriesSection.classList.remove('compact');
            }
        }
    }

    // Initialize lazy loading for images
    function initializeLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    // Search enhancements
    function initializeSearchEnhancements() {
        const searchInputs = document.querySelectorAll('input[type="text"][name*="search"]');

        searchInputs.forEach(input => {
            // Add search suggestions or autocomplete functionality
            input.addEventListener('input', debounce(handleSearchInput, 300));

            // Add enter key handler
            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.closest('form').submit();
                }
            });
        });
    }

    function handleSearchInput(event) {
        const query = event.target.value;
        if (query.length >= 2) {
            // Implement search suggestions here if needed
            console.log('Search query:', query);
        }
    }

    // Utility functions
    function throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

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

    // Add fade-in animation CSS and other styles
    const fadeInStyle = document.createElement('style');
    fadeInStyle.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .loading {
            position: relative;
            pointer-events: none;
        }
        
        .loading::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: inherit;
        }
        
        .stock-out {
            color: var(--danger-red, #dc3545);
            font-weight: bold;
        }
        
        .stock-low {
            color: var(--warning-orange, #fd7e14);
            font-weight: bold;
        }
        
        .stock-ok {
            color: var(--success-green, #28a745);
            font-weight: bold;
        }
        
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .popup-overlay.show {
            display: flex !important;
            opacity: 1;
        }
        
        .main-image {
            width: 100%;
            max-height: 400px;
            object-fit: cover;
            border-radius: 10px;
        }
        
        .thumbnail {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 5px;
            margin: 0 5px;
            cursor: pointer;
            opacity: 0.7;
            transition: all 0.3s ease;
        }
        
        .thumbnail:hover,
        .thumbnail.active {
            opacity: 1;
            transform: scale(1.1);
        }
        
        .popup-btn {
            padding: 0.75rem 1.5rem;
            margin: 0.5rem;
            border: none;
            border-radius: 5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .add-to-cart-btn {
            background: var(--winter-blue, #4A90E2);
            color: white;
        }
        
        .buy-now-btn {
            background: var(--success-green, #28a745);
            color: white;
        }
        
        .popup-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .popup-close {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s ease;
        }
        
        .popup-close:hover {
            background: rgba(0, 0, 0, 0.7);
            transform: rotate(90deg);
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--winter-blue, #4A90E2);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(fadeInStyle);

    // Export functions for global access
    window.SnowClothes = {
        openProductPopup,
        closeProductPopup,
        addToCartFromPopup,
        buyNowFromPopup,
        changeMainImage,
        showToast,
        updateCartBadge,
        showSuccessNotification,
        closeSuccessNotification,
        goToCart
    };

})();