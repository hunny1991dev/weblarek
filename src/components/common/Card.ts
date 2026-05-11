import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Тип данных для карточки (общий)
export interface ICardData {
    title: string;
    price: number | null;
}

export abstract class Card<T extends ICardData> extends Component<T> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);
        
        this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
    }

    set title(value: string) {
        this.titleElement.textContent = value;
    }

    set price(value: number | null) {
        if (value === null) {
            this.priceElement.textContent = 'Бесценно';
        } else {
            this.priceElement.textContent = `${value} синапсов`;
        }
    }
}