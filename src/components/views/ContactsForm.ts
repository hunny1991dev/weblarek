import { Form, IFormData } from '../common/Form';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Данные для формы контактов (шаг 2)
export interface IContactsFormData {
    email: string;
    phone: string;
}

// Расширяем IFormData для валидации
interface IContactsFormValidData extends IFormData {
    email: string;
    phone: string;
}

export class ContactsForm extends Form<IContactsFormValidData> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLFormElement) {
        super(events, container);

        // Находим поля ввода email и телефона
        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

        // Слушатели на ввод данных
        this.emailInput.addEventListener('input', () => {
            this.events.emit('contacts:email:change', { email: this.emailInput.value });
        });

        this.phoneInput.addEventListener('input', () => {
            this.events.emit('contacts:phone:change', { phone: this.phoneInput.value });
        });
    }

    // Получить текущие данные формы
    getFormData(): IContactsFormData {
        return {
            email: this.emailInput.value,
            phone: this.phoneInput.value,
        };
    }

    // Очистить форму
    clear(): void {
        this.emailInput.value = '';
        this.phoneInput.value = '';
    }
}