export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

// Тип для способа оплаты
export type TPayment = 'card' | 'cash';

// Товар
export interface IProduct {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    price: number | null;
}

// Покупатель
export interface IBuyer {
    payment: TPayment;
    email: string;
    phone: string;
    address: string;
}

// Тип для ошибок валидации данных покупателя
export type TBuyerError = {
    payment?: string;
    email?: string;
    phone?: string;
    address?: string;
}

// Ответ сервера на GET /product
export interface IProductsResponse {
    total: number;
    items: IProduct[];
}

// Ответ сервера на POST /order
export interface IOrderResponse {
    id: string;
    total: number;
}

// Данные для отправки заказа 
export interface IOrderData extends IBuyer {
    total: number;
    items: string[];
}