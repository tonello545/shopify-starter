if (!customElements.get('cart-form')) {
  customElements.define('cart-form', class CartForm extends HTMLElement {
    constructor() {
      super();

      this.debouncedOnChange = debounce((event) => {
        this.onChange(event);
      }, 300);

      this.addEventListener('change', this.debouncedOnChange.bind(this));

      this.lineItemStatusElement =
        document.getElementById('Cart-LineItemStatus');
      this.cartStatus = document.getElementById('Cart-LiveRegionText');

      this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
        .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
    }

    onChange(event) {
      if (event.target.id === 'Cart-Note') {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
        return;
      }

      this.updateQuantity(
        event.target.dataset.index,
        event.target.value,
        document.activeElement.getAttribute('name')
      );
    }

    updateQuantity(line, quantity, name) {
      this.enableLoading(line);

      const body = JSON.stringify({
        line,
        quantity,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname
      });

      fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);

          this.getSectionsToRender().forEach((section => {
            const elementToReplace =
              document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

            elementToReplace.innerHTML =
              this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
          }));

          this.updateLiveRegions(line, parsedState.item_count);
          this.disableLoading();
          this.refocusLineItem(line, name);
        }).catch(() => {
          this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
          const errors = document.getElementById('cart-errors');
          errors.textContent = window.cartStrings.error;
          this.disableLoading();
        });
    }

    refocusLineItem(line, name) {
      const lineItem = document.getElementById(`CartItem-${line}`);

      if (lineItem) {
        lineItem.querySelector(`[name="${name}"]`).focus()
      }
    }

    enableLoading(line) {
      document.getElementById('Cart').classList.add('disable-pointer-events');
      this.querySelectorAll(`#CartItem-${line} .loading-overlay`)
        .forEach((overlay) => overlay.classList.remove('hidden'));

      document.activeElement.blur();
      this.lineItemStatusElement.setAttribute('aria-hidden', false);
    }

    disableLoading() {
      document.getElementById('Cart').classList.remove('disable-pointer-events');
    }

    updateLiveRegions(line, itemCount) {
      if (this.currentItemCount === itemCount) {
        const lineItemError = document.getElementById(`Cart-LineItemError-${line}`);
        const quantityElement = document.getElementById(`Cart-Quantity-${line}`);

        lineItemError
          .querySelector('small')
          .innerHTML = window.cartStrings.quantityError.replace(
            '[quantity]',
            quantityElement.value
          );
      }

      this.currentItemCount = itemCount;
      this.lineItemStatusElement.setAttribute('aria-hidden', true);

      this.cartStatus.setAttribute('aria-hidden', false);

      setTimeout(() => {
        this.cartStatus.setAttribute('aria-hidden', true);
      }, 1000);
    }

    getSectionsToRender() {
      return [
        {
          id: 'Cart',
          section: document.getElementById('Cart').dataset.id,
          selector: '.js-contents',
        },
        {
          id: 'CartBubble',
          section: 'cart-bubble',
          selector: '.shopify-section'
        }
      ];
    }

    getSectionInnerHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }
  });
}
