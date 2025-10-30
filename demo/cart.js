class ShoppingCart {
    constructor() {
        // internal storage for cart items (array of {id, name, price, image, quantity, ...})
        this._items = [];
        // hydrate from localStorage if present
        try {
            const raw = localStorage.getItem('cart');
            this._items = raw ? JSON.parse(raw) : [];
        } catch (err) {
            // if parse fails, start with an empty cart
            this._items = [];
            console.warn('Failed to parse saved cart, starting fresh.', err);
        }

        // ensure visible cart count is in sync
        this.updateCartCount();
    }

    // Add a product to cart; if present increments quantity
    addToCart(product) {
        // look for existing item by id
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i].id === product.id) {
                this._items[i].quantity = (this._items[i].quantity || 0) + 1;
                this._persist();
                this.updateCartCount();
                return;
            }
        }

        // not found — push a shallow clone with initial quantity
        const entry = Object.assign({}, product, { quantity: 1 });
        this._items.push(entry);

        this._persist();
        this.updateCartCount();
    }

    // Remove an item completely by productId
    removeFromCart(productId) {
        this._items = this._items.filter(i => i.id !== productId);
        this._persist();
        this.updateCartCount();
    }

    // Set quantity for an item; if quantity <= 0 the item is removed
    updateQuantity(productId, quantity) {
        const qty = Number(quantity) || 0;
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i].id === productId) {
                if (qty <= 0) {
                    // remove item
                    this._items.splice(i, 1);
                } else {
                    this._items[i].quantity = Math.floor(qty);
                }
                this._persist();
                this.updateCartCount();
                return;
            }
        }
        // if item not found, do nothing
    }

    // Compute the cart total (number)
    getTotal() {
        return this._items.reduce((sum, it) => {
            const price = Number(it.price) || 0;
            const qty = Number(it.quantity) || 0;
            return sum + (price * qty);
        }, 0);
    }

    // Return the raw cart array (for rendering)
    getCart() {
        return this._items;
    }

    // Empty the cart completely
    clearCart() {
        this._items = [];
        this._persist();
        this.updateCartCount();
    }

    // -------------------
    // Internal helpers
    // -------------------

    // Save current cart to localStorage
    _persist() {
        try {
            localStorage.setItem('cart', JSON.stringify(this._items));
        } catch (err) {
            console.error('Unable to save cart to localStorage', err);
        }
    }

    // Update the visual cart count element (.cart-count) if present
    updateCartCount() {
        const el = document.querySelector('.cart-count');
        if (!el) return;

        const totalItems = this._items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
        el.textContent = totalItems;
    }
}

// create a single global instance (keeps compatibility with existing code)
const cart = new ShoppingCart();