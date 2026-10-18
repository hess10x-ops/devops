
document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const productGrid = document.getElementById("productGrid");
    const productCards = [...document.querySelectorAll(".product-card")];
    const noResults = document.getElementById("noResults");
    const clearFilter = document.getElementById("clearFilter");

    const cartToggle = document.getElementById("cartToggle");
    const cartPanel = document.getElementById("cartPanel");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCart = document.getElementById("closeCart");
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const loginBtn = document.getElementById("loginBtn");

    // Shopping cart data
    const cart = new Map();
    let selectedCategory = "All";

    // Format prices in Indian Rupees
    function formatPrice(amount) {
        return "₹" + amount.toLocaleString("en-IN");
    }

    // Filter products using search and category
    function filterProducts() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        productCards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            const title = card.querySelector("h3").textContent.toLowerCase();
            const category = card.dataset.category;

            const matchesSearch =
                name.includes(searchTerm) ||
                title.includes(searchTerm) ||
                category.toLowerCase().includes(searchTerm);

            const matchesCategory =
                selectedCategory === "All" ||
                category === selectedCategory;

            const showProduct = matchesSearch && matchesCategory;

            card.hidden = !showProduct;

            if (showProduct) {
                visibleCount++;
            }
        });

        noResults.hidden = visibleCount !== 0;
    }

    searchInput.addEventListener("input", filterProducts);
    searchBtn.addEventListener("click", filterProducts);

    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            filterProducts();
            document.getElementById("products").scrollIntoView({
                behavior: "smooth"
            });
        }
    });

    // Category navigation
    document.querySelectorAll(".categories a").forEach(link => {
        link.addEventListener("click", () => {
            selectedCategory = link.dataset.category;
            filterProducts();
        });
    });

    // Reset search and category filters
    clearFilter.addEventListener("click", () => {
        searchInput.value = "";
        selectedCategory = "All";
        filterProducts();
    });

    // Add product to cart
    document.querySelectorAll(".add-btn").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.id;
            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            if (cart.has(id)) {
                cart.get(id).quantity++;
            } else {
                cart.set(id, {
                    id,
                    name,
                    price,
                    quantity: 1
                });
            }

            updateCart();

            // Brief visual feedback
            const originalText = button.textContent;
            button.textContent = "✓ Added to Cart";
            button.classList.add("added");

            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove("added");
            }, 900);
        });
    });

    // Update cart count, item list, and total
    function updateCart() {
        const items = [...cart.values()];

        const totalQuantity = items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const totalPrice = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        cartCount.textContent = totalQuantity;
        cartTotal.textContent = formatPrice(totalPrice);

        if (items.length === 0) {
            cartItems.innerHTML =
                '<p class="empty-cart">Your cart is empty. Start shopping!</p>';
            return;
        }

        // Create cart elements safely without injecting product names as HTML
        cartItems.replaceChildren();

        items.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";

            const details = document.createElement("div");
            details.className = "cart-item-details";

            const name = document.createElement("h3");
            name.textContent = item.name;

            const price = document.createElement("p");
            price.textContent = formatPrice(item.price * item.quantity);

            const controls = document.createElement("div");
            controls.className = "quantity-controls";

            const minusButton = document.createElement("button");
            minusButton.textContent = "−";
            minusButton.setAttribute("aria-label", "Decrease quantity");
            minusButton.addEventListener("click", () => {
                changeQuantity(item.id, -1);
            });

            const quantity = document.createElement("span");
            quantity.textContent = item.quantity;

            const plusButton = document.createElement("button");
            plusButton.textContent = "+";
            plusButton.setAttribute("aria-label", "Increase quantity");
            plusButton.addEventListener("click", () => {
                changeQuantity(item.id, 1);
            });

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.className = "remove-btn";
            removeButton.addEventListener("click", () => {
                cart.delete(item.id);
                updateCart();
            });

            controls.append(
                minusButton,
                quantity,
                plusButton,
                removeButton
            );

            details.append(name, price, controls);
            cartItem.append(details);
            cartItems.append(cartItem);
        });
    }

    // Change item quantity
    function changeQuantity(id, change) {
        const item = cart.get(id);

        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            cart.delete(id);
        }

        updateCart();
    }

    // Open and close shopping cart
    function openCart() {
        cartPanel.classList.add("open");
        cartOverlay.classList.add("open");
        cartPanel.setAttribute("aria-hidden", "false");
        closeCart.focus();
    }

    function hideCart() {
        cartPanel.classList.remove("open");
        cartOverlay.classList.remove("open");
        cartPanel.setAttribute("aria-hidden", "true");
        cartToggle.focus();
    }

    cartToggle.addEventListener("click", openCart);
    closeCart.addEventListener("click", hideCart);
    cartOverlay.addEventListener("click", hideCart);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" &&
            cartPanel.classList.contains("open")) {
            hideCart();
        }
    });

    // Demo login button
    loginBtn.addEventListener("click", () => {
        alert(
            "Welcome to the shopping demo!\n\n" +
            "Real user registration and login are not connected."
        );
    });

    // Demo checkout
    checkoutBtn.addEventListener("click", () => {
        if (cart.size === 0) {
            alert("Your cart is empty. Please add a product first.");
            return;
        }

        const items = [...cart.values()];
        const total = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        alert(
            "Order Summary\n\n" +
            items.map(item =>
                `${item.name} × ${item.quantity}`
            ).join("\n") +
            "\n\nTotal: " + formatPrice(total) +
            "\n\nThis is a demo. No order or payment was processed."
        );
    });

    // Initial render
    updateCart();
    filterProducts();
});
