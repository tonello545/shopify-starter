document.querySelectorAll('.disclosure').forEach((details) => {
  const summary = details.querySelector('summary');
  const cancel = details.querySelector('button[type="reset"]');

  summary.setAttribute('aria-expanded', summary.parentElement.hasAttribute('open'));

  summary.addEventListener('click', () => {
      summary.setAttribute('aria-expanded', !details.hasAttribute('open'));
  });

  cancel && cancel.addEventListener('click', () => {
      details.removeAttribute('open');
      summary.setAttribute('aria-expanded', 'false');
  });
});

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

function pauseAllMedia() {
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}
