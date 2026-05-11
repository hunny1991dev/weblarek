import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { CDN_URL, categoryMap } from '../../utils/constants';

// Тип данных для карточки (общий)
export interface ICardData {
    title: string;
    price: number | null;
    category?: string;
    image?: string;
}

export abstract class Card<T extends ICardData> extends Component<T> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;
    protected categoryElement?: HTMLElement;
    protected imageElement?: HTMLImageElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);
        
        // Ищем общие элементы в контейнере карточки
        this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
        
        // Эти элементы могут отсутствовать в некоторых вариантах карточек
        this.categoryElement = this.container.querySelector('.card__category') || undefined;
        this.imageElement = this.container.querySelector('.card__image') as HTMLImageElement || undefined;
    }

    // Сеттер для названия
    set title(value: string) {
        this.titleElement.textContent = value;
    }

    // Сеттер для цены (если null — показываем "Недоступно")
    set price(value: number | null) {
        if (value === null) {
            this.priceElement.textContent = 'Недоступно';
        } else {
            this.priceElement.textContent = `${value} синапсов`;
        }
    }

    // Сеттер для категории (меняем текст и CSS-класс)
    set category(value: string) {
        if (this.categoryElement) {
            this.categoryElement.textContent = value;
            // Сбрасываем все возможные классы категорий
            Object.values(categoryMap).forEach(className => {
                this.categoryElement?.classList.remove(className);
            });
            // Добавляем нужный класс из маппинга
            const categoryClass = categoryMap[value as keyof typeof categoryMap];
            if (categoryClass) {
                this.categoryElement.classList.add(categoryClass);
            }
        }
    }

    // Сеттер для изображения (формируем полный URL)
    set image(value: string) {
        if (this.imageElement) {
            this.imageElement.src = CDN_URL + value;
            this.imageElement.alt = this.title || 'Товар';
        }
    }
}