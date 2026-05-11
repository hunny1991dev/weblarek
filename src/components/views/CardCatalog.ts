import { Card, ICardData } from '../common/Card';
import { IEvents } from '../base/Events';

// Дополнительные опции для карточки каталога (только колбэк при клике)
interface ICardCatalogActions {
    onClick?: () => void;
}

export class CardCatalog extends Card<ICardData> {
    protected buttonElement?: HTMLButtonElement;

    constructor(events: IEvents, container: HTMLElement, actions?: ICardCatalogActions) {
        super(events, container);

        // Ищем кнопку (если она есть в шаблоне)
        this.buttonElement = this.container.querySelector('.card__button') as HTMLButtonElement;

        // Если кнопка есть и передан колбэк — вешаем слушатель
        if (this.buttonElement && actions?.onClick) {
            this.buttonElement.addEventListener('click', actions.onClick);
        } else if (actions?.onClick) {
            // Если кнопки нет, вешаем слушатель на всю карточку
            this.container.addEventListener('click', actions.onClick);
        }
    }

    // Переопределяем сеттер цены с учётом блокировки кнопки
    set price(value: number | null) {
        if (value === null) {
            this.priceElement.textContent = 'Недоступно';
            if (this.buttonElement) {
                this.buttonElement.textContent = 'Недоступно';
                this.buttonElement.disabled = true;
            }
        } else {
            this.priceElement.textContent = `${value} синапсов`;
            if (this.buttonElement) {
                this.buttonElement.textContent = 'Купить';
                this.buttonElement.disabled = false;
            }
        }
    }
}