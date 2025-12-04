const API_URL = 'https://8sr5hukgbg.execute-api.ap-southeast-2.amazonaws.com/prod/todos';

let todoList = [];

// Check if user is logged in
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

// Add logout button to your todo app
function addLogoutButton() {
    const header = document.querySelector('header');
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition';
    logoutBtn.onclick = function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            window.location.href = 'login.html';
        }
    };
    header.style.position = 'relative'; // Make header relative for absolute positioning
    header.appendChild(logoutBtn);
}

// SINGLE window.onload function
window.onload = async function() {
    // 1. Add logout button
    addLogoutButton();
    
    // 2. Show logged in user (optional)
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        const userInfo = document.createElement('div');
        userInfo.className = 'text-sm text-gray-600 mb-2';
        userInfo.textContent = `Logged in as: ${userEmail}`;
        document.querySelector('header').appendChild(userInfo);
    }
    
    // 3. Load todos from AWS
    await loadTodosFromAWS();
};

// Fetch todos from AWS
async function loadTodosFromAWS() {
    try {
        console.log('Loading todos from:', API_URL);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        todoList = await response.json();
        console.log('Loaded todos:', todoList);
        renderTodos();
    } catch (error) {
        console.error('Error loading todos:', error);
        alert('Failed to load todos. Check console for details.');
    }
}

// Add todo to AWS
async function addTodoToAWS(task, date) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                task: task, 
                date: date 
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newTodo = await response.json();
        console.log('Added todo:', newTodo);
        todoList.push(newTodo);
        renderTodos();
        return true;
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Failed to save todo. Check console.');
        return false;
    }
}

// Delete todo from AWS
async function deleteTodoFromAWS(id) {
    try {
        const response = await fetch(API_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Deleted todo with id:', id);
        return true;
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo. Check console.');
        return false;
    }
}

// Your existing validateForm - MODIFIED
async function validateForm() {
    const taskInput = document.getElementById('todo-input');
    const dateInput = document.getElementById('datetime-input');

    if (taskInput.value.trim() === "" || dateInput.value.trim() === "") {
        alert("Please fill in all fields.");
        return false;
    }
    
    const success = await addTodoToAWS(taskInput.value, dateInput.value);
    
    if (success) {
        taskInput.value = "";
        dateInput.value = "";
    }
}

// Your existing renderTodos - MODIFIED
function renderTodos() {
    const tbody = document.querySelector('#todo-table tbody');
    tbody.innerHTML = '';
    
    todoList.forEach((item) => {
        const tr = document.createElement('tr');

        // Todo text
        const tdTodo = document.createElement('td');
        tdTodo.className = "border border-gray-300 px-3 py-2";
        tdTodo.textContent = item.task || item.todo || 'No task';

        // DateTime
        const tdDate = document.createElement('td');
        tdDate.className = "border border-gray-300 px-3 py-2";
        tdDate.textContent = item.date || item.dateTime || 'No date';

        // Actions
        const tdActions = document.createElement('td');
        tdActions.className = "border border-gray-300 px-3 py-2";
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "border px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition";
        deleteBtn.onclick = async () => {
            if (confirm('Delete this todo?')) {
                const success = await deleteTodoFromAWS(item.id);
                if (success) {
                    todoList = todoList.filter(t => t.id !== item.id);
                    renderTodos();
                }
            }
        };
        
        tdActions.appendChild(deleteBtn);
        tr.appendChild(tdTodo);
        tr.appendChild(tdDate);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
}

// Keep your existing filter functions
function clearTodos() {
    if (confirm('Delete ALL todos?')) {
        // Simple implementation - delete one by one
        todoList.forEach(async (item) => {
            await deleteTodoFromAWS(item.id);
        });
        todoList = [];
        renderTodos();
    }
}

function filterTodos() {
    const taskFilter = document.getElementById('filter-task-input').value.toLowerCase();
    const dateFilter = document.getElementById('filter-date-input').value;

    const filteredList = todoList.filter(item => {
        const taskText = (item.task || item.todo || '').toLowerCase();
        const itemDate = item.date || item.dateTime || '';
        
        const matchesTask = taskText.includes(taskFilter);
        const matchesDate = dateFilter ? itemDate === dateFilter : true;
        return matchesTask && matchesDate;
    });

    renderFilteredTodos(filteredList);
}

function renderFilteredTodos(list) {
    const tbody = document.querySelector('#todo-table tbody');
    tbody.innerHTML = '';

    list.forEach((item) => {
        const tr = document.createElement('tr');

        const tdTodo = document.createElement('td');
        tdTodo.className = "border border-gray-300 px-3 py-2";
        tdTodo.textContent = item.task || item.todo || 'No task';

        const tdDate = document.createElement('td');
        tdDate.className = "border border-gray-300 px-3 py-2";
        tdDate.textContent = item.date || item.dateTime || 'No date';

        const tdActions = document.createElement('td');
        tdActions.className = "border border-gray-300 px-3 py-2";
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "border px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition";
        deleteBtn.onclick = async () => {
            if (confirm('Delete this todo?')) {
                const success = await deleteTodoFromAWS(item.id);
                if (success) {
                    todoList = todoList.filter(t => t.id !== item.id);
                    renderTodos();
                }
            }
        };
        
        tdActions.appendChild(deleteBtn);
        tr.appendChild(tdTodo);
        tr.appendChild(tdDate);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
}