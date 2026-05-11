import { Card, ICardData } from '../common/Card';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { CDN_URL, categoryMap } from '../../utils/constants';

// Дополнительные данные для карточки превью
interface ICardPreviewData extends ICardData {
    description: string;
    category: string;
    image: string;
    buttonState: {
        text: string;
        disabled: boolean;
    };
}

interface ICardPreviewActions {
    onButtonClick?: () => void;
}

export class CardPreview extends Card<ICardPreviewData> {
    protected descriptionElement: HTMLElement;
    protected categoryElement: HTMLElement;
    protected imageElement: HTMLImageElement;
    protected buttonElement: HTMLButtonElement;

    constructor(events: IEvents, container: HTMLElement, actions?: ICardPreviewActions) {
        super(events, container);

        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', this.container);

        if (actions?.onButtonClick) {
            this.buttonElement.addEventListener('click', actions.onButtonClick);
        }
    }

    set description(value: string) {
        this.descriptionElement.textContent = value;
    }

    set category(value: string) {
        this.categoryElement.textContent = value;

        Object.values(categoryMap).forEach(className => {
            this.categoryElement.classList.remove(className);
        });
        const categoryClass = categoryMap[value as keyof typeof categoryMap];
        if (categoryClass) {
            this.categoryElement.classList.add(categoryClass);
        }
    }

    set image(value: string) {
        this.imageElement.src = CDN_URL + value;
        this.imageElement.alt = this.title || 'Товар';
    }

    set buttonState(state: { text: string; disabled: boolean }) {
        this.buttonElement.textContent = state.text;
        this.buttonElement.disabled = state.disabled;
    }
}