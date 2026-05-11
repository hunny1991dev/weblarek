import { IBuyer, TPayment, TBuyerError } from '../../types';
import { IEvents } from '../base/Events';

export class Order {
    private payment: TPayment | null = null;
    private address: string = '';
    private email: string = '';
    private phone: string = '';

    constructor(protected events: IEvents) {}

    setPayment(payment: TPayment): void {
        this.payment = payment;
        this.events.emit('order:payment:changed', { payment });
        this.events.emit('order:changed', this.getBuyerData());
    }

    setAddress(address: string): void {
        this.address = address;
        this.events.emit('order:address:changed', { address });
        this.events.emit('order:changed', this.getBuyerData());
    }

    setEmail(email: string): void {
        this.email = email;
        this.events.emit('order:email:changed', { email });
        this.events.emit('order:changed', this.getBuyerData());
    }

    setPhone(phone: string): void {
        this.phone = phone;
        this.events.emit('order:phone:changed', { phone });
        this.events.emit('order:changed', this.getBuyerData());
    }

    getBuyerData(): IBuyer {
        return {
            payment: this.payment,
            email: this.email,
            phone: this.phone,
            address: this.address,
        };
    }

    clear(): void {
        if (this.payment !== null || this.address || this.email || this.phone) {
            this.payment = null;
            this.address = '';
            this.email = '';
            this.phone = '';
            this.events.emit('order:cleared');
            this.events.emit('order:changed', this.getBuyerData());
        }
    }

// Валидация для первого шага (способ оплаты + адрес)
validateAddress(): TBuyerError {
    const errors: TBuyerError = {};
    
    if (!this.payment) {
        errors.payment = 'Не выбран способ оплаты';
    }
    if (!this.address.trim()) {
        errors.address = 'Не указан адрес доставки';
    }
    
    return errors;
}

// Валидация для второго шага (email + телефон)
validateContacts(): TBuyerError {
    const errors: TBuyerError = {};
    
    if (!this.email.trim()) {
        errors.email = 'Не указан email';
    }
    if (!this.phone.trim()) {
        errors.phone = 'Не указан телефон';
    }
    
    return errors;
}

// Полная валидация (для отправки на сервер)
validate(): TBuyerError {
    return {
        ...this.validateAddress(),
        ...this.validateContacts()
    };
}
}