 class TodoApp {
            constructor() {
                this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
                this.currentFilter = 'all';
                this.editingId = null;
                
                this.initEventListeners();
                this.render();
            }

            initEventListeners() {
                const taskInput = document.getElementById('taskInput');
                const addBtn = document.getElementById('addBtn');
                const filterBtns = document.querySelectorAll('.filter-btn');

                addBtn.addEventListener('click', () => this.addTask());
                taskInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTask();
                });

                filterBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.setFilter(e.target.dataset.filter);
                    });
                });
            }

            generateId() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2);
            }

            addTask() {
                const taskInput = document.getElementById('taskInput');
                const text = taskInput.value.trim();
                
                if (!text) return;

                const task = {
                    id: this.generateId(),
                    text: text,
                    completed: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                this.tasks.unshift(task);
                this.saveTasks();
                taskInput.value = '';
                this.render();
            }

            toggleTask(id) {
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    task.completed = !task.completed;
                    task.updatedAt = new Date();
                    this.saveTasks();
                    this.render();
                }
            }

            editTask(id) {
                this.editingId = id;
                this.render();
            }

            saveEdit(id, newText) {
                const task = this.tasks.find(t => t.id === id);
                if (task && newText.trim()) {
                    task.text = newText.trim();
                    task.updatedAt = new Date();
                    this.saveTasks();
                }
                this.editingId = null;
                this.render();
            }

            cancelEdit() {
                this.editingId = null;
                this.render();
            }

            deleteTask(id) {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.tasks = this.tasks.filter(t => t.id !== id);
                    this.saveTasks();
                    this.render();
                }
            }

            setFilter(filter) {
                this.currentFilter = filter;
                
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
                
                this.render();
            }

            getFilteredTasks() {
                switch (this.currentFilter) {
                    case 'completed':
                        return this.tasks.filter(task => task.completed);
                    case 'pending':
                        return this.tasks.filter(task => !task.completed);
                    default:
                        return this.tasks;
                }
            }

            formatDate(date) {
                return new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }).format(new Date(date));
            }

            saveTasks() {
                localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            }

            render() {
                const container = document.getElementById('tasksContainer');
                const emptyState = document.getElementById('emptyState');
                const stats = document.getElementById('stats');
                
                const filteredTasks = this.getFilteredTasks();
                
                if (filteredTasks.length === 0) {
                    emptyState.style.display = 'block';
                    container.innerHTML = '';
                    container.appendChild(emptyState);
                } else {
                    emptyState.style.display = 'none';
                    container.innerHTML = '';
                    
                    filteredTasks.forEach(task => {
                        const taskElement = this.createTaskElement(task);
                        container.appendChild(taskElement);
                    });
                }

                // Update stats
                const totalTasks = this.tasks.length;
                const completedTasks = this.tasks.filter(t => t.completed).length;
                const pendingTasks = totalTasks - completedTasks;
                
                stats.textContent = pendingTasks > 0 
                    ? `${pendingTasks} task${pendingTasks === 1 ? '' : 's'} remaining`
                    : totalTasks > 0 ? 'All tasks completed! 🎉' : '0 tasks remaining';
            }

            createTaskElement(task) {
                const div = document.createElement('div');
                div.className = `task-item ${task.completed ? 'completed' : ''}`;
                
                if (this.editingId === task.id) {
                    div.innerHTML = `
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <input type="text" class="edit-input" value="${task.text}" maxlength="200">
                        <div class="task-actions">
                            <button class="save-btn">Save</button>
                            <button class="cancel-btn">Cancel</button>
                        </div>
                    `;
                    
                    const checkbox = div.querySelector('.task-checkbox');
                    const editInput = div.querySelector('.edit-input');
                    const saveBtn = div.querySelector('.save-btn');
                    const cancelBtn = div.querySelector('.cancel-btn');
                    
                    checkbox.addEventListener('change', () => this.toggleTask(task.id));
                    editInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') this.saveEdit(task.id, editInput.value);
                        if (e.key === 'Escape') this.cancelEdit();
                    });
                    saveBtn.addEventListener('click', () => this.saveEdit(task.id, editInput.value));
                    cancelBtn.addEventListener('click', () => this.cancelEdit());
                    
                    editInput.focus();
                    editInput.select();
                } else {
                    div.innerHTML = `
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <div class="task-content">
                            <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
                            <div class="task-timestamp">
                                Created ${this.formatDate(task.createdAt)}
                                ${task.updatedAt.getTime() !== task.createdAt.getTime() 
                                    ? ` • Updated ${this.formatDate(task.updatedAt)}` 
                                    : ''}
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="edit-btn">Edit</button>
                            <button class="delete-btn">Delete</button>
                        </div>
                    `;
                    
                    const checkbox = div.querySelector('.task-checkbox');
                    const editBtn = div.querySelector('.edit-btn');
                    const deleteBtn = div.querySelector('.delete-btn');
                    
                    checkbox.addEventListener('change', () => this.toggleTask(task.id));
                    editBtn.addEventListener('click', () => this.editTask(task.id));
                    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
                }
                
                return div;
            }
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new TodoApp();
        });