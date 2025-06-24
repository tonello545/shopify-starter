if (!customElements.get('media-gallery')) {
  customElements.define('media-gallery', class MediaGallery extends HTMLElement {
    constructor() {
      super();
    }

    setActiveMedia(mediaId) {
      const activeMedia = this.querySelector(`[data-media-id="${ mediaId }"]`);
      if (!activeMedia) return;

      activeMedia.parentElement.prepend(activeMedia);
    }
  });
}
