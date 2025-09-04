// Cart functionality JavaScript
$(document).ready(function () {
    // Initialize cart functionality
    initializeCart();
});

function initializeCart() {
    // Quantity controls
    $('.btn-increase-qty').on('click', function () {
        const cartItemId = $(this).data('cart-item-id');
        const quantityInput = $(`.quantity-input[data-cart-item-id="${cartItemId}"]`);
        const currentQty = parseInt(quantityInput.val());
        const maxQty = parseInt(quantityInput.attr('max'));

        if (currentQty < maxQty) {
            const newQty = currentQty + 1;
            updateQuantity(cartItemId, newQty);
        } else {
            showToast('Không đủ hàng trong kho!', 'warning');
        }
    });

    $('.btn-decrease-qty').on('click', function () {
        const cartItemId = $(this).data('cart-item-id');
        const quantityInput = $(`.quantity-input[data-cart-item-id="${cartItemId}"]`);
        const currentQty = parseInt(quantityInput.val());

        if (currentQty > 1) {
            const newQty = currentQty - 1;
            updateQuantity(cartItemId, newQty);
        } else {
            // If quantity is 1, remove item
            removeFromCart(cartItemId);
        }
    });

    // Direct quantity input change
    $('.quantity-input').on('change', function () {
        const cartItemId = $(this).data('cart-item-id');
        const newQty = parseInt($(this).val());
        const maxQty = parseInt($(this).attr('max'));

        if (newQty <= 0) {
            removeFromCart(cartItemId);
        } else if (newQty > maxQty) {
            $(this).val(maxQty);
            showToast('Không đủ hàng trong kho!', 'warning');
            updateQuantity(cartItemId, maxQty);
        } else {
            updateQuantity(cartItemId, newQty);
        }
    });

    // Remove item buttons
    $('.btn-remove-item').on('click', function () {
        const cartItemId = $(this).data('cart-item-id');

        // Show confirmation
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            removeFromCart(cartItemId);
        }
    });

    // Clear cart button
    $('#btn-clear-cart').on('click', function () {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
            clearCart();
        }
    });

    // Apply voucher (placeholder)
    $('#btn-apply-voucher').on('click', function () {
        const voucherCode = $('#voucher-input').val().trim();
        if (voucherCode) {
            applyVoucher(voucherCode);
        } else {
            showToast('Vui lòng nhập mã giảm giá!', 'warning');
        }
    });
}

// Add to cart function (for product pages)
function addToCart(productId, quantity = 1) {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
        showLoginModal();
        return;
    }

    showLoading();

    $.ajax({
        url: '/Cart/AddToCart',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ProductId: productId,
            Quantity: quantity
        }),
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            hideLoading();
            if (response.success) {
                showToast(response.message, 'success');
                updateCartBadge(response.cartCount);
                updateCartTotal(response.totalAmount);
            } else {
                showToast(response.message, 'error');
            }
        },
        error: function () {
            hideLoading();
            showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        }
    });
}

// Update quantity
function updateQuantity(cartItemId, quantity) {
    showLoading();

    $.ajax({
        url: '/Cart/UpdateQuantity',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            CartItemId: cartItemId,
            Quantity: quantity
        }),
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            hideLoading();
            if (response.success) {
                // Update quantity input
                $(`.quantity-input[data-cart-item-id="${cartItemId}"]`).val(quantity);

                // Update item total
                $(`.cart-item[data-cart-item-id="${cartItemId}"] .item-total`).text(response.itemTotal + ' ₫');

                // Update cart summary
                updateCartSummary(response.cartCount, response.totalAmount);

                showToast('Đã cập nhật số lượng!', 'success');
            } else {
                showToast(response.message, 'error');
            }
        },
        error: function () {
            hideLoading();
            showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        }
    });
}

// Remove item from cart
function removeFromCart(cartItemId) {
    showLoading();

    $.ajax({
        url: '/Cart/RemoveFromCart',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            CartItemId: cartItemId
        }),
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            hideLoading();
            if (response.success) {
                // Remove item from DOM with animation
                $(`.cart-item[data-cart-item-id="${cartItemId}"]`).fadeOut(300, function () {
                    $(this).remove();

                    // Check if cart is empty
                    if ($('.cart-item').length === 0) {
                        location.reload(); // Reload to show empty cart message
                    }
                });

                // Update cart summary
                updateCartSummary(response.cartCount, response.totalAmount);

                showToast(response.message, 'success');
            } else {
                showToast(response.message, 'error');
            }
        },
        error: function () {
            hideLoading();
            showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        }
    });
}

// Clear entire cart
function clearCart() {
    showLoading();

    $.ajax({
        url: '/Cart/ClearCart',
        method: 'POST',
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            hideLoading();
            if (response.success) {
                showToast(response.message, 'success');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                showToast(response.message, 'error');
            }
        },
        error: function () {
            hideLoading();
            showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        }
    });
}

// Apply voucher (placeholder function)
function applyVoucher(voucherCode) {
    showLoading();

    // This is a placeholder - implement voucher logic in backend
    setTimeout(() => {
        hideLoading();
        showToast('Tính năng mã giảm giá sẽ được cập nhật sớm!', 'info');
    }, 1000);
}

// Update cart summary
function updateCartSummary(totalItems, totalAmount) {
    $('#total-items').text(totalItems + ' sản phẩm');
    $('#subtotal').text(totalAmount + ' ₫');
    $('#total-amount').text(totalAmount + ' ₫');
    updateCartBadge(totalItems);
}

// Update cart badge in header
function updateCartBadge(count) {
    // Cập nhật cả cart-count-circle và các element khác
    const cartCountCircle = $('.cart-count-circle');
    const cartBadge = $('.cart-badge, .cart-count');

    if (count > 0) {
        // Hiện và cập nhật cart-count-circle
        cartCountCircle.text(count).removeClass('d-none');

        // Cập nhật các badge khác nếu có
        cartBadge.text(count).show();
    } else {
        // Ẩn khi count = 0
        cartCountCircle.addClass('d-none');
        cartBadge.hide();
    }
}

// Update cart total (for product pages)
function updateCartTotal(totalAmount) {
    $('.cart-total').text(totalAmount + ' ₫');
}

// Check if user is authenticated
function isUserAuthenticated() {
    // You can implement this based on your authentication system
    // For now, check if there's a user indicator in the DOM
    return $('.user-authenticated').length > 0 || $('body').hasClass('authenticated');
}

// Show login modal or redirect to login
function showLoginModal() {
    // If you have a login modal
    if ($('#loginModal').length > 0) {
        $('#loginModal').modal('show');
    } else {
        // Redirect to login page
        if (confirm('Bạn cần đăng nhập để sử dụng giỏ hàng. Chuyển đến trang đăng nhập?')) {
            window.location.href = '/Account/Login?returnUrl=' + encodeURIComponent(window.location.href);
        }
    }
}

// Loading functions
function showLoading() {
    $('#loading-overlay').removeClass('d-none');
}

function hideLoading() {
    $('#loading-overlay').addClass('d-none');
}

// Toast notification function
function showToast(message, type = 'info') {
    // Remove existing toasts
    $('.toast-notification').remove();

    const toastClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';

    const toastIcon = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';

    const toast = $(`
        <div class="toast-notification position-fixed" style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            <div class="alert ${toastClass} alert-dismissible fade show" role="alert">
                <i class="${toastIcon} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    `);

    $('body').append(toast);

    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.fadeOut(300, () => toast.remove());
    }, 5000);
}

// Get cart count and update badge on page load
function updateCartCount() {
    $.ajax({
        url: '/Cart/GetCartCount',
        method: 'GET',
        success: function (response) {
            updateCartBadge(response.cartCount);
        },
        error: function () {
            console.log('Failed to get cart count');
        }
    });
}


// Initialize cart count on page load
$(document).ready(function () {
    updateCartCount();
});

// Global function for adding to cart from any page
window.addToCart = addToCart;