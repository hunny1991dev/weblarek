import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Тип данных для формы (общий)
export interface IFormData {
    valid: boolean;
    errors: string[];
}

export abstract class Form<T extends IFormData> extends Component<T> {
    protected formElement: HTMLFormElement;
    protected submitButton: HTMLButtonElement;
    protected errorsContainer: HTMLElement;

    constructor(protected events: IEvents, container: HTMLFormElement) {
        super(container);
        
        // Сохраняем форму в поле с правильным типом
        this.formElement = container;

        // Ищем кнопку сабмита и контейнер для ошибок
        this.submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', this.formElement);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', this.formElement);

        // Слушатель на сабмит формы
        this.formElement.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit(`${this.formElement.name}:submit`);
        });
    }

    // Сеттер для валидности (активирует/деактивирует кнопку)
    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }

    // Сеттер для ошибок (отображает их в контейнере)
    set errors(value: string[]) {
        this.errorsContainer.textContent = value.filter(Boolean).join(', ');
    }

    // Очистка полей формы (должен переопределить наследник)
    abstract clear(): void;
}