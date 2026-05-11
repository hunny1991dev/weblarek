import { Card, ICardData } from '../common/Card';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Дополнительные данные для карточки превью
interface ICardPreviewData extends ICardData {
    description: string;
    inBasket: boolean;
    isAvailable: boolean;
}

interface ICardPreviewActions {
    onButtonClick?: () => void;
}

export class CardPreview extends Card<ICardPreviewData> {
    protected descriptionElement: HTMLElement;
    protected buttonElement: HTMLButtonElement;

    constructor(events: IEvents, container: HTMLElement, actions?: ICardPreviewActions) {
        super(events, container);

        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', this.container);

        if (actions?.onButtonClick) {
            this.buttonElement.addEventListener('click', actions.onButtonClick);
        }
    }

    set description(value: string) {
        this.descriptionElement.textContent = value;
    }

    // Сеттер для inBasket (только меняет текст, не блокирует)
    set inBasket(value: boolean) {
        // Меняем текст кнопки, только если товар доступен
        if (this.buttonElement.disabled) return;
        this.buttonElement.textContent = value ? 'Удалить из корзины' : 'Купить';
    }

    // Сеттер для isAvailable — главный! Он управляет блокировкой и текстом
    set isAvailable(value: boolean) {
        if (!value) {
            this.buttonElement.textContent = 'Недоступно';
            this.buttonElement.disabled = true;
        } else {
            this.buttonElement.disabled = false;
            // Текст установит сеттер inBasket (будет вызван позже)
        }
    }

    // Переопределяем render
    render(data?: Partial<ICardPreviewData>): HTMLElement {
        if (data) {
            // Важный порядок: сначала isAvailable (от этого зависит блокировка)
            if (data.isAvailable !== undefined) {
                this.isAvailable = data.isAvailable;
            }
            // Потом остальные данные через родительский render
            super.render(data);
            // После super.render отдельно устанавливаем inBasket
            if (data.inBasket !== undefined && this.buttonElement.disabled === false) {
                this.inBasket = data.inBasket;
            }
            if (data.description !== undefined) {
                this.description = data.description;
            }
        }
        return this.container;
    }
}