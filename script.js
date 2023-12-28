window.onload = function () {
    document.documentElement.classList.add('loaded');

    if (document.querySelector('.product_slider')) {
        new Swiper('.product_slider', {
            loop: true,
            direction: 'horizontal',
            slidesPerView: 1,
            spaceBetween: 30,
            speed: 1000,
            parallax: true,
            mouseWheel: true,
            keyboard: {
                enabled: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                init: function () {
                    console.log('initiated');
                },
            },
        });
    }

    const cart = document.querySelector('.header_cart');
    const cartValue = document.querySelector('.header_cart span');
    const sideMenu = document.querySelector('.side-menu .cart-content');
    const totalDisplay = document.getElementById('amt');
    const emptyCartMsg = document.getElementById('emptyCartMsg');
    const speedAnimation = 1000;

    let totalAmount = 0;

    document.addEventListener('click', function (e) {
        const targetElement = e.target;

        if (targetElement.classList.contains('product_buy')) {
            const productSlide = targetElement.closest('.product_slide');
            const productTitle = productSlide.querySelector('.product_title').textContent;
            const productPrice = parseFloat(productSlide.querySelector('.product_price').textContent.replace('Rs.', ''));
            const productImageSrc = productSlide.querySelector('.product_picture').src;

            const existingCartItem = findCartItem(productTitle);

            if (existingCartItem) {
                incrementCartItem(existingCartItem);
            } else {
                addToCart(productTitle, productPrice, productImageSrc);
            }

            const isEmptyCart = sideMenu.childElementCount === 0;

            if (isEmptyCart) {
                const initialText = sideMenu.querySelector('p');
                if (initialText) {
                    emptyCartMsg.style.display = 'block';
                }
            }

            const cartPos = {
                left: sideMenu.getBoundingClientRect().left,
                top: sideMenu.getBoundingClientRect().top,
            };

            const productImage = productSlide.querySelector('.product_picture');
            const productImageFly = productImage.cloneNode(true);

            productImageFly.style.cssText = `
                position: fixed;
                left: ${productImage.getBoundingClientRect().left}px;
                top: ${productImage.getBoundingClientRect().top}px;
                width: ${productImage.offsetWidth}px;
                height: ${productImage.offsetHeight}px;
                transition: all ${speedAnimation}ms ease;
            `;

            document.body.append(productImageFly);

            setTimeout(() => {
                productImageFly.style.left = `${cartPos.left}px`;
                productImageFly.style.top = `${cartPos.top}px`;
                productImageFly.style.width = `0px`;
                productImageFly.style.height = `0px`;
                productImageFly.style.opacity = `0.5`;
            }, 0);

            totalAmount += productPrice;

            cartValue.innerHTML = parseInt(cartValue.innerHTML, 10) + 1;
            totalDisplay.innerHTML = `Rs.${totalAmount.toFixed(2)}`;

            initializeQuantityButtons();
        } else if (targetElement.classList.contains('remove-item')) {
            const cartItem = targetElement.closest('p');
        
            if (cartItem) {
                const removedPrice = parseFloat(cartItem.querySelector('.cart-item-price').textContent.replace('Rs.', ''));
                const removedQuantity = parseInt(cartItem.querySelector('.quantity').textContent, 10);
        
                cartItem.parentNode.removeChild(cartItem);
        
                totalAmount -= removedPrice * removedQuantity;
        
                cartValue.innerHTML = sideMenu.childElementCount;
                totalDisplay.innerHTML = `Rs.${totalAmount.toFixed(2)}`;
        
                if (sideMenu.childElementCount === 0) {
                    const initialText = document.createElement('p');
                    initialText.textContent = 'Your cart is empty.';
                    sideMenu.appendChild(initialText);
                    emptyCartMsg.style.display = 'none';
                }
            }
        }
        
        
    });

    function findCartItem(productTitle) {
        return Array.from(sideMenu.querySelectorAll('.cart-item-title')).find(title => title.textContent === productTitle);
    }

    function incrementCartItem(cartItemTitle) {
        const cartItem = findCartItem(cartItemTitle);
        const quantityElement = cartItem.closest('p').querySelector('.quantity');
        const quantity = parseInt(quantityElement.textContent, 10);
        quantityElement.textContent = quantity + 1;

        updateCartItemTotal(cartItem.closest('p'));
    }

    function addToCart(productTitle, productPrice, productImageSrc) {
        const cartItem = document.createElement('div');
        const quantity = 1; // Each new item starts with a quantity of 1
    
        cartItem.innerHTML = `
            <p>
                <img src="${productImageSrc}" alt="Product Image" class="cart-item-image">
                <span class="cart-item-details">
                    <span class="cart-item-title">${productTitle}</span>
                    <span class="cart-item-price">Rs.${productPrice.toFixed(2)}</span>
                </span>
                <span class="quantity-group">
                    <button class="btn btn-primary">-</button>
                    <span class="quantity" style="fone-size:1.5rem;">${quantity}</span>
                    <button class="btn btn-primary">+</button>
                </span>
                <span class="cart-item-total">Rs.${productPrice.toFixed(2)}</span>
                <button class="remove-item">Remove</button>
            </p>
        `;
    
        sideMenu.appendChild(cartItem);
        
        // Attach initializeQuantityButtons only once for each new item
        const quantityButtons = cartItem.querySelectorAll('.quantity-group button');
        quantityButtons.forEach(button => {
            button.addEventListener('click', function () {
                const cartItem = this.closest('p');
                const quantityElement = cartItem.querySelector('.quantity');
                const quantity = parseInt(quantityElement.textContent, 10);
    
                if (this.textContent === '-') {
                    const newQuantity = Math.max(0, quantity - 1);
                    quantityElement.textContent = newQuantity;
                    updateCartItemTotal(cartItem);
                } else if (this.textContent === '+') {
                    const newQuantity = quantity + 1;
                    quantityElement.textContent = newQuantity;
                    updateCartItemTotal(cartItem);
                }
            });
        });
    }
    
    
    function updateCartItemTotal(cartItem) {
    const quantityElement = cartItem.querySelector('.quantity');
    const quantity = parseInt(quantityElement.textContent, 10);
    const price = parseFloat(cartItem.querySelector('.cart-item-price').textContent.replace('Rs.', ''));
    const total = quantity * price;

    cartItem.querySelector('.cart-item-total').textContent = `Rs.${total.toFixed(2)}`;

    if (quantity === 0) {
        sideMenu.removeChild(cartItem.parentElement);
    }

    const cartValue = document.querySelector('.header_cart span');
    cartValue.innerHTML = sideMenu.childElementCount;

    const totalDisplay = document.getElementById('amt');
    const totalAmount = Array.from(document.querySelectorAll('.cart-item-total'))
        .reduce((sum, cartItem) => sum + parseFloat(cartItem.textContent.replace('Rs.', '')), 0);

    totalDisplay.innerHTML = `Rs.${totalAmount.toFixed(2)}`;

    if (sideMenu.childElementCount === 0) {
        const emptyCartMsg = document.getElementById('emptyCartMsg');
        emptyCartMsg.style.display = 'block';
    }
}

};
