class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        return this.cart.length;
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart();
                this.updateCartCount();
            }
        }
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCart() {
        return this.cart;
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        if (cartCountElements.length > 0) {
            const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElements.forEach(element => {
                element.textContent = totalItems;
            });
        }
    }
}

// Global cart instance
const cart = new ShoppingCart();