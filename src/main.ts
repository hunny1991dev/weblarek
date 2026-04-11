import './scss/styles.scss';
import { Api } from './components/base/Api';
import { WebLarekApi } from './components/WebLarekApi';
import { Products } from './components/base/Models/Products';
import { Basket } from './components/base/Models/Basket';
import { Order } from './components/base/Models/Order';
import { API_URL } from './utils/constants';

// 1. СОЗДАНИЕ ЭКЗЕМПЛЯРОВ
const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

const productsModel = new Products();
const basketModel = new Basket();
const orderModel = new Order();

// МОКОВЫЕ ДАННЫЕ ДЛЯ ТЕСТИРОВАНИЯ (временные)
const mockProducts = [
    {
        id: "1",
        title: "Тестовый товар 1",
        description: "Описание",
        image: "/test1.svg",
        category: "другое",
        price: 100
    },
    {
        id: "2",
        title: "Тестовый товар 2",
        description: "Описание",
        image: "/test2.svg",
        category: "софт-скил",
        price: 200
    }
];

//2. ТЕСТИРОВАНИЕ PRODUCTS
console.log('\n ТЕСТИРОВАНИЕ Products:');

// 2.1 setItems() и getItems()
productsModel.setItems(mockProducts);
console.log('setItems() + getItems():', productsModel.getItems().length, 'товаров');

// 2.2 getItem()
const foundProduct = productsModel.getItem('1');
console.log('getItem():', foundProduct?.title, '(найден по id)');

const notFoundProduct = productsModel.getItem('not-exist-id');
console.log('getItem() (несуществующий id):', notFoundProduct ?? 'undefined (правильно)');

// 2.3 setSelectedItem() и getSelectedItem()
productsModel.setSelectedItem(mockProducts[1]);
console.log('setSelectedItem(): выбран товар', productsModel.getSelectedItem()?.title);
console.log('getSelectedItem():', productsModel.getSelectedItem()?.title);

// 3. ТЕСТИРОВАНИЕ BASKET
console.log('\n ТЕСТИРОВАНИЕ Basket:');

// 3.1 getItems() (изначально пусто)
console.log('getItems() (начало):', basketModel.getItems().length, 'товаров');

// 3.2 addItem()
basketModel.addItem(mockProducts[0]);
basketModel.addItem(mockProducts[1]);
basketModel.addItem(mockProducts[0]); // повторно — не добавится
console.log('addItem(): добавлено 2 товара, в корзине', basketModel.getItems().length);

// 3.3 getCount()
console.log('getCount():', basketModel.getCount());

// 3.4 getTotal()
console.log('getTotal():', basketModel.getTotal(), 'синапсов');

// 3.5 hasItem()
console.log('hasItem() (есть):', basketModel.hasItem('1'));
console.log('hasItem() (нет):', basketModel.hasItem('not-exist'));

// 3.6 getItems() (получить массив)
console.log('getItems():', basketModel.getItems().map(p => p.title));

// 3.7 removeItem()
basketModel.removeItem('1');
console.log('removeItem(): удалён первый товар, осталось', basketModel.getCount());

// 3.8 clear()
basketModel.clear();
console.log('clear(): корзина очищена, товаров', basketModel.getCount());

// 4. ТЕСТИРОВАНИЕ ORDER
console.log('\n ТЕСТИРОВАНИЕ Order:');

// 4.1 setPayment() и getBuyerData()
orderModel.setPayment('card');
orderModel.setAddress('ул. Тестовая, д. 1');
orderModel.setEmail('test@test.ru');
orderModel.setPhone('+71234567890');
console.log('setPayment/setAddress/setEmail/setPhone: данные установлены');
console.log('getBuyerData():', orderModel.getBuyerData());

// 4.2 validate() (нет ошибок)
const errorsEmpty = orderModel.validate();
console.log('validate() (все поля заполнены):', Object.keys(errorsEmpty).length === 0 ? '✅ нет ошибок' : errorsEmpty);

// 4.3 Очистка одного поля и проверка validate()
orderModel.setAddress('');
const errorsAddress = orderModel.validate();
console.log('validate() (адрес пустой): ошибка address =', errorsAddress.address || '✅');

// 4.4 clear()
orderModel.clear();
console.log('clear(): данные очищены');
console.log('getBuyerData() после clear():', orderModel.getBuyerData());

// 4.5 validate() после clear() (все поля пустые)
const errorsAll = orderModel.validate();
console.log('validate() (все поля пустые): ошибки -', Object.keys(errorsAll).join(', '));

// 5. ЗАГРУЗКА С СЕРВЕРА
console.log('\n ЗАГРУЗКА С СЕРВЕРА:');

webLarekApi.getProducts()
    .then(data => {
        productsModel.setItems(data.items);
        console.log('Товары загружены с сервера:', data.items.length, 'товаров');
        console.log('Первый товар с сервера:', data.items[0]?.title);
        console.log('getItems() из модели:', productsModel.getItems().length);
    })
    .catch(error => {
        console.error('Ошибка загрузки:', error);
    });