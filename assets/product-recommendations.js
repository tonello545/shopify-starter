if (!customElements.get('product-recommendations')) {
  customElements.define('product-recommendations', class ProductRecommendations extends HTMLElement {
    constructor() {
      super();

      const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);

        fetch(this.dataset.url)
          .then((response) => response.text())
          .then((text) => {
            const recommendations = new DOMParser().parseFromString(text, 'text/html').querySelector('product-recommendations');
            if (recommendations && recommendations.innerHTML.trim().length) {
              this.innerHTML = recommendations.innerHTML;
            }
          })
          .catch(e => {
            console.error(e);
          });
      }

      // load recommendations when 200px from bottom of viewport
      new IntersectionObserver(handleIntersection.bind(this), {
        rootMargin: '0px 0px 200px 0px'
      }).observe(this);
    }
  });
}
