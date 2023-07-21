let todos = [];
const input = document.getElementById('input');
const list = document.getElementById('list');
const filter = document.getElementById('filter');

function createTodoItemEl({ value, completed, id }) {
  const li = document.createElement('li');
  li.dataset.id = id;
  li.className = 'py-[16px] group px-[20px] border-solid border-b-2 border-gray-300 flex items-center justify-between';
  li.insertAdjacentHTML(
    'afterbegin',
    `
      <div class="flex items-center w-full">
        <i data-todo="toggle" class='bx ${completed ? 'bx-check-square' : 'bx-square'} text-[30px] cursor-pointer'></i>
        <div contenteditable="true" data-todo="value" class="pl-[10px] w-full ${
          completed ? 'line-through' : ''
        }">${value}</div>
      </div>
      <i data-todo="remove" class='bx bx-trash text-[30px] cursor-pointer invisible group-hover:visible'></i>
    `
  );
  return li;
}

async function fetchTodos() {
  const res = await fetch('https://64106f42be7258e14529c12f.mockapi.io/todos', {
    method: 'GET',
  });
  const data = await res.json();
  todos = data;
}

async function createTodo({ value, completed }) {
  const res = await fetch('https://64106f42be7258e14529c12f.mockapi.io/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value, completed }),
  });
  const data = await res.json();
  return data;
}

function renderTodos() {
  list.replaceChildren(...todos.map((todo) => createTodoItemEl(todo)));
}

input.addEventListener('keyup', async (e) => {
  const completed = false;
  const value = e.target.value.trim();
  if ((e.key === 'Enter' || e.keyCode === 13) && value !== '') {
    const id = crypto.randomUUID();
    const todo = await createTodo({ value, completed, id });
    todos.push(todo);
    renderTodos();
    input.value = '';
  }
});

list.addEventListener('click', (e) => {
  if (e.target.matches('[data-todo="remove"]')) {
    const id = e.target.parentElement.dataset.id;
    todos = todos.filter((todo) => todo.id !== id);
    localStorage.setItem('todos', JSON.stringify(todos));
    list.removeChild(e.target.parentElement);
  }
});

list.addEventListener('click', (e) => {
  if (e.target.matches('[data-todo="toggle"]')) {
    const id = e.target.parentElement.dataset.id;
    todos = todos.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
        };
      }
      return todo;
    });
    localStorage.setItem('todos', JSON.stringify(todos));
    e.target.classList.toggle('bx-square');
    e.target.classList.toggle('bx-check-square');
    e.target.nextElementSibling.classList.toggle('line-through');
  }
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#/', '');
  const items = list.querySelectorAll('li');
  items.forEach((item) => {
    switch (hash) {
      case 'active':
        if (item.querySelector('i').classList.contains('bx-check-square')) {
          item.classList.add('hidden');
        } else {
          item.classList.remove('hidden');
        }
        break;
      case 'completed':
        if (item.querySelector('i').classList.contains('bx-check-square')) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
        break;
      default:
        item.classList.remove('hidden');
    }
  });
  filter.querySelectorAll('a').forEach((el) => {
    if (el.matches(`[href="#/${hash}"]`)) {
      el.classList.add('checked');
    } else {
      el.classList.remove('checked');
    }
  });
});

fetchTodos().then(() => {
  renderTodos();
});