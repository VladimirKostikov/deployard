const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

async function loadTodos() {
  const response = await fetch('/api/todos');
  const payload = await response.json();

  list.innerHTML = payload.items
    .map(
      (item) => `
        <li class="item ${item.done ? 'done' : ''}">
          <label>
            <input type="checkbox" data-id="${item.id}" ${item.done ? 'checked' : ''} />
            <span>${item.title}</span>
          </label>
        </li>
      `,
    )
    .join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) {
    return;
  }

  await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  input.value = '';
  await loadTodos();
});

list.addEventListener('change', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') {
    return;
  }

  await fetch(`/api/todos/${target.dataset.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: target.checked }),
  });

  await loadTodos();
});

loadTodos().catch(() => {
  list.innerHTML = '<li class="muted">Unable to load todos</li>';
});
