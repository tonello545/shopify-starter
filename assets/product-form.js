if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.submitButton = this.querySelector('[type="submit"]');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

      // Passing no argument will hide the error message if one was on screen because errorText defaults to false
      this.handleErrorMessage();

      // Disabling the button temporarily so that the request can be processed
      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');

      const config = {
        method: 'POST',
        headers: {
          'Accept': 'application/javascript',
          'X-Requested-With': 'XMLHttpRequest',
        }
      };

      const formData = new FormData(this.form);
      formData.append('sections', ['cart-bubble']);

      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);

            this.error = true;

            return;
          }

          document.getElementById('CartBubble').innerHTML = `(${response.sections['cart-bubble'].match(/\d+/)})`;

          this.error = false;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally((response) => {
          this.submitButton.classList.remove('loading');
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          this.submitButton.removeAttribute('aria-disabled');
        });
    }

    handleErrorMessage(errorText = false) {
      this.errorMessage = this.errorMessage || this.querySelector('.message-error');
      if (!this.errorMessage) return;

      this.errorMessage.classList.toggle('hidden', !errorText);

      this.errorMessage.textContent = errorText ? errorText : '';

    }
  });
}
