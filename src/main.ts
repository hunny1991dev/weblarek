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

// ЗАГРУЗКА ТОВАРОВ
webLarekApi.getProducts()
    .then(data => {
        productsModel.setItems(data.items);
    })
    .catch(error => {
        console.error('Ошибка загрузки товаров:', error);
    });

//ОБРАБОТЧИКИ СОБЫТИЙ

// Флаги для предотвращения повторного открытия
let isOrderFormOpen = false;
let isContactsFormOpen = false;

// Отрисовка каталога
events.on('products:loaded', (items: IProduct[]) => {
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

// Открытие модалки с деталями товара
events.on('card:select', (product: IProduct) => {
    const previewCard = new CardPreview(events, cloneTemplate(cardPreviewTemplate), {
        onButtonClick: () => {
            if (basketModel.hasItem(product.id)) {
                events.emit('card:remove', product);
            } else {
                events.emit('card:add', product);
            }
            modal.close();
        }
    });
    
    previewCard.title = product.title;
    previewCard.price = product.price;
    previewCard.description = product.description;
    previewCard.category = product.category;
    previewCard.image = product.image;
    previewCard.inBasket = basketModel.hasItem(product.id);
    previewCard.isAvailable = product.price !== null;
    
    modal.render({ content: previewCard.render() });
});

// Добавление товара в корзину
events.on('card:add', (product: IProduct) => {
    basketModel.addItem(product);
});

// Удаление товара из корзины
events.on('card:remove', (product: IProduct) => {
    basketModel.removeItem(product.id);
});

// Обновление счётчика в шапке
events.on('basket:changed', () => {
    header.counter = basketModel.getCount();
});

// Открытие корзины
events.on('basket:open', () => {
    const basketCards = basketModel.getItems().map((product, index) => {
        const card = new CardBasket(events, cloneTemplate(cardBasketTemplate), {
            onDelete: () => {
                events.emit('card:remove', product);
                events.emit('basket:open');
            }
        });
        card.index = index + 1;
        card.title = product.title;
        card.price = product.price;
        return card.render();
    });
    
    const basketView = new BasketView(events, cloneTemplate(basketTemplate));
    basketView.items = basketCards;
    basketView.total = basketModel.getTotal();
    
    modal.render({ content: basketView.render() });
});

// Оформление заказа — открытие формы адреса и оплаты
events.on('basket:submit', () => {
    if (isOrderFormOpen) return;
    isOrderFormOpen = true;
    
    const orderForm = new OrderForm(events, cloneTemplate(orderTemplate) as HTMLFormElement);
    
    const validateOrderForm = () => {
        const errors = orderModel.validateAddress();
        const isValid = Object.keys(errors).length === 0;
        orderForm.valid = isValid;
        const errorMessages = [errors.payment, errors.address].filter((msg): msg is string => Boolean(msg));
        orderForm.errors = errorMessages;
    };
    
    const onPaymentChange = (data: { payment: 'card' | 'cash' }) => {
        orderModel.setPayment(data.payment);
        validateOrderForm();
    };
    
    const onAddressChange = (data: { address: string }) => {
        orderModel.setAddress(data.address);
        validateOrderForm();
    };
    
    events.on('order:payment:change', onPaymentChange);
    events.on('order:address:change', onAddressChange);
    
    // ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПЕРЕХОДА НА ШАГ 2 (без emit)
    const goToContactsForm = () => {
        if (isContactsFormOpen) return;
        isContactsFormOpen = true;
        
        const contactsForm = new ContactsForm(events, cloneTemplate(contactsTemplate) as HTMLFormElement);
        
        const validateContactsForm = () => {
            const errors = orderModel.validateContacts();
            const isValid = Object.keys(errors).length === 0;
            contactsForm.valid = isValid;
            const errorMessages = [errors.email, errors.phone].filter((msg): msg is string => Boolean(msg));
            contactsForm.errors = errorMessages;
        };
        
        const onEmailChange = (data: { email: string }) => {
            orderModel.setEmail(data.email);
            validateContactsForm();
        };
        
        const onPhoneChange = (data: { phone: string }) => {
            orderModel.setPhone(data.phone);
            validateContactsForm();
        };
        
        events.on('contacts:email:change', onEmailChange);
        events.on('contacts:phone:change', onPhoneChange);
        
        const onSubmitOrder = () => {
            const orderData = {
                ...orderModel.getBuyerData(),
                total: basketModel.getTotal(),
                items: basketModel.getItems().map(item => item.id)
            };
            
            webLarekApi.createOrder(orderData)
                .then(result => {
                    console.log('Заказ оформлен:', result);
                    basketModel.clear();
                    orderModel.clear();
                    events.emit('order:success', { total: result.total });
                })
                .catch(error => {
                    console.error('Ошибка оформления заказа:', error);
                    contactsForm.errors = ['Ошибка оформления заказа. Попробуйте позже.'];
                });
            
            events.off('contacts:email:change', onEmailChange);
            events.off('contacts:phone:change', onPhoneChange);
            events.off('contacts:submit', onSubmitHandler);
            isContactsFormOpen = false;
        };
        
        const onSubmitHandler = () => onSubmitOrder();
        events.on('contacts:submit', onSubmitHandler);
        
        modal.render({ content: contactsForm.render() });
        validateContactsForm();
    };
    
    const onSubmit = () => {
        goToContactsForm();
        events.off('order:payment:change', onPaymentChange);
        events.off('order:address:change', onAddressChange);
        events.off('order:submit', onSubmitHandler);
        isOrderFormOpen = false;
    };
    
    const onSubmitHandler = () => onSubmit();
    events.on('order:submit', onSubmitHandler);
    
    modal.render({ content: orderForm.render() });
    validateOrderForm();
});

// Показ сообщения об успешном заказе
events.on('order:success', (data: { total: number }) => {        
    const success = new Success(events, cloneTemplate(successTemplate));
    success.total = data.total;
    
    const onSuccessClose = () => {
        modal.close();
        events.off('success:close', onSuccessClose);
    };
    events.on('success:close', onSuccessClose);
    
    modal.open();
    modal.render({ content: success.render() });
});