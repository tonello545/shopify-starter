if (!customElements.get('pickup-availability')) {
  customElements.define('pickup-availability', class PickupAvailability extends HTMLElement {
    constructor() {
      super();

      this.errorTemplate = this.querySelector('template');
      this.render(this.dataset.productVariant);
    }

    render(productVariant) {
      fetch(`${window.Shopify.routes.root}variants/${productVariant}?section_id=pickup-availability`)
        .then(response => response.text())
        .then(text => {
          const html = new DOMParser().parseFromString(text, 'text/html').querySelector('.shopify-section');
          this.innerHTML = html.innerHTML;
        })
        .catch(error => {
          this.innerHTML = this.errorTemplate ? this.errorTemplate.innerHTML : error.message;
          console.error(error);
        });
    }
  });
}
