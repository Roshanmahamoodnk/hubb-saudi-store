import { products } from '/catalog.js';
import { initCommerce, openProduct, openCart, openSearch } from '/commerce.js';

// The shared catalogue uses relative assets on the homepage. Detail pages are nested.
for (const product of products) {
  if (product.image?.startsWith('./')) product.image = '/' + product.image.slice(2);
}

initCommerce();
document.addEventListener('click', event => {
  const productButton = event.target.closest('[data-seo-product]');
  if (productButton) {
    const format = productButton.dataset.seoFormat;
    if (format === 'cup' || format === 'case') openProduct(productButton.dataset.seoProduct, format);
    return;
  }
  if (event.target.closest('[data-seo-cart]')) openCart();
  if (event.target.closest('[data-seo-search]')) openSearch();
});
