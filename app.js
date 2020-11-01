const client = contentful.createClient({
    space: "945gf2949p4t",
    accessToken: "08n9AqUYA3kXQOHm7LizNBzOJKkqRabjuDJVATm84qo"
});
//variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];
//buttons
let buttonsDOM = [];

// getting the products
class Products {
    async getProducts() {
        try {

            let contentful = await client.getEntries({
                content_type: 'comfyHouseProducts'
            });

            // !data from local JSON file
            // let result = await fetch("products.json");
            // let data = await result.json();

            let products = contentful.items;
            products = products.map(item => {
                const {
                    title,
                    price
                } = item.fields;
                const {
                    id
                } = item.sys;
                const image = item.fields.image.fields.file.url;
                return {
                    title,
                    price,
                    id,
                    image
                };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}
// display products
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `
     <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
            <ion-icon name="cart-outline"></ion-icon>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!--end of single product -->
     `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener("click", event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get product from products
                let cartItem = {
                    ...Storage.getProduct(id),
                    amount: 1
                };
                // add product to the cart
                cart = [...cart, cartItem];
                //save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
            });
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;

    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = ` <img src="${item.image}" alt="cart-product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id='${item.id}'>remove</span>
        </div>
        <div>
            <ion-icon name="chevron-up-outline" class="fa-chevron-up" data-id='${item.id} '></ion-icon>
            <p class="item-amount">${item.amount}</p>
            <ion-icon name="chevron-down-outline" class="fa-chevron-down" data-id='${item.id}'></ion-icon>
        </div>`;
        cartContent.appendChild(div);
    }

    showCart() {
        cartDOM.classList.add('showCart');
        cartOverlay.classList.add('transparentBcg');
    };

    hideCart() {
        cartDOM.classList.remove('showCart');
        cartOverlay.classList.remove('transparentBcg');
    };

    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);

        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart)
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    };

    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });


        cartContent.addEventListener('click', e => {
            if (e.target.classList.contains('remove-item')) {
                let removeItem = e.target;
                let id = e.target.dataset.id
                this.removeItem(id);
                cartContent.removeChild(removeItem.parentElement.parentElement);
            }
            if (e.target.classList.contains('fa-chevron-up')) {
                let addAmount = e.target;
                let idItem = addAmount.dataset.id;
                let tempAmount;
                for (let i = 0; i < cart.length; i++) {
                    let newId = (cart[i].id);
                    if (parseFloat(idItem) === parseFloat(newId)) {
                        cart[i].amount = cart[i].amount + 1
                        tempAmount = cart[i].amount;
                        console.log(cart);
                    }
                }
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempAmount;
            }

            if (e.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = e.target;
                let idItem = lowerAmount.dataset.id;
                let tempAmount;
                for (let i = 0; i < cart.length; i++) {
                    let newId = (cart[i].id);
                    if (parseFloat(idItem) === parseFloat(newId)) {
                        cart[i].amount = cart[i].amount - 1
                        tempAmount = cart[i].amount;
                    }
                }
                if (tempAmount > 0) {

                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempAmount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(idItem)
                }
            }
        })
    };

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }

        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<ion-icon name="cart-outline"></ion-icon>Add To Cart`;
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
//local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    ui.setupAPP();
    // get all products
    products
        .getProducts()
        .then(products => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getBagButtons();
            ui.cartLogic();
        });
});