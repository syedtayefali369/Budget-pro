// Initialize Chart.js
let categoryChart;

// Expense categories with colors
const categoryColors = {
    food: '#FF6384',
    transport: '#36A2EB',
    shopping: '#FFCE56',
    entertainment: '#4BC0C0',
    bills: '#9966FF',
    health: '#FF9F40',
    education: '#C9CBCF',
    other: '#42A5F5'
};

// Sample initial data
const initialTransactions = [
    { id: 1, title: "Groceries", amount: 85.50, type: "expense", category: "food", date: "2024-01-15", description: "Weekly grocery shopping" },
    { id: 2, title: "Salary", amount: 2500.00, type: "income", category: "other", date: "2024-01-01", description: "Monthly salary" },
    { id: 3, title: "Gas", amount: 45.00, type: "expense", category: "transport", date: "2024-01-14", description: "Car fuel" },
    { id: 4, title: "Netflix", amount: 15.99, type: "expense", category: "entertainment", date: "2024-01-10", description: "Monthly subscription" },
    { id: 5, title: "Electric Bill", amount: 120.75, type: "expense", category: "bills", date: "2024-01-05", description: "December bill" }
];

// Load transactions from localStorage or use initial data
let transactions = JSON.parse(localStorage.getItem('expenseTransactions')) || initialTransactions;

// DOM elements
const expenseForm = document.getElementById('expenseForm');
const transactionsList = document.getElementById('transactionsList');
const totalBalance = document.getElementById('totalBalance');
const totalIncome = document.getElementById('totalIncome');
const totalExpense = document.getElementById('totalExpense');
const filterType = document.getElementById('filterType');
const filterCategory = document.getElementById('filterCategory');
const clearFiltersBtn = document.getElementById('clearFilters');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    // Load and display transactions
    updateDashboard();
    renderTransactions();
    updateChart();
    
    // Form submission
    expenseForm.addEventListener('submit', addTransaction);
    
    // Filter events
    filterType.addEventListener('change', renderTransactions);
    filterCategory.addEventListener('change', renderTransactions);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // File operations
    exportBtn.addEventListener('click', exportToFile);
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importFromFile);
});

// Add a new transaction
function addTransaction(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    // Create new transaction
    const newTransaction = {
        id: Date.now(), // Simple unique ID
        title,
        amount,
        type,
        category,
        date,
        description
    };
    
    // Add to transactions array
    transactions.unshift(newTransaction);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update UI
    updateDashboard();
    renderTransactions();
    updateChart();
    
    // Reset form
    expenseForm.reset();
    document.getElementById('date').valueAsDate = new Date();
    
    // Show success message
    showNotification('Transaction added successfully!', 'success');
}

// Delete a transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveToLocalStorage();
        updateDashboard();
        renderTransactions();
        updateChart();
        showNotification('Transaction deleted!', 'error');
    }
}

// Save transactions to localStorage
function saveToLocalStorage() {
    localStorage.setItem('expenseTransactions', JSON.stringify(transactions));
}

// Update dashboard totals
function updateDashboard() {
    let totalIncomeAmount = 0;
    let totalExpenseAmount = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncomeAmount += transaction.amount;
        } else {
            totalExpenseAmount += transaction.amount;
        }
    });
    
    const balance = totalIncomeAmount - totalExpenseAmount;
    
    totalBalance.textContent = `$${balance.toFixed(2)}`;
    totalIncome.textContent = `$${totalIncomeAmount.toFixed(2)}`;
    totalExpense.textContent = `$${totalExpenseAmount.toFixed(2)}`;
    
    // Update balance color based on value
    totalBalance.style.color = balance >= 0 ? '#2ecc71' : '#e74c3c';
}

// Render transactions list
function renderTransactions() {
    const typeFilter = filterType.value;
    const categoryFilter = filterCategory.value;
    
    // Filter transactions
    let filteredTransactions = transactions.filter(transaction => {
        const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
        const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
        return typeMatch && categoryMatch;
    });
    
    // Clear current list
    transactionsList.innerHTML = '';
    
    // Check if there are transactions
    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-state">No transactions found matching your filters.</p>';
        return;
    }
    
    // Add each transaction to the list
    filteredTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = `transaction-item ${transaction.type}`;
        transactionElement.innerHTML = `
            <div class="transaction-info">
                <h4>${transaction.title}</h4>
                <p>
                    <i class="fas fa-calendar"></i> ${formatDate(transaction.date)} 
                    <i class="fas fa-filter"></i> ${formatCategory(transaction.category)}
                    ${transaction.description ? `<br><small><i class="fas fa-file-alt"></i> ${transaction.description}</small>` : ''}
                </p>
            </div>
            <div class="transaction-details">
                <div class="transaction-amount">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </div>
                <div class="transaction-actions">
                    <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        transactionsList.appendChild(transactionElement);
    });
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format category for display
function formatCategory(category) {
    const categoryNames = {
        food: 'Food & Dining',
        transport: 'Transportation',
        shopping: 'Shopping',
        entertainment: 'Entertainment',
        bills: 'Bills & Utilities',
        health: 'Health & Medical',
        education: 'Education',
        other: 'Other'
    };
    return categoryNames[category] || category;
}

// Clear all filters
function clearFilters() {
    filterType.value = 'all';
    filterCategory.value = 'all';
    renderTransactions();
}

// Export transactions to JSON file
function exportToFile() {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data exported successfully!', 'success');
}

// Import transactions from JSON file
function importFromFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedTransactions = JSON.parse(event.target.result);
            
            if (Array.isArray(importedTransactions) && importedTransactions.length > 0) {
                // Validate the imported data structure
                const isValid = importedTransactions.every(item => 
                    item.title && item.amount && item.type && item.category && item.date
                );
                
                if (isValid) {
                    // Add imported transactions to current data
                    transactions = [...importedTransactions, ...transactions];
                    saveToLocalStorage();
                    updateDashboard();
                    renderTransactions();
                    updateChart();
                    
                    // Clear file input
                    fileInput.value = '';
                    
                    showNotification(`${importedTransactions.length} transactions imported successfully!`, 'success');
                } else {
                    throw new Error('Invalid data format');
                }
            } else {
                throw new Error('No valid transactions found in file');
            }
        } catch (error) {
            alert('Error importing file. Please make sure it is a valid expense tracker JSON file.');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

// Update the chart
function updateChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Calculate totals by category for expenses only
    const categoryTotals = {};
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            categoryTotals[transaction.category] = 
                (categoryTotals[transaction.category] || 0) + transaction.amount;
        }
    });
    
    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    const colors = categories.map(cat => categoryColors[cat] || '#CCCCCC');
    
    // Destroy existing chart if it exists
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    // Create new chart
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories.map(formatCategory),
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = amounts.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${formatCategory(context.label)}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
// Add to script.js after export button
const reportBtn = document.createElement('button');
reportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Generate Monthly Report';
reportBtn.className = 'btn-file';
reportBtn.onclick = generateMonthlyReport;

// Add this function
function generateMonthlyReport() {
    const month = prompt("Enter month and year (e.g., January 2024):", 
        new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
    
    if (!month) return;
    
    const monthlyTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        const transMonth = transDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        return transMonth === month;
    });
    
    if (monthlyTransactions.length === 0) {
        alert(`No transactions found for ${month}`);
        return;
    }
    
    // Calculate totals
    const income = monthlyTransactions.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthlyTransactions.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Create report content
    let report = `Monthly Expense Report - ${month}\n`;
    report += '='.repeat(50) + '\n\n';
    report += `Total Income: $${income.toFixed(2)}\n`;
    report += `Total Expenses: $${expenses.toFixed(2)}\n`;
    report += `Net Savings: $${(income - expenses).toFixed(2)}\n\n`;
    report += 'TRANSACTION DETAILS:\n';
    report += '-'.repeat(50) + '\n';
    
    monthlyTransactions.forEach((t, i) => {
        report += `${i+1}. ${t.date} - ${t.title}\n`;
        report += `   Type: ${t.type} | Category: ${formatCategory(t.category)}\n`;
        report += `   Amount: $${t.amount.toFixed(2)}\n`;
        if (t.description) report += `   Notes: ${t.description}\n`;
        report += '\n';
    });
    
    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expense_Report_${month.replace(' ', '_')}.txt`;
    a.click();
    
    showNotification(`Report for ${month} generated!`, 'success');
}
// Add to updateDashboard() function
function showQuickStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = transactions
        .filter(t => t.date === today && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = transactions
        .filter(t => {
            const transDate = new Date(t.date);
            const now = new Date();
            return transDate.getMonth() === now.getMonth() && 
                   transDate.getFullYear() === now.getFullYear() &&
                   t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Create or update stats display
    let statsDiv = document.getElementById('quickStats');
    if (!statsDiv) {
        statsDiv = document.createElement('div');
        statsDiv.id = 'quickStats';
        statsDiv.className = 'quick-stats';
        document.querySelector('.dashboard').appendChild(statsDiv);
    }
    
    statsDiv.innerHTML = `
        <div class="stat-item">
            <small>Today's Spending</small>
            <strong>$${todayExpenses.toFixed(2)}</strong>
        </div>
        <div class="stat-item">
            <small>This Month</small>
            <strong>$${monthlyExpenses.toFixed(2)}</strong>
        </div>
    `;
}