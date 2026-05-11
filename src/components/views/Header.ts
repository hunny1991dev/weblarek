import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Тип данных для Header (только счётчик)
interface IHeaderData {
    counter: number;
}

export class Header extends Component<IHeaderData> {
    protected counterElement: HTMLElement;
    protected basketButton: HTMLButtonElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        // Ищем элементы внутри контейнера (шапки)
        this.counterElement = ensureElement<HTMLElement>('.header__basket-counter', this.container);
        this.basketButton = ensureElement<HTMLButtonElement>('.header__basket', this.container);

        // Слушатель на кнопку корзины
        this.basketButton.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    // Сеттер для обновления счётчика
    set counter(value: number) {
        this.counterElement.textContent = String(value);
    }
}