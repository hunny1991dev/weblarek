import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Тип данных для успешного заказа
export interface ISuccessData {
    total: number;
}

export class Success extends Component<ISuccessData> {
    protected descriptionElement: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        // Находим элементы
        this.descriptionElement = ensureElement<HTMLElement>('.order-success__description', this.container);
        this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);

        // Слушатель на кнопку закрытия
        this.closeButton.addEventListener('click', () => {
            this.events.emit('success:close');
        });
    }

    // Сеттер для общей суммы (обновляем текст описания)
    set total(value: number) {
        this.descriptionElement.textContent = `Списано ${value} синапсов`;
    }
}