// const contentful = require("contentful");
// const client = contentful.createClient({
//     // This is the space ID. A space is like a project folder in Contentful terms
//     space: "mmpw3tzd8zsb",
//     // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
//     accessToken: "tk4Ltw8yJEjaLa8uzR8cajhE-OTYsqJGq92BI1z5iA0"
// });
//
// console.log(client);

//variables///
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn=document.querySelector('.close-cart');
const clearCartBtn=document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector(".cart-content");
const productDOM = document.querySelector(".products-center");

// cart
let cart = [];
//buttons
let buttonsDoOM= [];

//getting the products
class Products {
    async getProducts(){
        try{
            // let contentful = await client.getEntries({
            //     content_type: "comfyHouseProducts"
            // });
            // console.log(contentful);
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            //activate content ful !
            //let products = contentful.items;
            products = products.map((item) =>{
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image}
            });
            return products;
        }catch (e) {
            console.log(e);
        }
    }
}

//display products
class UI{
    displayProducts(products){
        console.log(products);
        let result = "";
        products.forEach(product =>{
           result +=
               "            <article class=\"product\">\n" +
               "                <div class=\"img-container\">\n" +
               "                    <img src=\""+product.image+"\" alt=\"product\"\n" +
               "                    class=\"product-img\">\n" +
               "                    <button class=\"bag-btn\" data-id=\""+product.id+"\">\n" +
               "                        <i class=\"fa fa-shopping-cart\">add to bag</i>\n" +
               "                    </button>\n" +
               "                </div>\n" +
               "                <h3>"+product.title+"</h3>\n" +
               "                <h4>$ "+product.price+"</h4>\n" +
               "            </article>";
        });
        productDOM.innerHTML = result;
    }

    getBagButtons() {
        const buttons =[...document.querySelectorAll('.bag-btn')];
        buttons.forEach((btn)=>{
            buttonsDoOM = buttons;
            let id = btn.dataset.id;
            let inCart = cart.find(item=>item.id === id);
            if(inCart){
                btn.innerText = "In Cart";
                btn.disabled = true;
            }

            btn.addEventListener('click', (e)=>{
                e.target.innerText = "In Cart";
                e.target.disabled = true;
                //get product from products
                let cartItem = {...Storage.getProduct(id), amount:1};
                //add product to the cart
                cart = [...cart, cartItem];
                //save cart in local storage
                Storage.saveCart(cart);
                //set cart value
                this.setCartValues(cart);
                //display cart item
                this.addCartItem(cartItem);
                // and show the cart
                this.showCart();

            })

        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item=>{
           tempTotal += item.price * item.amount;
           itemsTotal += item.amount;
        });
        cartTotal.innerHTML = parseFloat(tempTotal.toFixed(2));
        cartItems.innerHTML = itemsTotal;
    }

    addCartItem(item){
        const  div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = "<img src=\""+item.image+"\" alt=\"product\">\n" +
            "                            <div>\n" +
            "                                <h4>"+item.title+"</h4>\n" +
            "                                <h4>$ "+item.price+"</h4>\n" +
            "                                <span class=\"remove-item\" data-id=\""+item.id+"\" >remove</span>\n" +
            "                            </div>\n" +
            "                            <div>\n" +
            "                                <i class=\"fa fa-chevron-up\" data-id=\""+item.id+"\"></i>\n" +
            "                                <p class=\"item-amount\">"+item.amount+"</p>\n" +
            "                                <i class=\"fa fa-chevron-down\" data-id=\""+item.id+"\"></i>\n" +
            "                            </div>";
        cartContent.appendChild(div);
        console.log(cartContent);
    }

    setApp(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populate(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populate(cart) {
        cart.forEach(item=>{
            this.addCartItem(item);
        })
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add("showCart");
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove("showCart");
    }

    cartLogic() {
        //clear cart button
        clearCartBtn.addEventListener('click', ()=>{
            this.clearCart();
        });

        //cart functionality
        cartContent.addEventListener('click', e=>{
            if(e.target.classList.contains('remove-item')){
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if(e.target.classList.contains('fa-chevron-up')){
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item=>item.id===id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerHTML = tempItem.amount;
            }else if(e.target.classList.contains('fa-chevron-down')){
                let lowerAmount = e.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item=>item.id===id);
                tempItem.amount -= 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerHTML = tempItem.amount;
                }else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        })
    }

    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }

        this.hideCart();
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = '<i class="fa fa-shopping-cart">add to cart</i>';
    }

    getSingleButton(id) {
        return buttonsDoOM.find(button => button.dataset.id === id);
    }
}

//local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    };

    static getProduct(id){
        let product = JSON.parse(localStorage.getItem('products'));
        return product.find(product=>product.id === id);

    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() {

        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const products = new Products();
    //setup app
    ui.setApp();
    //get al products
    products.getProducts().then(products=>
        {ui.displayProducts(products);
        Storage.saveProducts(products);
        }).then(()=>{
            ui.getBagButtons();
            ui.cartLogic();
    });
});


