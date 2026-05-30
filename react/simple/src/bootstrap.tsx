import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { styles } from './styles';
import { TodoApp } from './TodoApp';

class MyReactAppElement extends HTMLElement {
  private root: Root | null = null;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    shadow.appendChild(styleEl);

    const mount = document.createElement('div');
    shadow.appendChild(mount);

    this.root = createRoot(mount);
    this.root.render(
      <StrictMode>
        <TodoApp />
      </StrictMode>
    );
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
  }
}

if (!customElements.get('my-react-app')) {
  customElements.define('my-react-app', MyReactAppElement);
}
