import { Form, IFormData } from '../common/Form';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Данные для формы заказа (шаг 1)
export interface IOrderFormData {
    payment: 'card' | 'cash' | null;
    address: string;
}

// Расширяем IFormData для валидации
interface IOrderFormValidData extends IFormData {
    payment: string;
    address: string;
}

export class OrderForm extends Form<IOrderFormValidData> {
    protected cardButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;
    protected addressInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLFormElement) {
        super(events, container);

        // Находим кнопки выбора оплаты и поле ввода адреса
        this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

        // Слушатели на кнопки выбора оплаты
        this.cardButton.addEventListener('click', () => this.setPayment('card'));
        this.cashButton.addEventListener('click', () => this.setPayment('cash'));

        // Слушатель на ввод адреса
        this.addressInput.addEventListener('input', () => {
            this.events.emit('order:address:change', { address: this.addressInput.value });
        });
    }

    // Установить способ оплаты и обновить визуальное состояние кнопок
    setPayment(payment: 'card' | 'cash') {
        // Убираем активный класс у обеих кнопок
        this.cardButton.classList.remove('button_alt-active');
        this.cashButton.classList.remove('button_alt-active');

        // Добавляем активный класс выбранной кнопке
        if (payment === 'card') {
            this.cardButton.classList.add('button_alt-active');
        } else {
            this.cashButton.classList.add('button_alt-active');
        }

        // Генерируем событие об изменении способа оплаты
        this.events.emit('order:payment:change', { payment });
    }

    // Получить текущие данные формы
    getFormData(): IOrderFormData {
        const payment = this.cardButton.classList.contains('button_alt-active') ? 'card' :
                       this.cashButton.classList.contains('button_alt-active') ? 'cash' : null;
        
        return {
            payment,
            address: this.addressInput.value,
        };
    }

    // Очистить форму
    clear(): void {
        this.cardButton.classList.remove('button_alt-active');
        this.cashButton.classList.remove('button_alt-active');
        this.addressInput.value = '';
    }
}