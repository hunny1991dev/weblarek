import { IBuyer, TPayment, TBuyerError } from '../../../types';

export class Order {
    private payment: TPayment | null = null;
    private address: string = '';
    private email: string = '';
    private phone: string = '';

    setPayment(payment: TPayment): void {
        this.payment = payment;
    }

    setAddress(address: string): void {
        this.address = address;
    }

    setEmail(email: string): void {
        this.email = email;
    }

    setPhone(phone: string): void {
        this.phone = phone;
    }

    getBuyerData(): IBuyer {
        return {
            payment: this.payment as TPayment,
            email: this.email,
            phone: this.phone,
            address: this.address,
        };
    }

    clear(): void {
        this.payment = null;
        this.address = '';
        this.email = '';
        this.phone = '';
    }

    validate(): TBuyerError {
        const errors: TBuyerError = {};
        
        if (!this.payment) {
            errors.payment = 'Не выбран способ оплаты';
        }
        if (!this.address.trim()) {
            errors.address = 'Не указан адрес доставки';
        }
        if (!this.email.trim()) {
            errors.email = 'Не указан email';
        }
        if (!this.phone.trim()) {
            errors.phone = 'Не указан телефон';
        }
        
        return errors;
    }
}