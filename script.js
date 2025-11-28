let todoList = [];

function validateForm() {
    const taskInput = document.getElementById('todo-input');
    const dateInput = document.getElementById('datetime-input');

    

    if (taskInput.value.trim() === "" || dateInput.value.trim() === "") {
        alert("Please fill in all fields.");
        return false;
    }else{
        addTodo(taskInput.value, dateInput.value);

        document.getElementById('todo-input').value = "";
        document.getElementById('datetime-input').value = "";
        
    }

    



}

function addTodo(todo, dateTime) {
    todoList.push({ todo: todo, dateTime: dateTime });
    renderTodos();
    console.log(todoList);

}    

function renderTodos() {
    const tbody = document.querySelector('#todo-table tbody');
    tbody.innerHTML = ''; // clear previous rows
    todoList.forEach((item, index) => {
        const tr = document.createElement('tr');

        // Todo text
        const tdTodo = document.createElement('td');
        tdTodo.className = "border border-gray-300 px-3 py-2";
        tdTodo.textContent = item.todo;

        // DateTime
        const tdDate = document.createElement('td');
        tdDate.className = "border border-gray-300 px-3 py-2";
        tdDate.textContent = item.dateTime;

        // Actions
        const tdActions = document.createElement('td');
        tdActions.className = "border border-gray-300 px-3 py-2";
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "border px-2 py-1 rounded bg-red-500 text-white";
        deleteBtn.onclick = () => {
            todoList.splice(index, 1);
            renderTodos();
        };
        tdActions.appendChild(deleteBtn);

        tr.appendChild(tdTodo);
        tr.appendChild(tdDate);
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
    });
}

function clearTodos() {
    todoList = [];
    renderTodos();
}

function filterTodos() {
    const filterValue = document.getElementById('filter-input').value.toLowerCase();

    const filteredList = todoList.filter(item => item.todo.toLowerCase().includes(filterValue));

    renderFilteredTodos(filteredList);
}

// Filter todos by task text and/or date
function filterTodos() {
    const taskFilter = document.getElementById('filter-task-input').value.toLowerCase();
    const dateFilter = document.getElementById('filter-date-input').value; // format: YYYY-MM-DD

    const filteredList = todoList.filter(item => {
        const matchesTask = item.todo.toLowerCase().includes(taskFilter);
        const matchesDate = dateFilter ? item.dateTime === dateFilter : true; // only filter by date if input is set
        return matchesTask && matchesDate;
    });

    renderFilteredTodos(filteredList);
}

// Render filtered todos (includes date column)
function renderFilteredTodos(list) {
    const tbody = document.querySelector('#todo-table tbody');
    tbody.innerHTML = ''; // clear previous rows

    list.forEach((item, index) => {
        const tr = document.createElement('tr');

        // Todo text
        const tdTodo = document.createElement('td');
        tdTodo.className = "border border-gray-300 px-3 py-2";
        tdTodo.textContent = item.todo;

        // Date column
        const tdDate = document.createElement('td');
        tdDate.className = "border border-gray-300 px-3 py-2";
        tdDate.textContent = item.dateTime;

        // Actions column
        const tdActions = document.createElement('td');
        tdActions.className = "border border-gray-300 px-3 py-2";
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "border px-2 py-1 rounded bg-red-500 text-white";
        deleteBtn.onclick = () => {
            const realIndex = todoList.indexOf(item);
            todoList.splice(realIndex, 1);
            renderTodos();
        };
        tdActions.appendChild(deleteBtn);

        tr.appendChild(tdTodo);
        tr.appendChild(tdDate);
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
    });
}















