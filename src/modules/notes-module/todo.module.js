/**
 * TO-DO LIST MODULE
 * Manage tasks with add, edit, remove, and mark as done functionality
 * Stores data in local storage
 */

const STORAGE_KEY = 'dws_todos';

export function initTodoList(container) {
    if (!container) {
        console.warn('To-do list container not found');
        return;
    }

    let todos = loadTodos();
    let editingId = null;

    // Create the main structure
    const todoCard = document.createElement('div');
    todoCard.className = 'todo-widget';
    todoCard.innerHTML = `
        <div class="todo-widget-inner">
            <div class="todo-widget-label">To-Do List</div>
            <div class="todo-input-section">
                <input type="text" id="todo-input" class="todo-input" placeholder="Add a new task...">
                <button id="add-todo-btn" class="todo-add-btn">+</button>
            </div>
            <div class="todo-tabs">
                <button class="todo-tab active" data-filter="active">Active</button>
                <button class="todo-tab" data-filter="done">Done</button>
            </div>
            <div class="todo-list" id="todo-list"></div>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(todoCard);

    const input = todoCard.querySelector('#todo-input');
    const addBtn = todoCard.querySelector('#add-todo-btn');
    const todoList = todoCard.querySelector('#todo-list');
    const tabs = todoCard.querySelectorAll('.todo-tab');

    let currentFilter = 'active';

    /**
     * Load todos from local storage
     */
    function loadTodos() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Save todos to local storage
     */
    function saveTodos() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }

    /**
     * Render todos based on filter
     */
    function renderTodos() {
        todoList.innerHTML = '';

        const filtered = todos.filter(todo => {
            if (currentFilter === 'active') return !todo.done;
            if (currentFilter === 'done') return todo.done;
            return true;
        });

        if (filtered.length === 0) {
            todoList.innerHTML = '<div class="todo-empty">No tasks yet</div>';
            return;
        }

        filtered.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = `todo-item ${todo.done ? 'todo-item-done' : ''}`;
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.done ? 'checked' : ''} data-id="${todo.id}">
                <span class="todo-text" data-id="${todo.id}">${escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="todo-edit-btn" data-id="${todo.id}" title="Edit">✎</button>
                    <button class="todo-delete-btn" data-id="${todo.id}" title="Delete">✕</button>
                </div>
            `;

            // Checkbox handler
            const checkbox = todoItem.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => {
                toggleTodo(todo.id);
            });

            // Edit button handler
            const editBtn = todoItem.querySelector('.todo-edit-btn');
            editBtn.addEventListener('click', () => {
                startEdit(todo.id, todo.text);
            });

            // Delete button handler
            const deleteBtn = todoItem.querySelector('.todo-delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteTodo(todo.id);
            });

            // Click text to edit
            const textSpan = todoItem.querySelector('.todo-text');
            textSpan.addEventListener('dblclick', () => {
                startEdit(todo.id, todo.text);
            });

            todoList.appendChild(todoItem);
        });
    }

    /**
     * Add a new todo
     */
    function addTodo() {
        const text = input.value.trim();
        if (!text) return;

        const newTodo = {
            id: Date.now(),
            text: text,
            done: false,
            created: new Date().toISOString()
        };

        todos.push(newTodo);
        saveTodos();
        input.value = '';
        renderTodos();
        input.focus();
    }

    /**
     * Toggle todo done status
     */
    function toggleTodo(id) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.done = !todo.done;
            saveTodos();
            renderTodos();
        }
    }

    /**
     * Start editing a todo
     */
    function startEdit(id, currentText) {
        editingId = id;
        input.value = currentText;
        input.focus();
        input.select();
        addBtn.textContent = '✓';
        addBtn.classList.add('todo-save-mode');
    }

    /**
     * Save edited todo
     */
    function saveEdit() {
        if (!editingId) return;

        const text = input.value.trim();
        if (!text) return;

        const todo = todos.find(t => t.id === editingId);
        if (todo) {
            todo.text = text;
            saveTodos();
        }

        cancelEdit();
        renderTodos();
    }

    /**
     * Cancel editing
     */
    function cancelEdit() {
        editingId = null;
        input.value = '';
        addBtn.textContent = '+';
        addBtn.classList.remove('todo-save-mode');
    }

    /**
     * Delete a todo
     */
    function deleteTodo(id) {
        if (confirm('Delete this task?')) {
            todos = todos.filter(t => t.id !== id);
            saveTodos();
            renderTodos();
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Add button handler
     */
    addBtn.addEventListener('click', () => {
        if (editingId) {
            saveEdit();
        } else {
            addTodo();
        }
    });

    /**
     * Enter key handler
     */
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (editingId) {
                saveEdit();
            } else {
                addTodo();
            }
        }
    });

    /**
     * Escape key handler
     */
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editingId) {
            cancelEdit();
        }
    });

    /**
     * Tab handlers
     */
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderTodos();
        });
    });

    // Initial render
    renderTodos();

    return {
        destroy() {
            // Cleanup if needed
        },
        addTask(text) {
            input.value = text;
            addTodo();
        }
    };
}
