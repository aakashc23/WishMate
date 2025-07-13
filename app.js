// DOM Elements
const reminderForm = document.getElementById('reminderForm');
const nameInput = document.getElementById('name');
const dateInput = document.getElementById('date');
const noteInput = document.getElementById('note');
const categoryInput = document.getElementById('category');
const remindersContainer = document.getElementById('remindersContainer');
const noReminders = document.getElementById('noReminders');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadReminders();
    checkTodayReminders();
    
    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission();
    }
});

// Form submission
reminderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const reminder = {
        id: Date.now().toString(),
        name: nameInput.value.trim(),
        date: dateInput.value,
        note: noteInput.value.trim(),
        category: categoryInput.value
    };
    
    addReminder(reminder);
    reminderForm.reset();
    nameInput.focus();
});

// Search and filter functionality
searchInput.addEventListener('input', filterReminders);
categoryFilter.addEventListener('change', filterReminders);

// Add a new reminder
function addReminder(reminder) {
    const reminders = getReminders();
    reminders.push(reminder);
    saveReminders(reminders);
    displayReminders(reminders);
    
    // Check if the new reminder is today
    checkIfToday(reminder);
}

// Get all reminders from localStorage
function getReminders() {
    const remindersJSON = localStorage.getItem('reminders');
    return remindersJSON ? JSON.parse(remindersJSON) : [];
}

// Save reminders to localStorage
function saveReminders(reminders) {
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Load and display reminders
function loadReminders() {
    const reminders = getReminders();
    displayReminders(reminders);
}

// Display reminders in the UI
function displayReminders(reminders) {
    if (reminders.length === 0) {
        remindersContainer.innerHTML = '';
        noReminders.classList.remove('hidden');
        return;
    }
    
    noReminders.classList.add('hidden');
    
    // Sort reminders by date (soonest first)
    reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    remindersContainer.innerHTML = reminders.map(reminder => createReminderCard(reminder)).join('');
    
    // Add event listeners to all delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('.reminder-card').dataset.id;
            deleteReminder(id);
        });
    });
    
    // Add event listeners to all edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('.reminder-card').dataset.id;
            editReminder(id);
        });
    });
    
    // Add event listeners to all surprise buttons
    document.querySelectorAll('.surprise-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://www.fnp.com/', '_blank');
            
            // Add animation to the clicked button
            const btn = e.target.closest('.surprise-btn');
            btn.classList.add('animate-pulse');
            setTimeout(() => {
                btn.classList.remove('animate-pulse');
            }, 1000);
        });
    });
}

// Create HTML for a reminder card
function createReminderCard(reminder) {
    const isToday = checkIfToday(reminder);
    const todayClass = isToday ? 'glow-today' : '';
    
    // Format date for display
    const formattedDate = new Date(reminder.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Get category color and icon
    const categoryInfo = getCategoryInfo(reminder.category);
    
    return `
        <div class="reminder-card bg-gray-900 rounded-lg shadow-md p-4 border-l-4 ${categoryInfo.borderColor} ${todayClass}" data-id="${reminder.id}" data-aos="fade-up">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-semibold text-yellow-400">${reminder.name}</h3>
                    <div class="flex items-center mt-1 mb-2">
                        <span class="${categoryInfo.textColor} text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full flex items-center">
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                ${categoryInfo.icon}
                            </svg>
                            ${categoryInfo.label}
                        </span>
                        <span class="text-gray-400 text-sm">${formattedDate}</span>
                    </div>
                    ${reminder.note ? `<p class="text-gray-300 mt-2">${reminder.note}</p>` : ''}
                </div>
                <div class="flex space-x-2">
                    <button class="edit-btn text-yellow-400 hover:text-yellow-300 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn text-red-400 hover:text-red-300 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="mt-4 flex justify-end">
                <button class="surprise-btn bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-1 px-3 rounded text-sm transition duration-300 transform hover:scale-105">
                    Send a Surprise
                </button>
            </div>
        </div>
    `;
}

// Get category-specific styling and icons
function getCategoryInfo(category) {
    switch (category) {
        case 'birthday':
            return {
                label: 'Birthday',
                borderColor: 'border-blue-500',
                textColor: 'bg-blue-900 text-blue-300',
                icon: '<path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>'
            };
        case 'anniversary':
            return {
                label: 'Anniversary',
                borderColor: 'border-pink-500',
                textColor: 'bg-pink-900 text-pink-300',
                icon: '<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>'
            };
        default:
            return {
                label: 'Other',
                borderColor: 'border-purple-500',
                textColor: 'bg-purple-900 text-purple-300',
                icon: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>'
            };
    }
}

// Delete a reminder
function deleteReminder(id) {
    const reminders = getReminders().filter(reminder => reminder.id !== id);
    saveReminders(reminders);
    displayReminders(reminders);
}

// Edit a reminder
function editReminder(id) {
    const reminders = getReminders();
    const reminder = reminders.find(r => r.id === id);
    
    if (!reminder) return;
    
    // Fill the form with the reminder data
    nameInput.value = reminder.name;
    dateInput.value = reminder.date;
    noteInput.value = reminder.note || '';
    categoryInput.value = reminder.category;
    
    // Remove the reminder from the list
    const updatedReminders = reminders.filter(r => r.id !== id);
    saveReminders(updatedReminders);
    displayReminders(updatedReminders);
    
    // Scroll to the form
    document.getElementById('reminderForm').scrollIntoView({ behavior: 'smooth' });
    nameInput.focus();
}

// Filter reminders based on search input and category
function filterReminders() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    const filtered = getReminders().filter(reminder => {
        const matchesSearch = reminder.name.toLowerCase().includes(searchTerm) || 
                            (reminder.note && reminder.note.toLowerCase().includes(searchTerm));
        const matchesCategory = selectedCategory === 'all' || reminder.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    displayReminders(filtered);
}

// Check for reminders matching today's date
function checkTodayReminders() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const todaysReminders = getReminders().filter(reminder => {
        return reminder.date === todayString;
    });
    
    if (todaysReminders.length > 0) {
        showNotification(todaysReminders);
    }
}

// Check if a specific reminder is today
function checkIfToday(reminder) {
    const today = new Date();
    const reminderDate = new Date(reminder.date);
    
    return today.toDateString() === reminderDate.toDateString();
}

// Show browser notification for today's reminders
function showNotification(reminders) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    
    const names = reminders.map(r => r.name).join(', ');
    const title = reminders.length > 1 ? 
        `You have ${reminders.length} reminders today!` : 
        `You have a reminder today!`;
    
    const notification = new Notification(title, {
        body: `Don't forget about: ${names}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
        vibrate: [200, 100, 200]
    });
    
    notification.onclick = () => {
        window.focus();
    };
}