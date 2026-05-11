import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IModalData {
    content: HTMLElement | null;
}

export class Modal extends Component<IModalData> {
    protected closeButton: HTMLButtonElement;
    protected contentElement: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this.contentElement = ensureElement<HTMLElement>('.modal__content', container);

        this.closeButton.addEventListener('click', () => this.close());

        container.addEventListener('click', (event) => {
            if (event.target === container) {
                this.close();
            }
        });
    }

    set content(value: HTMLElement | null) {
        if (value) {
            this.contentElement.replaceChildren(value);
        } else {
            this.contentElement.replaceChildren();
        }
    }

    open() {
        this.container.classList.add('modal_active');
    }

    close() {
        this.container.classList.remove('modal_active');
        this.content = null;
    }

    
    render(data?: IModalData): HTMLElement {
        if (data?.content !== undefined) {
            this.content = data.content;
        }
        this.open();
        return this.container;
    }
}