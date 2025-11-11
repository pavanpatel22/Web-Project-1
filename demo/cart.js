class ShoppingCart {
    constructor() {
        // internal storage for cart items (array of {id, name, price, image, quantity, ...})
        this._items = [];

        // load existing cart data from localStorage
        const stored = localStorage.getItem('cart');
        if (stored) {
            try {
                this._items = JSON.parse(stored) || [];
            } catch (e) {
                console.warn('Corrupted cart data, resetting cart.', e);
                this._items = [];
            }
        }

        // sync the cart badge or counter
        this.updateCartCount();
    }

    // Add product to cart (if exists, increment quantity)
    addToCart(product) {
        const existing = this._items.find(it => it.id === product.id);

        if (existing) {
            existing.quantity = (existing.quantity || 0) + 1;
        } else {
            const copy = { ...product, quantity: 1 };
            this._items.push(copy);
        }

        this._persist();
        this.updateCartCount();
    }

    // Remove product completely by ID
    removeFromCart(productId) {
        const before = this._items.length;
        this._items = this._items.filter(item => item.id !== productId);

        if (this._items.length !== before) {
            this._persist();
            this.updateCartCount();
        }
    }

    // Update quantity of a specific product
    updateQuantity(productId, quantity) {
        const newQty = parseInt(quantity, 10) || 0;
        const target = this._items.find(item => item.id === productId);

        if (!target) return;

        if (newQty <= 0) {
            // remove item if zero or less
            this._items = this._items.filter(item => item.id !== productId);
        } else {
            target.quantity = newQty;
        }

        this._persist();
        this.updateCartCount();
    }

    // Calculate the total cost of all cart items
    getTotal() {
        return this._items.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const qty = parseInt(item.quantity, 10) || 0;
            return sum + (price * qty);
        }, 0);
    }

    // Return array of cart items
    getCart() {
        return this._items;
    }

    // Clear entire cart
    clearCart() {
        if (!this._items.length) return;
        this._items = [];
        this._persist();
        this.updateCartCount();
    }

    // ---------------------
    // Internal helpers
    // ---------------------

    // Save cart to localStorage
    _persist() {
        try {
            localStorage.setItem('cart', JSON.stringify(this._items));
        } catch (err) {
            console.error('Error saving cart:', err);
        }
    }

    // Update visible cart counter (.bag_count)
    updateCartCount() {
        const counter = document.querySelector('.bag_count');
        if (!counter) return;

        const total = this._items.reduce((acc, item) => {
            const q = parseInt(item.quantity, 10) || 0;
            return acc + q;
        }, 0);

        counter.textContent = total;
    }
}

// single instance for global use
const cart = new ShoppingCart();
