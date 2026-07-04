const errorPanel = document.getElementById('error-panel');
const productList = document.getElementById('product-list');

function showError(message) {
  errorPanel.textContent = message;
  errorPanel.classList.remove('hidden');
}

function renderProducts(items) {
  productList.replaceChildren();

  for (const product of items) {
    const item = document.createElement('li');
    item.className = 'product-card';

    item.innerHTML = `
      <div class="product-name">${product.name}</div>
      <div class="product-meta">
        <span class="product-price">$${Number(product.price).toFixed(2)}</span>
        <span class="product-stock">${product.stock} in stock</span>
      </div>
    `;

    productList.appendChild(item);
  }
}

async function loadShop() {
  try {
    const productsUrl = new URL('api/products', window.location.href);
    const productsResponse = await fetch(productsUrl);

    if (!productsResponse.ok) {
      throw new Error('Failed to load products');
    }

    const payload = await productsResponse.json();
    renderProducts(payload.items ?? []);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Unexpected error');
  }
}

loadShop();
