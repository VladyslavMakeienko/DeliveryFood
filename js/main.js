'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.rating');
const minPrice = document.querySelector('.price');
const category = document.querySelector('.category');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('MVS');

const cart = [];

const loadCart = () => {
    if (localStorage.getItem(login)) {
        JSON.parse(localStorage.getItem(login)).forEach((item) => {
            cart.push(item);
        });
    }
};

const saveCart = () => {
    localStorage.setItem(login, JSON.stringify(cart));
};

const getData = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка по адресу ${url}, 
        статус ошибка ${response.status}!`);
    }
    return await response.json();
};

const toggleModal = () => {
    modal.classList.toggle("is-open");
};

const toggleModalAuth = () => {
    modalAuth.classList.toggle('is-open');
};

const returnMain = () => {
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
};

const authorized = () => {

    const logOut = () => {
        login = null;
        cart.length = 0;
        localStorage.removeItem('MVS');
        buttonAuth.style.display = '';
        userName.style.display = '';
        buttonOut.style.display = '';
        cartButton.style.display = '';
        buttonOut.removeEventListener('click', logOut);
        checkAuth();
        returnMain()
    };

    userName.textContent = login;
    buttonAuth.style.display = 'none';
    userName.style.display = 'inline';
    buttonOut.style.display = 'flex';
    cartButton.style.display = 'flex';
    buttonOut.addEventListener('click', logOut);
    loadCart();
};

const notAuthorized = () => {

    const logIn = (event) => {
        event.preventDefault();
        if (loginInput.value) {
            loginInput.style.borderColor = '';
            login = loginInput.value;
            localStorage.setItem('MVS', login);
            toggleModalAuth();
            buttonAuth.removeEventListener('click', toggleModalAuth);
            closeAuth.removeEventListener('click', toggleModalAuth);
            logInForm.removeEventListener('submit', logIn);
            logInForm.reset();
            checkAuth();
        } else {
            loginInput.style.borderColor = 'red';
        }
    };

    buttonAuth.addEventListener('click', toggleModalAuth);
    closeAuth.addEventListener('click', toggleModalAuth);
    logInForm.addEventListener('submit', logIn);
};

const checkAuth = () => {
    login ? authorized() : notAuthorized();
};

const createCardRestaurant = (restaurant) => {
    const {
        image,
        kitchen,
        name,
        price,
        stars,
        products,
        time_of_delivery: timeOfDelivery
    } = restaurant;

    const card = ` <a class="card card-restaurant" 
                      data-products="${products}"
                      data-info="${[name, stars, price, kitchen]}">
                    <img src="${image}" alt="image" class="card-image"/>
                    <div class="card-text">
                        <div class="card-heading">
                            <h3 class="card-title">${name}</h3>
                            <span class="card-tag tag">${timeOfDelivery} мин</span>
                        </div>
                        <div class="card-info">
                            <div class="rating">
                                ${stars}
                            </div>
                            <div class="price">От ${price} ₴</div>
                            <div class="category">${kitchen}</div>
                        </div>
                    </div>
                </a> 
            `;

    cardsRestaurants.insertAdjacentHTML('beforeend', card);
};

const createCardGood = (goods) => {

    const {
        description,
        image,
        name,
        price,
        id
    } = goods;

    const card = document.createElement('div');
    card.className = 'card';
    card.insertAdjacentHTML('beforeend', `
                    <img src="${image}" alt="image" class="card-image"/>
                    <div class="card-text">
                        <div class="card-heading">
                            <h3 class="card-title card-title-reg">${name}</h3>
                        </div>
                        <div class="card-info">
                            <div class="ingredients">${description}</div>
                        </div>
                        <div class="card-buttons">
                            <button class="button button-primary button-add-cart" id="${id}">
                                <span class="button-card-text">В корзину</span>
                                <span class="button-cart-svg"></span>
                            </button>
                            <strong class="card-price card-price-bold">${price} ₴</strong>
                        </div>
                    </div>
                </div> 
`);
    cardsMenu.insertAdjacentElement('beforeend', card);
};

const openGoods = (event) => {
    const target = event.target;

    if (login) {
        const restaurant = target.closest('.card-restaurant');

        if (restaurant) {
            const info = restaurant.dataset.info;
            const [name, stars, price, kitchen] = info.split(',');

            cardsMenu.textContent = '';
            containerPromo.classList.add('hide');
            restaurants.classList.add('hide');
            menu.classList.remove('hide');

            restaurantTitle.textContent = name;
            rating.textContent = stars;
            minPrice.textContent = `От ${price} ₴`;
            category.textContent = kitchen;

            getData(`./db/${restaurant.dataset.products}`)
                .then((data) => {
                    data.forEach(createCardGood);
                });
        }
    } else {
        toggleModalAuth();
    }
};

const addToCart = (event) => {
    const target = event.target;
    const buttonAddToCart = target.closest('.button-add-cart');

    if (buttonAddToCart) {
        const card = target.closest('.card');
        const title = card.querySelector('.card-title-reg').textContent;
        const cost = card.querySelector('.card-price').textContent;
        const id = buttonAddToCart.id;

        const food = cart.find((item) =>  item.id === id);

        if (food) {
            food.count += 1;
        } else {
            cart.push({
                id,
                title,
                cost,
                count: 1
            });
        }
    }
    saveCart();
};

const renderCart = () => {
    modalBody.textContent = '';

    cart.forEach(({id, title, cost, count}) => {
        const itemCart = ` <div class="food-row">
                <span class="food-name">${title}</span>
                <strong class="food-price">${cost}</strong>
                <div class="food-counter">
                    <button class="counter-button counter-minus" data-id="${id}">-</button>
                    <span class="counter">${count}</span>
                    <button class="counter-button counter-plus" data-id="${id}">+</button>
                </div>
            </div>
           `;

        modalBody.insertAdjacentHTML('beforeend', itemCart);
    });

    const totalPrice = cart.reduce((result, item) => {
        return result + (parseFloat(item.cost) * item.count);
    }, 0);

    modalPrice.textContent = totalPrice + ' ₴';
};

const changeCount = (event) => {
    const target = event.target;
    if (target.classList.contains('counter-button')) {
        const food = cart.find((item) => {
            return item.id === target.dataset.id;
        });
        if (target.classList.contains('counter-minus')) {
            food.count--;
            if (food.count === 0) {
                cart.splice(cart.indexOf(food), 1);
            }
        }
        if (target.classList.contains('counter-plus')) {
            food.count++;
        }
        renderCart();
    }
    saveCart();
};

function init() {
    getData('./db/partners.json').then((data) => {
        data.forEach(createCardRestaurant);
    });

    cartButton.addEventListener("click", renderCart);
    cartButton.addEventListener("click", toggleModal);

    buttonClearCart.addEventListener('click', () => {
        cart.length = 0;
        renderCart();
    });

    modalBody.addEventListener('click', changeCount);

    cardsMenu.addEventListener('click', addToCart);

    close.addEventListener("click", toggleModal);

    cardsRestaurants.addEventListener('click', openGoods);

    logo.addEventListener('click', returnMain);

    checkAuth();

    new Swiper('.swiper-container', {
        loop: true,
        slidesPerView: 1,
        autoplay: {
            delay: 3000
        }
    });
}

init();