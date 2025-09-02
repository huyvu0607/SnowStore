// SnowClothes JavaScript - Fixed version
(function () {
    'use strict';

    // Global variables
    let currentProduct = null;
    let isLoading = false;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function () {
        initializeSnowClothes();
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

    // Product popup functions
    window.openProductPopup = async function (productId) {
        if (isLoading) return;

        isLoading = true;
        showLoadingState();

        try {
            // Get base URL for the API call
            const baseUrl = window.location.origin;
            const response = await fetch(`${baseUrl}/Home/GetProductDetails?productId=${productId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const product = await response.json();
            currentProduct = product;

            updatePopupContent(product);
            showProductPopup();

        } catch (error) {
            console.error('Error loading product details:', error);
            showErrorState('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
        } finally {
            isLoading = false;
            hideLoadingState();
        }
    };

    function showLoadingState() {
        const popup = document.getElementById('productPopup');
        const content = popup.querySelector('.popup-content');

        content.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 300px; flex-direction: column; gap: 1rem;">
                <div class="loading-spinner"></div>
                <p style="color: var(--text-light);">Đang tải thông tin sản phẩm...</p>
            </div>
        `;

        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function hideLoadingState() {
        // This will be handled by updatePopupContent or error state
    }

    function showErrorState(message) {
        const popup = document.getElementById('productPopup');
        const content = popup.querySelector('.popup-content');

        content.innerHTML = `
            <button class="close-btn" onclick="closeProductPopup()">&times;</button>
            <div style="text-align: center; padding: 2rem; color: var(--danger-red);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Lỗi</h3>
                <p>${message}</p>
                <button onclick="closeProductPopup()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--winter-blue); color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Đóng
                </button>
            </div>
        `;
    }

    function updatePopupContent(product) {
        const popup = document.getElementById('productPopup');

        // Create the popup HTML structure
        const popupHTML = `
            <button class="close-btn" onclick="closeProductPopup()">&times;</button>
            
            <div class="popup-images">
                <img id="mainImage" src="${getMainImageUrl(product)}" alt="${product.productName}" class="main-image">
                <div id="thumbnailList" class="thumbnail-list">
                    ${generateThumbnailsHTML(product.images)}
                </div>
            </div>

            <div class="popup-details">
                <h2 class="popup-title">${product.productName}</h2>
                <div class="popup-price">${formatPrice(product.price)}</div>

                <div class="detail-item">
                    <div class="detail-label"><i class="fas fa-tags"></i> Danh mục:</div>
                    <div class="detail-value">${product.categoryName || 'Không có thông tin'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label"><i class="fas fa-ruler"></i> Kích thước:</div>
                    <div class="detail-value">${product.size || 'Không có thông tin'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label"><i class="fas fa-palette"></i> Màu sắc:</div>
                    <div class="detail-value">${product.color || 'Không có thông tin'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label"><i class="fas fa-tshirt"></i> Chất liệu:</div>
                    <div class="detail-value">${product.material || 'Không có thông tin'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label"><i class="fas fa-warehouse"></i> Số lượng còn lại:</div>
                    <div class="detail-value ${getStockClass(product.stockQuantity)}">
                        ${getStockText(product.stockQuantity)}
                    </div>
                </div>

                <div class="detail-item">
                    <div class="detail-label"><i class="fas fa-info-circle"></i> Mô tả:</div>
                    <div class="detail-value description-text">${product.description || 'Không có mô tả'}</div>
                </div>

                <div class="popup-actions">
                    <button class="popup-btn add-to-cart-btn" onclick="addToCart(${product.productId})">
                        <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                    </button>
                    <button class="popup-btn buy-now-btn" onclick="buyNow(${product.productId})">
                        <i class="fas fa-bolt"></i> Mua ngay
                    </button>
                </div>
            </div>
        `;

        popup.querySelector('.popup-content').innerHTML = popupHTML;

        // Setup thumbnail click events
        setupThumbnailEvents();
    }

    function getMainImageUrl(product) {
        if (!product.images || product.images.length === 0) {
            return '/images/no-image.jpg'; // fallback image
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

    // Change main image function
    window.changeMainImage = function (imageUrl, clickedThumbnail) {
        const mainImage = document.getElementById('mainImage');
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

    function showProductPopup() {
        const popup = document.getElementById('productPopup');
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Add show animation
        setTimeout(() => {
            popup.style.opacity = '1';
        }, 10);
    }

    // Close product popup
    window.closeProductPopup = function () {
        const popup = document.getElementById('productPopup');
        popup.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentProduct = null;
    };

    // Utility functions
    function formatPrice(price) {
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

    // Event handlers
    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            closeProductPopup();
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
            const productId = productCard.getAttribute('onclick')?.match(/\d+/)?.[0];
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

    // Shopping cart functions (placeholder - implement based on your cart system)
    window.addToCart = function (productId) {
        if (!currentProduct) return;

        // Add visual feedback
        const button = document.querySelector('.add-to-cart-btn');
        const originalText = button.innerHTML;

        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang thêm...';
        button.disabled = true;

        // Simulate API call
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Đã thêm!';
            button.style.background = 'var(--success-green)';

            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                button.style.background = '';
            }, 2000);
        }, 1000);

        // Here you would typically make an API call to add the product to cart
        console.log('Adding product to cart:', productId);
    };

    window.buyNow = function (productId) {
        if (!currentProduct) return;

        // Add visual feedback
        const button = document.querySelector('.buy-now-btn');
        const originalText = button.innerHTML;

        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        button.disabled = true;

        // Here you would typically redirect to checkout or handle buy now logic
        setTimeout(() => {
            console.log('Buy now:', productId);
            // Example: window.location.href = `/checkout?productId=${productId}`;

            button.innerHTML = originalText;
            button.disabled = false;
        }, 1500);
    };

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

    // Add fade-in animation CSS
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
            color: var(--danger-red);
            font-weight: bold;
        }
    `;
    document.head.appendChild(fadeInStyle);

})();