import { Card, ICardData } from '../common/Card';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Дополнительные данные для карточки в корзине
interface ICardBasketData extends ICardData {
    index: number;
}

// Опции для карточки корзины (колбэк при удалении)
interface ICardBasketActions {
    onDelete?: () => void;
}

export class CardBasket extends Card<ICardBasketData> {
    protected indexElement: HTMLElement;
    protected deleteButton: HTMLButtonElement;

    constructor(events: IEvents, container: HTMLElement, actions?: ICardBasketActions) {
        super(events, container);

        // Находим элементы для индекса и кнопки удаления
        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

        // Вешаем слушатель на кнопку удаления
        if (actions?.onDelete) {
            this.deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Чтобы не сработал клик на карточке
                actions.onDelete!();
            });
        }
    }

    // Сеттер для порядкового номера
    set index(value: number) {
        this.indexElement.textContent = String(value);
    }
}