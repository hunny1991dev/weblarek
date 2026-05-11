import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Тип данных для корзины
export interface IBasketViewData {
    items: HTMLElement[];
    total: number;
}

export class BasketView extends Component<IBasketViewData> {
    protected listElement: HTMLElement;
    protected totalElement: HTMLElement;
    protected orderButton: HTMLButtonElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.listElement = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.orderButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this.orderButton.addEventListener('click', () => {
            this.events.emit('basket:submit');
        });
    }

    set items(items: HTMLElement[]) {
        if (items.length === 0) {
            this.listElement.replaceChildren();
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Корзина пуста';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '20px';
            this.listElement.appendChild(emptyMessage);
            this.orderButton.disabled = true;
        } else {
            this.listElement.replaceChildren(...items);
            this.orderButton.disabled = false;
        }
    }

    set total(value: number) {
        this.totalElement.textContent = `${value} синапсов`;
    }

    render(data?: Partial<IBasketViewData>): HTMLElement {
        if (data) {
            if (data.items !== undefined) this.items = data.items;
            if (data.total !== undefined) this.total = data.total;
        }
        return this.container;
    }
}