const meshList = document.getElementById('mesh-list');
const catalogList = document.getElementById('catalog-list');
const ordersList = document.getElementById('orders-list');
const productSelect = document.getElementById('product-select');
const orderForm = document.getElementById('order-form');
const quantityInput = document.getElementById('quantity-input');
const orderFeedback = document.getElementById('order-feedback');

async function loadMesh() {
  const response = await fetch('/api/mesh');
  const payload = await response.json();

  meshList.innerHTML = payload.nodes
    .map(
      (node) => `
        <li>
          <span>${node.name}</span>
          <span class="status-${node.status}">${node.status} · ${node.latencyMs}ms</span>
        </li>
      `,
    )
    .join('');
}

async function loadCatalog() {
  const response = await fetch('/api/catalog');
  const payload = await response.json();

  catalogList.innerHTML = payload.items
    .map(
      (item) => `
        <li>
          <span>${item.name}</span>
          <span>$${item.price.toFixed(2)} · ${item.id}</span>
        </li>
      `,
    )
    .join('');

  productSelect.innerHTML = payload.items
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join('');
}

async function loadOrders() {
  const response = await fetch('/api/orders');
  const payload = await response.json();

  if (!payload.items.length) {
    ordersList.innerHTML = '<li><span>No orders yet</span></li>';
    return;
  }

  ordersList.innerHTML = payload.items
    .map(
      (order) => `
        <li>
          <span>${order.productName} × ${order.quantity}</span>
          <span>${order.id} · $${order.total}</span>
        </li>
      `,
    )
    .join('');
}

orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  orderFeedback.textContent = 'Placing order...';
  orderFeedback.className = 'feedback';

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: productSelect.value,
      quantity: Number(quantityInput.value),
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    orderFeedback.textContent = payload.error ?? 'Order failed';
    orderFeedback.className = 'feedback error';
    return;
  }

  orderFeedback.textContent = `Order ${payload.id} placed`;
  orderFeedback.className = 'feedback success';
  await loadOrders();
  await loadCatalog();
});

async function refresh() {
  await Promise.all([loadMesh(), loadCatalog(), loadOrders()]);
}

refresh().catch((error) => {
  orderFeedback.textContent = error.message;
  orderFeedback.className = 'feedback error';
});

setInterval(() => {
  void loadMesh();
}, 15_000);
