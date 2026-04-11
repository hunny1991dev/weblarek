import { IApi, IProductsResponse, IOrderResponse, IOrderData } from '../types';

export class WebLarekApi {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    // GET запрос на /product/ — получаем список товаров
    getProducts(): Promise<IProductsResponse> {
        return this.api.get<IProductsResponse>('/product');
    }

    // POST запрос на /order/ — отправляем заказ
    createOrder(orderData: IOrderData): Promise<IOrderResponse> {
        return this.api.post<IOrderResponse>('/order', orderData);
    }
}