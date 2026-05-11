import { Form, IFormData } from '../common/Form';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Данные для формы контактов 
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

        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

        this.emailInput.addEventListener('input', () => {
            events.emit('contacts:email:change', { email: this.emailInput.value });
        });

        this.phoneInput.addEventListener('input', () => {
            events.emit('contacts:phone:change', { phone: this.phoneInput.value });
        });
    }

    set email(value: string) {
        this.emailInput.value = value;
    }

    set phone(value: string) {
        this.phoneInput.value = value;
    }

    // Переопределяем render для обновления данных из презентера
    render(data?: Partial<IContactsFormValidData>): HTMLElement {
        if (data) {
            if (data.email !== undefined) {
                this.email = data.email;
            }
            if (data.phone !== undefined) {
                this.phone = data.phone;
            }
        }
        super.render(data);
        return this.container;
    }
}