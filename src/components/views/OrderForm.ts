import { Form, IFormData } from '../common/Form';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Данные для формы заказа
export interface IOrderFormData {
    payment: 'card' | 'cash' | null;
    address: string;
}

// Расширяем IFormData для валидации
interface IOrderFormValidData extends IFormData {
    payment: 'card' | 'cash' | null;
    address: string;
}

export class OrderForm extends Form<IOrderFormValidData> {
    protected cardButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;
    protected addressInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLFormElement) {
        super(events, container);

        this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

        this.cardButton.addEventListener('click', () => {
            events.emit('order:payment:select', { payment: 'card' });
        });

        this.cashButton.addEventListener('click', () => {
            events.emit('order:payment:select', { payment: 'cash' });
        });

        this.addressInput.addEventListener('input', () => {
            events.emit('order:address:change', { address: this.addressInput.value });
        });
    }

    set payment(value: 'card' | 'cash' | null) {
        this.cardButton.classList.remove('button_alt-active');
        this.cashButton.classList.remove('button_alt-active');
        
        if (value === 'card') {
            this.cardButton.classList.add('button_alt-active');
        } else if (value === 'cash') {
            this.cashButton.classList.add('button_alt-active');
        }
    }

    set address(value: string) {
        this.addressInput.value = value;
    }

    render(data?: Partial<IOrderFormValidData>): HTMLElement {
        if (data) {
            if (data.payment !== undefined) {
                this.payment = data.payment;
            }
            if (data.address !== undefined) {
                this.address = data.address;
            }
        }
        super.render(data);
        return this.container;
    }
}