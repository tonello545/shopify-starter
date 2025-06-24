if (!customElements.get('variant-selects')) {
  customElements.define('variant-selects', class VariantSelects extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('change', this.onVariantChange);
    }

    onVariantChange() {
      this.updateOptions();
      this.updateVariantId();
      this.toggleAddButton(true);
      this.updatePickupAvailability();
      this.removeErrorMessage();

      if (!this.currentVariant) {
        this.toggleAddButton(true);
        this.setUnavailable();
      } else {
        this.updateMedia();
        this.updateURL();
        this.updateVariantInput();
        this.renderProductInfo();
        this.updateShareUrl();
      }
    }

    updateOptions() {
      this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
    }

    updateVariantId() {
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options.map((option, index) => {
          return this.options[index] === option;
        }).includes(false);
      });
    }

    updateMedia() {
      if (!this.currentVariant) return;
      if (!this.currentVariant.featured_media) return;

      const mediaGallery = document.getElementById(`Product-MediaGallery-${this.dataset.section}`);
      mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`);
    }

    updateURL() {
      if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateShareUrl() {
      const shareButton = document.getElementById(`Share-${this.dataset.section}`);
      if (!shareButton || !shareButton.updateUrl) return;
      shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateVariantInput() {
      const productForms =
        document.querySelectorAll(`#Product-Form-${this.dataset.section}, #Installment-${this.dataset.section}`);

      productForms.forEach((productForm) => {
        const input = productForm.querySelector('input[name="id"]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    removeErrorMessage() {
      const section = this.closest('section');
      if (!section) return;

      const productForm = section.querySelector('product-form');
      if (productForm) productForm.handleErrorMessage();
    }

    renderProductInfo() {
      fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html')
          const destination = document.getElementById(`Price-${this.dataset.section}`);
          const source = html.getElementById(`Price-${this.dataset.section}`);
          if (source && destination) destination.innerHTML = source.innerHTML;

          const price = document.getElementById(`Price-${this.dataset.section}`);

          if (price) price.classList.remove('visibility-hidden');
          this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
        });
    }

    toggleAddButton(disable = true, text) {
      const productForm = document.getElementById(`Product-Form-${this.dataset.section}`);
      if (!productForm) return;

      const addButton = productForm.querySelector('[name="add"]');
      const addButtonText = productForm.querySelector('[name="add"] > span');

      if (!addButton) return;

      if (disable) {
        addButton.setAttribute('disabled', 'disabled');
        if (text) addButtonText.textContent = text;
      } else {
        addButton.removeAttribute('disabled');
        addButtonText.textContent = window.variantStrings.addToCart;
      }
    }

    setUnavailable() {
      const button = document.getElementById(`Product-Form-${this.dataset.section}`);
      const addButton = button.querySelector('[name="add"]');
      const addButtonText = button.querySelector('[name="add"] > span');
      const price = document.getElementById(`Price-${this.dataset.section}`);

      if (!addButton) return;

      addButtonText.textContent = window.variantStrings.unavailable;
      if (price) price.classList.add('visibility-hidden');
    }

    getVariantData() {
      this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
      return this.variantData;
    }

    updatePickupAvailability() {
      const pickUpAvailability = document.querySelector('pickup-availability');
      if (!pickUpAvailability) return;

      if (this.currentVariant && this.currentVariant.available) {
        pickUpAvailability.render(this.currentVariant.id);
      } else {
        pickUpAvailability.innerHTML = '';
      }
    }
  });
}
