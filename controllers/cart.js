let cart = null;


module.exports = class Cart{
    static save(product){
        //Check if the cart is empty or not
        if(cart){
            //cart is not null
        const existingProductIndex = cart.products.findIndex(p => p.id ==product._id)

        if(existingProductIndex >= 0){
        //product Exists already
        const existingProduct = cart.products[existingProductIndex]
    //    const existingQuantity = existingProduct.qty
        existingProduct.qty += 1
        

        cart.totalPrice += parseInt(product.price)
        }
        else{
            //not Exist
            product.qty = 1;
            cart.products.push(product);
            cart.totalPrice += parseInt(product.price)
        }

        }
        else{
            cart= {products:[],totalPrice: 0};
             //Checking the Quantity
            product.qty = 1;
            cart.products.push(product);
            cart.totalPrice = parseInt(product.price)
        }
    }
    static getCart(){
        return cart
    }


    static delete(productId,productPrice){
        const isExisting = cart.products.findIndex(p => p._id == productId);
        if(isExisting >= 0){
            cart.products.splice(isExisting, 1);
            cart.totalPrice = cart.totalPrice - (productPrice)
        }
    }
}