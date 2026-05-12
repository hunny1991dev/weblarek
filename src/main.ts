import './scss/styles.scss';
import { Api } from './components/base/Api';
import { WebLarekApi } from './components/WebLarekApi';
import { EventEmitter } from './components/base/Events';
import { Products } from './components/Models/Products';
import { Basket } from './components/Models/Basket';
import { Order } from './components/Models/Order';
import { API_URL } from './utils/constants';
import { IProduct } from './types';

// Импорты компонентов
import { Header } from './components/views/Header';
import { Gallery } from './components/views/Gallery';
import { Modal } from './components/views/Modal';
import { CardCatalog } from './components/views/CardCatalog';
import { CardPreview } from './components/views/CardPreview';
import { BasketView } from './components/views/BasketView';
import { CardBasket } from './components/views/CardBasket';
import { OrderForm } from './components/views/OrderForm';
import { ContactsForm } from './components/views/ContactsForm';
import { Success } from './components/views/Success';
import { cloneTemplate } from './utils/utils';

// ИНИЦИАЛИЗАЦИЯ
const events = new EventEmitter();

const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

const productsModel = new Products(events);
const basketModel = new Basket(events);
const orderModel = new Order(events);

// КОМПОНЕНТЫ ПРЕДСТАВЛЕНИЯ
const headerContainer = document.querySelector('.header') as HTMLElement;
const galleryContainer = document.querySelector('.gallery') as HTMLElement;
const modalContainer = document.querySelector('#modal-container') as HTMLElement;

const header = new Header(events, headerContainer);
const gallery = new Gallery(galleryContainer);
const modal = new Modal(events, modalContainer);

// Шаблоны
const cardCatalogTemplate = document.querySelector('#card-catalog') as HTMLTemplateElement;
const cardPreviewTemplate = document.querySelector('#card-preview') as HTMLTemplateElement;
const cardBasketTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;
const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
const orderTemplate = document.querySelector('#order') as HTMLTemplateElement;
const contactsTemplate = document.querySelector('#contacts') as HTMLTemplateElement;
const successTemplate = document.querySelector('#success') as HTMLTemplateElement;

// Компоненты, которые будут переиспользоваться
const basketView = new BasketView(events, cloneTemplate(basketTemplate));
basketView.items = [];

const orderForm = new OrderForm(events, cloneTemplate(orderTemplate) as HTMLFormElement);
const contactsForm = new ContactsForm(events, cloneTemplate(contactsTemplate) as HTMLFormElement);
const successView = new Success(events, cloneTemplate(successTemplate));
const cardPreview = new CardPreview(events, cloneTemplate(cardPreviewTemplate), {
    onButtonClick: () => {
        events.emit('card:preview:button-click');
    }
});

// ЗАГРУЗКА ТОВАРОВ
webLarekApi.getProducts()
    .then(data => {
        productsModel.setItems(data.items);
    })
    .catch(error => {
        console.error('Ошибка загрузки товаров:', error);
    });

// ОБРАБОТЧИКИ СОБЫТИЙ ОТ МОДЕЛЕЙ
// 1. Отрисовка каталога после загрузки
events.on('products:loaded', () => {
    const items = productsModel.getItems();
    const cards = items.map(product => {
        const card = new CardCatalog(events, cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', product)
        });
        card.title = product.title;
        card.price = product.price;
        card.category = product.category;
        card.image = product.image;
        return card.render();
    });
    gallery.catalog = cards;
});

// 2. Открытие модалки с деталями товара после выбора в модели
events.on('products:selected', () => {
    const product = productsModel.getSelectedItem();
    if (!product) return;
    
    cardPreview.render({
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image,
        buttonState: {
            text: product.price === null ? 'Недоступно' : (basketModel.hasItem(product.id) ? 'Удалить из корзины' : 'Купить'),
            disabled: product.price === null
        }
    });
    
    modal.render({ content: cardPreview.render() });
});

// 3. Обновление счётчика корзины и перерисовка корзины
events.on('basket:changed', () => {
    header.counter = basketModel.getCount();
    updateBasketView();
});

// 4. Открытие корзины
events.on('basket:open', () => {
    modal.render({ content: basketView.render() });
});

// 5. Обновление форм при изменении данных заказа
events.on('order:changed', () => {
    const buyerData = orderModel.getBuyerData();
    orderForm.render({
        payment: buyerData.payment,
        address: buyerData.address
    });

    contactsForm.render({
        email: buyerData.email,
        phone: buyerData.phone
    });

    const errors = orderModel.validate();
    orderForm.valid = !errors.payment && !errors.address;
    contactsForm.valid = !errors.email && !errors.phone;

    orderForm.errors = [errors.payment, errors.address].filter((msg): msg is string => Boolean(msg));
    contactsForm.errors = [errors.email, errors.phone].filter((msg): msg is string => Boolean(msg));
});

// 6. Обработчик успешного заказа
events.on('order:submit', () => {
    modal.render({ content: contactsForm.render() });
});

// 7. Отправка заказа
events.on('contacts:submit', () => {
    const orderData = {
        ...orderModel.getBuyerData(),
        total: basketModel.getTotal(),
        items: basketModel.getItems().map(item => item.id)
    };
    
    webLarekApi.createOrder(orderData)
        .then(result => {
            basketModel.clear();
            orderModel.clear();
            successView.total = result.total;
            modal.render({ content: successView.render() });
        })
        .catch(error => {
            console.error('Ошибка оформления заказа:', error);
            contactsForm.errors = ['Ошибка оформления заказа. Попробуйте позже.'];
        });
});

// Вспомогательные функции обновления валидации
function updateBasketView() {
    const items = basketModel.getItems();  
    const basketCards = items.map((product, index) => {
        const card = new CardBasket(events, cloneTemplate(cardBasketTemplate), {
            onDelete: () => {
                basketModel.removeItem(product.id);
            }
        });
        card.index = index + 1;
        card.title = product.title;
        card.price = product.price;
        return card.render();
    });
    
    basketView.items = basketCards;
    basketView.total = basketModel.getTotal();
}

// ОБРАБОТЧИКИ СОБЫТИЙ ОТ ПРЕДСТАВЛЕНИЯ
events.on('card:select', (product: IProduct) => {
    productsModel.setSelectedItem(product);
});

events.on('basket:submit', () => {
    orderModel.clear();
    modal.render({ content: orderForm.render() });
});

events.on('card:preview:button-click', () => {
    const product = productsModel.getSelectedItem();
    if (!product) return;
    
    if (basketModel.hasItem(product.id)) {
        basketModel.removeItem(product.id);
    } else {
        basketModel.addItem(product);
    }
    modal.close();
});

const closeModal = () => modal.close();
events.on('success:close', closeModal);
events.on('modal:close', closeModal);

// ОБРАБОТЧИКИ СОБЫТИЙ ОТ ФОРМ
events.on('order:payment:select', (data: { payment: 'card' | 'cash' }) => {
    orderModel.setPayment(data.payment);
});

events.on('order:address:change', (data: { address: string }) => {
    orderModel.setAddress(data.address);
});

events.on('contacts:email:change', (data: { email: string }) => {
    orderModel.setEmail(data.email);
});

events.on('contacts:phone:change', (data: { phone: string }) => {
    orderModel.setPhone(data.phone);
});