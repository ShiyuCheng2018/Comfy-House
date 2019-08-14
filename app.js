//variables
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

//getting the products
class Products {
    async getProducts(){
        try{
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
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
        const btns =[ document.querySelectorAll('.bag-btn')];

    }
}

//local storage
class Storage{
    static saveproducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    };
}

document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const products = new Products();

    //get al products
    products.getProducts().then(products=>
        {ui.displayProducts(products);
        Storage.saveproducts(products);
        }).then(()=>{
            ui.getBagButtons();
    });


});


