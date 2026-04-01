document.addEventListener('DOMContentLoaded', () => {
    // Cart State
    let cart = [];
    let isDelivery = false;
    const deliveryFee = 40;

    // DOM Elements
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const bookingForm = document.getElementById('booking-form');
    const toastEl = document.getElementById('toast');
    const orderTypeRadios = document.querySelectorAll('input[name="order-type"]');
    const deliveryAddressWrapper = document.getElementById('delivery-address-wrapper');
    const deliveryAddressInput = document.getElementById('delivery-address');
    const getLocationBtn = document.getElementById('get-location-btn');
    const deliveryFeeLine = document.getElementById('delivery-fee-line');

    // --- Core Functions ---

    // Toggle Cart Sidebar
    const toggleCart = () => {
        if (!cartSidebar || !cartOverlay) return;
        const isActive = cartSidebar.classList.contains('active');
        if (isActive) {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        } else {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        }
    };

    // Show Toast Notification
    const showToast = (message) => {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add('active');
        setTimeout(() => {
            toastEl.classList.remove('active');
        }, 3000);
    };

    // Update Cart UI
    const updateCartUI = () => {
        if (!cartCount || !cartItemsContainer || !cartTotalPrice || !deliveryFeeLine) return;

        // Update Badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Animate badge
        cartCount.style.transform = 'scale(1.2) translateY(-2px)';
        setTimeout(() => cartCount.style.transform = 'none', 200);

        // Update Sidebar HTML
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is currently empty.</div>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                        <span style="color: var(--text-muted); font-size: 0.9rem;"> x ${item.quantity}</span>
                    </div>
                    <button class="remove-btn" data-id="${item.id}">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </div>
            `).join('');
        }

        // Update Total
        let totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Delivery fee check
        if (isDelivery && cart.length > 0) {
            totalCost += deliveryFee;
            deliveryFeeLine.style.display = 'flex';
        } else {
            deliveryFeeLine.style.display = 'none';
        }
        
        cartTotalPrice.textContent = `₹${totalCost.toFixed(2)}`;
    };

    // Add to Cart Logic
    const addToCart = (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;

        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const price = parseFloat(btn.getAttribute('data-price'));

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }

        updateCartUI();
        showToast(`${name} added to cart!`);
        
        // Animate button
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 150);
    };

    // Remove from Cart Logic
    const removeFromCart = (id) => {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    };

    // --- Event Listeners ---

    // Cart Toggle
    if (cartIcon) cartIcon.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    // Add to Cart Buttons
    addToCartBtns.forEach(btn => btn.addEventListener('click', addToCart));

    // Remove from Cart (Event Delegation)
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            if (removeBtn) {
                const id = removeBtn.getAttribute('data-id');
                removeFromCart(id);
            }
        });
    }

    // Delivery Toggle Logic
    orderTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'delivery') {
                isDelivery = true;
                if (deliveryAddressWrapper) deliveryAddressWrapper.classList.add('active');
            } else {
                isDelivery = false;
                if (deliveryAddressWrapper) deliveryAddressWrapper.classList.remove('active');
            }
            updateCartUI();
        });
    });

    // Get Live Location Logic
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                showToast('Location tracking is not supported by your browser.');
                return;
            }

            if (location.protocol === 'file:') {
                showToast('Geolocation requires a local server (http://). Please use the provided run.bat!');
                return;
            }

            getLocationBtn.innerHTML = '<ion-icon name="sync-outline" class="spin-icon"></ion-icon> Locating...';
            getLocationBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const data = await response.json();
                        
                        if (data && data.display_name) {
                            if (deliveryAddressInput) deliveryAddressInput.value = data.display_name;
                            showToast('Address tracked successfully!');
                        } else {
                            showToast('Could not find detailed address.');
                        }
                    } catch (error) {
                        showToast('Error getting reverse geocoding.');
                    } finally {
                        getLocationBtn.innerHTML = '<ion-icon name="location-outline"></ion-icon> Use Current Location';
                        getLocationBtn.disabled = false;
                    }
                },
                (error) => {
                    showToast('Unable to retrieve location. Please check browser permissions.');
                    getLocationBtn.innerHTML = '<ion-icon name="location-outline"></ion-icon> Use Current Location';
                    getLocationBtn.disabled = false;
                }
            );
        });
    }

    // Checkout Event
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty!');
                return;
            }
            if (isDelivery) {
                const address = deliveryAddressInput ? deliveryAddressInput.value.trim() : '';
                if (!address) {
                    showToast('Please enter a delivery address!');
                    return;
                }
                showToast('Processing Delivery Order. Thank you!');
                if (deliveryAddressInput) deliveryAddressInput.value = ''; 
            } else {
                showToast('Processing Pickup Order... Thank you!');
            }
            
            cart = [];
            updateCartUI();
            setTimeout(toggleCart, 1500);
        });
    }

    // Booking Form Submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('b-name').value;
            const date = document.getElementById('b-date').value;
            const time = document.getElementById('b-time').value;
            const guests = document.getElementById('b-guests').value;

            showToast(`Table booked for ${name} on ${date} at ${time} for ${guests} guests.`);
            bookingForm.reset();
        });
    }

    // Protocol Warning
    if (location.protocol === 'file:') {
        console.warn('Noodles King: Running via file://. Some features like Geolocation may be limited. Use the run.bat script for the best experience.');
    }
});
