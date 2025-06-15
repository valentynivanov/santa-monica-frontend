import {pizzas, sides, drinks} from './data.js'
console.log('App loaded pizzas:', pizzas)
// Cart state management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Navigation active state
function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    const currentPage = currentPath === '/' ? '/' : currentPath.replace(/^\/|\/$/g, '');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').replace(/^\/|\/$/g, '');
        if (linkPath === currentPage || (link.getAttribute('href') === '/' && currentPage === '')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Hamburger menu functionality
function initializeHamburgerMenu() {
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener("click", () => {
            hamburgerMenu.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
            hamburgerMenu.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    console.log('Cart saved to localStorage:', cart);
}

function addToCart(product) {
    console.log('Adding to cart:', product);
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('Increased quantity for:', existingItem);
    } else {
        cart.push({ ...product, quantity: 1 });
        console.log('Added new item:', product);
    }
    saveCart();
    updateProductUI(product.id);
}

function removeFromCart(productId) {
    console.log('Removing from cart:', productId);
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity > 1) {
            existingItem.quantity -= 1;
            console.log('Decreased quantity for item:', existingItem);
        } else {
            cart = cart.filter(item => item.id !== productId);
            console.log('Removed item completely from cart');
        }
        saveCart();
        updateProductUI(productId);
    }
}

function updateProductUI(productId) {
    console.log('Updating UI for product:', productId);
    
    // Update menu page UI if we're on the menu page
    if (document.getElementById('pizza-menu')) {
        const cartItem = cart.find(item => item.id === productId);
        const productElement = document.querySelector(`[data-product-id="${productId}"]`).closest('.box');
        
        if (productElement && cartItem) {
            const backCol = productElement.querySelector('.back_col');
            const quantitySpan = productElement.querySelector('.quantity-span');
            
            backCol.style.display = 'block';
            quantitySpan.textContent = `x${cartItem.quantity}`;
            quantitySpan.style.display = 'inline-block';
            console.log('Updated menu UI for item:', cartItem);
        }
    }

    // Update cart page UI if we're on the cart page
    if (document.getElementById('cart-items-list')) {
        const cartItem = cart.find(item => item.id === productId);
        const cartItemElement = document.getElementById(`cart-item-${productId}`);
        
        if (cartItemElement && cartItem) {
            const quantitySpan = cartItemElement.querySelector('.item-quantity');
            const subtotalSpan = cartItemElement.querySelector('.item-subtotal');
            
            if (quantitySpan) {
                quantitySpan.textContent = cartItem.quantity;
            }
            if (subtotalSpan) {
                subtotalSpan.textContent = (cartItem.price * cartItem.quantity).toFixed(2);
            }
            console.log('Updated cart UI for item:', cartItem);
        }
    }
}

// Menu page rendering
function renderMenu() {
    console.log('Rendering menu');
    const pizzaMenu = document.getElementById('pizza-menu');
    const sidesMenu = document.getElementById('sides-menu');
    const drinksMenu = document.getElementById('drinks-menu');

    function createProductHTML(product) {
        const cartItem = cart.find(item => item.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        
        return `
            <div class="col" id="pizza_col">
                <div class="box rounded-2">
                    <img src="${product.image}" class="rounded product_image" alt="${product.name}">
                    <div class="details">
                        <h2 class="product_name">${product.name}</h2>
                        <p class="description">${product.description}</p>
                        <h4 class="product_price">£${product.price}</h4>
                        <button class="btn btn-success add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                    </div>
                    <span class="quantity-span" style="display: ${quantity > 0 ? 'inline-block' : 'none'}">x${quantity}</span>
                    <div class="back_col" style="display: ${quantity > 0 ? 'block' : 'none'}"></div>
                </div>
            </div>
        `;
    }

    if (pizzaMenu) {
        pizzaMenu.innerHTML = pizzas.map(createProductHTML).join('');
    }
    if (sidesMenu) {
        sidesMenu.innerHTML = sides.map(createProductHTML).join('');
    }
    if (drinksMenu) {
        drinksMenu.innerHTML = drinks.map(createProductHTML).join('');
    }
}

// Cart page rendering
function renderCart() {
    console.log('Rendering cart');
    const cartItemsList = document.getElementById('cart-items-list');
    const totalPriceElement = document.getElementById('total-price');
    const clearCartButton = document.getElementById('clear-cart');
    const checkoutButton = document.getElementById('checkout-button');
    const totalPriceContainer = document.querySelector('.total_price');
    
    if (cartItemsList) {
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="p_cart">Your cart is empty.</p>';
            if (totalPriceElement) {
                totalPriceElement.textContent = '0.00';
            }
            // Hide elements when cart is empty
            if (clearCartButton) clearCartButton.style.display = 'none';
            if (checkoutButton) checkoutButton.style.display = 'none';
            if (totalPriceContainer) totalPriceContainer.style.display = 'none';
            console.log('Cart is empty');
            return;
        }

        // Show elements when cart has items
        if (clearCartButton) clearCartButton.style.display = 'inline-block';
        if (checkoutButton) checkoutButton.style.display = 'inline-block';
        if (totalPriceContainer) totalPriceContainer.style.display = 'block';

        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (totalPriceElement) {
            totalPriceElement.textContent = totalPrice.toFixed(2);
        }

        cartItemsList.innerHTML = cart.map(item => `
            <li class="list-group-item d-flex flex-wrap justify-content-between align-items-center" id="cart-item-${item.id}">
                <h2 class="cart_product_name">${item.name}</h2>
                <img src="${item.image}" class="rounded cart_image" alt="${item.name}">
                <p>Price: £${item.price}</p>
                <p>Quantity: <span class="item-quantity">${item.quantity}</span></p>
                <p>Subtotal: £<span class="item-subtotal">${(item.price * item.quantity).toFixed(2)}</span></p>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-success add-to-cart btn-sm" data-product-id="${item.id}">Add</button>
                    <button type="button" class="btn btn-danger remove-from-cart btn-sm" data-product-id="${item.id}">Remove</button>
                </div>
            </li>
        `).join('');

        // Add clear cart functionality
        if (clearCartButton) {
            clearCartButton.onclick = function() {
                cart = [];
                saveCart();
                renderCart();
            };
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    setActiveNavLink();
    initializeHamburgerMenu();
    updateCartCount();
    
    // Only run these if we're on the menu or cart page
    if (window.location.pathname.includes('menu')) {
        renderMenu();
    }
    if (window.location.pathname.includes('cart')) {
        renderCart();
        
        // Add checkout functionality
        const checkoutButton = document.getElementById('checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                cart = []; // Clear the cart
                saveCart(); // Save the empty cart
                window.location.href = 'success'; // Redirect to success page
            });
        }
    }

    // Event delegation for add-to-cart buttons
    document.body.addEventListener('click', (event) => {
        if (event.target.matches('.add-to-cart')) {
            event.preventDefault();
            const productId = event.target.getAttribute('data-product-id');
            const parsedProductId = isNaN(productId) ? productId : parseInt(productId);
            const allProducts = [...pizzas, ...sides, ...drinks];
            const product = allProducts.find(p => p.id === parsedProductId);

            if (product) {
                addToCart(product);
                if (window.location.pathname.includes('menu')) {
                    renderMenu();
                }
                if (window.location.pathname.includes('cart')) {
                    renderCart();
                }
            }
        }
        if (event.target.matches('.remove-from-cart')) {
            const productId = parseInt(event.target.getAttribute('data-product-id'));
            removeFromCart(productId);
            if (window.location.pathname.includes('cart')) {
                renderCart();
            }
        }
    });
});
