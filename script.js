const API_URL = 'https://8sr5hukgbg.execute-api.ap-southeast-2.amazonaws.com/prod/todos';

let todoList = [];

// Check if user is logged in WITH COGNITO
if (!CognitoAuth.isAuthenticated()) {
    console.log('Not authenticated, redirecting to login...');
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
            CognitoAuth.signOut();  // Changed to Cognito logout
            window.location.href = 'login.html';
        }
    };
    header.style.position = 'relative'; // Make header relative for absolute positioning
    header.appendChild(logoutBtn);
}

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('cognitoIdToken');
}

// SINGLE window.onload function
window.onload = async function() {
    // 1. Add logout button
    addLogoutButton();
    
    // 2. Show logged in user (optional) - NOW FROM COGNITO
    const userEmail = CognitoAuth.getCurrentUserEmail();
    if (userEmail) {
        const userInfo = document.createElement('div');
        userInfo.className = 'text-sm text-gray-600 mb-2';
        userInfo.textContent = `Logged in as: ${userEmail}`;
        document.querySelector('header').appendChild(userInfo);
    }
    
    // 3. Load todos from AWS
    await loadTodosFromAWS();
};

async function loadTodosFromAWS() {
    try {
        console.log('Loading todos from:', API_URL);
        const token = getAuthToken();
        
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        todoList = await response.json();
        
        // ========== SORT TODOS BY DATE ==========
        todoList.sort((a, b) => {
            // Handle missing dates (put them at the end)
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            
            // Convert dates to comparable format
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            // Earliest dates first
            return dateA - dateB;
        });
        
        console.log('Loaded and sorted todos:', todoList);
        renderTodos();
    } catch (error) {
        console.error('Error loading todos:', error);
        alert('Failed to load todos. Check console for details.');
    }
}

// Add todo to AWS
async function addTodoToAWS(task, date) {
    try {
        const token = getAuthToken();
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // ADDED: Send JWT token
            },
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
async function deleteTodoFromAWS(todoId) {
    try {
        const token = getAuthToken();
        
        const response = await fetch(API_URL, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                todoId: todoId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Deleted todo with todoId:', todoId);
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

function renderTodos() {
    const tbody = document.querySelector('#todo-table tbody');
    tbody.innerHTML = '';
    
    // Show todo count
    const totalTodos = todoList.length;
    const completedTodos = todoList.filter(t => t.completed).length;
    console.log(`${completedTodos}/${totalTodos} todos completed`);
    
    todoList.forEach((item) => {
        const tr = document.createElement('tr');
        
        // ========== STATUS COLUMN (Checkbox) ==========
        const tdStatus = document.createElement('td');
        tdStatus.className = "border border-gray-300 px-3 py-2 text-center align-middle";
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.completed || false;
        checkbox.className = "w-5 h-5 cursor-pointer transform scale-125";
        checkbox.title = item.completed ? "Mark as incomplete" : "Mark as complete";
        checkbox.onchange = async () => {
            const todoId = item.todoId || item.id;
            await toggleTodoCompletion(todoId, item.completed || false);
        };
        
        tdStatus.appendChild(checkbox);
        
        // ========== TODO COLUMN ==========
        const tdTodo = document.createElement('td');
        tdTodo.className = "border border-gray-300 px-3 py-2";
        
        const todoSpan = document.createElement('span');
        todoSpan.textContent = item.task || 'No task';
        
        // Strikethrough if completed
        if (item.completed) {
            todoSpan.classList.add('line-through', 'text-gray-500');
            tdTodo.style.backgroundColor = '#f9f9f9';
        }
        
        tdTodo.appendChild(todoSpan);
        
        // ========== DATE COLUMN ==========
        const tdDate = document.createElement('td');
        tdDate.className = "border border-gray-300 px-3 py-2";
        tdDate.textContent = item.date || 'No date';
        
        if (item.completed) {
            tdDate.classList.add('text-gray-500');
            tdDate.style.backgroundColor = '#f9f9f9';
        }
        
        // ========== DELETE COLUMN ==========
        const tdDelete = document.createElement('td');
        tdDelete.className = "border border-gray-300 px-3 py-2 text-center";
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "🗑️ Delete";
        deleteBtn.className = "px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition text-sm";
        deleteBtn.title = "Delete this todo";
        deleteBtn.onclick = async () => {
            if (confirm('Delete this todo?')) {
                const todoId = item.todoId || item.id;
                const success = await deleteTodoFromAWS(todoId);
                if (success) {
                    todoList = todoList.filter(t => 
                        (t.todoId || t.id) !== todoId
                    );
                    renderTodos();
                }
            }
        };
        
        tdDelete.appendChild(deleteBtn);
        
        // ========== ASSEMBLE ROW ==========
        tr.appendChild(tdStatus);
        tr.appendChild(tdTodo);
        tr.appendChild(tdDate);
        tr.appendChild(tdDelete);
        
        // Gray background for completed rows
        if (item.completed) {
            tr.classList.add('bg-gray-50');
        }
        
        tbody.appendChild(tr);
    });
}

// Keep your existing filter functions - UPDATED
function clearTodos() {
    if (confirm('Delete ALL todos?')) {
        // Simple implementation - delete one by one
        todoList.forEach(async (item) => {
            const todoId = item.todoId || item.id;
            await deleteTodoFromAWS(todoId);
        });
        todoList = [];
        renderTodos();
    }
}

function filterTodos() {
    const taskFilter = document.getElementById('filter-task-input').value.toLowerCase();
    const dateFilter = document.getElementById('filter-date-input').value;

    const filteredList = todoList.filter(item => {
        const taskText = (item.task || '').toLowerCase();
        const itemDate = item.date || '';
        
        const matchesTask = taskText.includes(taskFilter);
        const matchesDate = dateFilter ? itemDate === dateFilter : true;
        return matchesTask && matchesDate;
    });

    renderFilteredTodos(filteredList);
}

// Function to toggle todo completion (checkbox)
async function toggleTodoCompletion(todoId, currentStatus) {
    try {
        const token = getAuthToken();
        const newStatus = !currentStatus; // Toggle true/false
        
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                todoId: todoId,
                completed: newStatus
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Todo status updated:', result);
        
        // Update local todoList
        const todoIndex = todoList.findIndex(todo => 
            (todo.todoId || todo.id) === todoId
        );
        if (todoIndex !== -1) {
            todoList[todoIndex].completed = newStatus;
            todoList[todoIndex].updatedAt = new Date().toISOString();
        }
        
        // Re-render
        renderTodos();
        return true;
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo status');
        return false;
    }
}

// Mark all todos as complete
async function markAllComplete() {
    if (confirm('Mark ALL todos as complete?')) {
        const incompleteTodos = todoList.filter(todo => !todo.completed);
        
        for (const todo of incompleteTodos) {
            const todoId = todo.todoId || todo.id;
            await toggleTodoCompletion(todoId, false);
        }
        
        console.log('Marked all as complete');
    }
}

// Delete all completed todos
async function clearCompleted() {
    const completedTodos = todoList.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) {
        alert('No completed todos to clear');
        return;
    }
    
    if (confirm(`Delete ${completedTodos.length} completed todos?`)) {
        for (const todo of completedTodos) {
            const todoId = todo.todoId || todo.id;
            await deleteTodoFromAWS(todoId);
        }
        
        // Reload todos
        await loadTodosFromAWS();
    }
}

function renderFilteredTodos(list) {
    const tbody = document.querySelector('#todo-table tbody');
    tbody.innerHTML = '';

    list.forEach((item) => {
        const tr = document.createElement('tr');

        const tdTodo = document.createElement('td');
        tdTodo.className = "border border-gray-300 px-3 py-2";
        tdTodo.textContent = item.task || 'No task';

        const tdDate = document.createElement('td');
        tdDate.className = "border border-gray-300 px-3 py-2";
        tdDate.textContent = item.date || 'No date';

        const tdActions = document.createElement('td');
        tdActions.className = "border border-gray-300 px-3 py-2";
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "border px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition";
        deleteBtn.onclick = async () => {
            if (confirm('Delete this todo?')) {
                const todoId = item.todoId || item.id;
                const success = await deleteTodoFromAWS(todoId);
                if (success) {
                    todoList = todoList.filter(t => 
                        (t.todoId || t.id) !== todoId
                    );
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