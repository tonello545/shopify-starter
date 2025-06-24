/* Selecting a Province */
if (!customElements.get('province-selector')) {
    customElements.define('province-selector', class ProvinceSelector extends HTMLElement {
        constructor() {
            super();
            this.provinceContainer = this.querySelector('.address-province-container');
            this.provinceSelect = this.querySelector('.address-province');
            this.countrySelect = this.querySelector('.address-country');

            // Get countries options output by default from the liquid form.
            this.countryOptions = this.getElementsByTagName('option');

            this.currentCountry = this.countrySelect.dataset.default === '' ? this.countrySelect.value : this.countrySelect.dataset.default;
            this.currentProvince = this.provinceSelect.dataset.default;

            if (this.provinceSelect.dataset.default === '') {
                const firstProvince = JSON.parse(this.countrySelect.children[0].dataset.provinces)[0];
                if (typeof firstProvince === 'undefined') {
                    this.currentProvince = this.provinceSelect.dataset.default;
                } else {
                    this.currentProvince = firstProvince[0];
                }
            }

            this.setUpEventListeners();
            this.renderProvinces();
            this.setSelectedCountry();
            this.setSelectedProvince();
        }

        get indexOfSelectedCountry() {
            for (let i = 0; i < this.countryOptions.length; i++) {
                if (this.countryOptions[i].textContent === this.currentCountry || this.countryOptions[i].value === this.currentCountry) {
                    return i;
                }
            }
        }

        setSelectedCountry() {
            this.countryOptions[this.indexOfSelectedCountry].setAttribute('selected', '');
        }

        setSelectedProvince() {
            this.provinceSelect.value = this.currentProvince;
        }

        setUpEventListeners() {
            this.countrySelect.addEventListener('change', () => {
                this.currentCountry = this.countrySelect.value;
                this.renderProvinces();
            });
        }

        renderProvinces() {
            // For some countries default-value returned by Liquid doesn't match value, so we have to compare it with textContent
            if (this.countryOptions[this.indexOfSelectedCountry].textContent === this.currentCountry || this.countryOptions[this.indexOfSelectedCountry].value === this.currentCountry) {
                const selectedCountryProvinces = JSON.parse(this.countryOptions[this.indexOfSelectedCountry].dataset.provinces);
                if (selectedCountryProvinces.length > 1) {

                    this.provinceSelect.innerHTML = selectedCountryProvinces.map((province) => {
                        return `<option value='${province[0]}'>${(province[1])}</option>`
                    });
                    this.provinceContainer.removeAttribute('hidden');
                } else {
                    this.provinceContainer.setAttribute('hidden', '');
                };
            }
        }
    });
}
