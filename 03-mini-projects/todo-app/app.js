const form = document.getElementById('form');
const input = document.getElementById('todo');
const list = document.getElementById('list');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const li = document.createElement('li');
  li.textContent = text;
  const del = document.createElement('button');
  del.textContent = '✕';
  del.addEventListener('click', () => li.remove());
  li.appendChild(del);
  list.appendChild(li);
  input.value = '';
  input.focus();
});
