import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Тип данных для формы (общий)
export interface IFormData {
    valid: boolean;
    errors: string[];
}

export abstract class Form<T extends IFormData> extends Component<T> {
    protected submitButton: HTMLButtonElement;
    protected errorsContainer: HTMLElement;

    constructor(protected events: IEvents, container: HTMLFormElement) {
        super(container);
        
        this.submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit(`${(this.container as HTMLFormElement).name}:submit`);
        });
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }

    set errors(value: string[]) {
        this.errorsContainer.textContent = value.filter(Boolean).join(', ');
    }
}