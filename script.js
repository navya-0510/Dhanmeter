// DOM Elements
const themeToggle = document.getElementById("theme-toggle");
const addExpenseBtn = document.getElementById("add-expense");
const expenseTitle = document.getElementById("expense-title");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");
const expenseDate = document.getElementById("expense-date");
const expenseList = document.getElementById("expense-list");
const totalExpensesEl = document.getElementById("total-expenses");
const monthExpensesEl = document.getElementById("month-expenses");
const categoryFilter = document.getElementById("category-filter");
const navTabs = document.querySelectorAll(".nav-tab");
const tabContents = document.querySelectorAll(".tab-content");
const footerBtns = document.querySelectorAll(".footer-btn");
const categoryBtns = document.querySelectorAll(".category-btn");
const categoryTableBody = document.getElementById("category-table-body");
const monthlyBudgetInput = document.getElementById("monthly-budget");
const saveBudgetBtn = document.getElementById("save-budget");
const exportDataBtn = document.getElementById("export-data");
const clearDataBtn = document.getElementById("clear-data");
const themeOptionBtns = document.querySelectorAll(".theme-option-btn");
const budgetWarning = document.getElementById("budget-warning");

// Chart variables
let expenseChart = null;
let categoryPieChart = null;

// App state
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let currentFilter = "all";
let currentTab = "expenses";
let monthlyBudget = parseFloat(localStorage.getItem("monthlyBudget")) || 0;

// Initialize date to today
expenseDate.valueAsDate = new Date();

// Initialize monthly budget input
monthlyBudgetInput.value = monthlyBudget;

// Theme Toggle
themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "dark") {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
    }
    updateChartsTheme();
});

// Apply saved theme
if (localStorage.getItem("theme") === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
}

// Add Expense
addExpenseBtn.addEventListener("click", () => {
    const title = expenseTitle.value.trim();
    const amount = parseFloat(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    if (title && amount && amount > 0 && date) {
        const newExpense = {
            id: Date.now(),
            title,
            amount,
            category,
            date,
        };

        expenses.push(newExpense);
        saveExpenses();
        renderExpenses();
        renderCharts();
        checkBudgetWarning();

        // Reset form
        expenseTitle.value = "";
        expenseAmount.value = "";
        expenseDate.valueAsDate = new Date();
    } else {
        alert("Please fill all fields with valid values");
    }
});

// Delete Expense
function deleteExpense(id) {
    expenses = expenses.filter((expense) => expense.id !== id);
    saveExpenses();
    renderExpenses();
    renderCharts();
    checkBudgetWarning();
}

// Save to localStorage
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Render expenses
function renderExpenses() {
    expenseList.innerHTML = "";

    let filteredExpenses = expenses;
    if (currentFilter !== "all") {
        filteredExpenses = expenses.filter(
            (expense) => expense.category === currentFilter
        );
    }

    if (filteredExpenses.length === 0) {
        expenseList.innerHTML =
            '<div class="empty-state"><p>No expenses found</p></div>';
    } else {
        filteredExpenses.forEach((expense) => {
            const expenseItem = document.createElement("div");
            expenseItem.className = "expense-item";
            expenseItem.innerHTML = `
                <div class="expense-info">
                    <div class="expense-title">${expense.title}</div>
                    <div>
                        <span class="expense-category">${getCategoryName(
                            expense.category
                        )}</span>
                        <span class="expense-date">${formatDate(expense.date)}</span>
                    </div>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                <button class="delete-btn" onclick="deleteExpense(${expense.id})">✕</button>
            `;
            expenseList.appendChild(expenseItem);
        });
    }

    calculateTotal();
}

// Format date
function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
}

// Get category name
function getCategoryName(category) {
    const categories = {
        food: "Food & Dining",
        transport: "Transportation",
        shopping: "Shopping",
        housing: "Housing",
        entertainment: "Entertainment",
        utilities: "Utilities",
        health: "Health",
        education: "Education",
        other: "Other",
    };
    return categories[category] || category;
}

// Calculate totals
function calculateTotal() {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpensesEl.textContent = `₹${total.toFixed(2)}`;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthExpenses = expenses
        .filter((expense) => {
            const date = new Date(expense.date);
            return (
                date.getMonth() === currentMonth && date.getFullYear() === currentYear
            );
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

    monthExpensesEl.textContent = `₹${monthExpenses.toFixed(2)}`;
}

// Category filter
categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        currentFilter = btn.getAttribute("data-category");
        categoryBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderExpenses();
    });
});

// Tab switching
function switchTab(tabId) {
    currentTab = tabId;
    
    navTabs.forEach((tab) => {
        tab.classList.toggle("active", tab.getAttribute("data-tab") === tabId);
    });

    footerBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    tabContents.forEach((content) => {
        content.style.display = content.id === `${tabId}-tab` ? "block" : "none";
    });

    // Render charts when switching to analytics or categories tab
    if (tabId === "analytics" || tabId === "categories") {
        renderCharts();
    }
}

// Tab event listeners
navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        switchTab(tab.getAttribute("data-tab"));
    });
});

footerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        switchTab(btn.getAttribute("data-tab"));
    });
});

// Budget Functions
function saveBudget() {
    monthlyBudget = parseFloat(monthlyBudgetInput.value) || 0;
    localStorage.setItem("monthlyBudget", monthlyBudget);
    checkBudgetWarning();
}

function checkBudgetWarning() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthExpenses = expenses
        .filter((expense) => {
            const date = new Date(expense.date);
            return (
                date.getMonth() === currentMonth && date.getFullYear() === currentYear
            );
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

    if (monthlyBudget > 0 && monthExpenses > monthlyBudget) {
        budgetWarning.classList.remove("hidden");
    } else {
        budgetWarning.classList.add("hidden");
    }
}

// Theme option buttons
themeOptionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const theme = btn.getAttribute("data-theme");
        setTheme(theme);
        themeOptionBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

function setTheme(theme) {
    if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
    updateChartsTheme();
}

// Export data
exportDataBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify(expenses);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'expense-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

// Clear data
clearDataBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
        expenses = [];
        saveExpenses();
        renderExpenses();
        renderCharts();
    }
});

// Initialize theme options
const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);
themeOptionBtns.forEach((btn) => {
    if (btn.getAttribute("data-theme") === savedTheme) {
        btn.classList.add("active");
    }
});

// Render all charts
function renderCharts() {
    if (currentTab === "analytics") {
        renderBarChart();
    } else if (currentTab === "categories") {
        renderPieChart();
        renderCategoryTable();
    }
}

// Render bar chart
function renderBarChart() {
    const ctx = document.getElementById("expenseChart");
    if (!ctx) return;

    // Calculate category totals
    const categoryTotals = {};
    expenses.forEach((exp) => {
        categoryTotals[exp.category] =
            (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
    });

    // Sort categories by amount (descending)
    const sortedCategories = Object.keys(categoryTotals).sort(
        (a, b) => categoryTotals[b] - categoryTotals[a]
    );

    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(67, 97, 238, 0.7)',
        'rgba(238, 67, 97, 0.7)',
        'rgba(97, 238, 67, 0.7)'
    ];

    // Destroy previous chart if it exists
    if (expenseChart) {
        expenseChart.destroy();
    }

    // Create new chart
    expenseChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: sortedCategories.map(getCategoryName),
            datasets: [
                {
                    label: "Amount (₹)",
                    data: sortedCategories.map((cat) => categoryTotals[cat]),
                    backgroundColor: backgroundColors.slice(0, sortedCategories.length),
                    borderColor: backgroundColors.map(color => color.replace('0.7', '1')).slice(0, sortedCategories.length),
                    borderWidth: 1
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Expenses by Category',
                    color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                        callback: function(value) {
                            return '₹' + value;
                        }
                    },
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-color')
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-color')
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Render pie chart
function renderPieChart() {
    const ctx = document.getElementById("categoryPieChart");
    if (!ctx) return;

    // Calculate category totals
    const categoryTotals = {};
    expenses.forEach((exp) => {
        categoryTotals[exp.category] =
            (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
    });

    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    const sortedCategories = Object.keys(categoryTotals).sort(
        (a, b) => categoryTotals[b] - categoryTotals[a]
    );

    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(67, 97, 238, 0.7)',
        'rgba(238, 67, 97, 0.7)',
        'rgba(97, 238, 67, 0.7)'
    ];

    // Destroy previous chart if it exists
    if (categoryPieChart) {
        categoryPieChart.destroy();
    }

    // Create new chart
    categoryPieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: sortedCategories.map(getCategoryName),
            datasets: [
                {
                    data: sortedCategories.map((cat) => categoryTotals[cat]),
                    backgroundColor: backgroundColors.slice(0, sortedCategories.length),
                    borderColor: getComputedStyle(document.body).getPropertyValue('--card-color'),
                    borderWidth: 1
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Spending Distribution',
                    color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / totalAmount) * 100).toFixed(1);
                            return `${context.label}: ₹${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render category table
function renderCategoryTable() {
    categoryTableBody.innerHTML = "";

    // Calculate category totals
    const categoryTotals = {};
    expenses.forEach((exp) => {
        categoryTotals[exp.category] =
            (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
    });

    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    // Sort categories by amount (descending)
    const sortedCategories = Object.keys(categoryTotals).sort(
        (a, b) => categoryTotals[b] - categoryTotals[a]
    );

    if (sortedCategories.length === 0) {
        categoryTableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center;">No expenses to display</td>
            </tr>
        `;
        return;
    }

    sortedCategories.forEach((category) => {
        const amount = categoryTotals[category];
        const percentage = ((amount / totalAmount) * 100).toFixed(1);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${getCategoryName(category)}</td>
            <td>₹${amount.toFixed(2)}</td>
            <td>${percentage}%</td>
        `;
        categoryTableBody.appendChild(row);
    });
}

// Update charts theme when theme changes
function updateChartsTheme() {
    if (expenseChart) {
        expenseChart.options.plugins.title.color = getComputedStyle(document.body).getPropertyValue('--text-color');
        expenseChart.options.scales.y.ticks.color = getComputedStyle(document.body).getPropertyValue('--text-color');
        expenseChart.options.scales.x.ticks.color = getComputedStyle(document.body).getPropertyValue('--text-color');
        expenseChart.options.scales.y.grid.color = getComputedStyle(document.body).getPropertyValue('--border-color');
        expenseChart.update();
    }

    if (categoryPieChart) {
        categoryPieChart.options.plugins.title.color = getComputedStyle(document.body).getPropertyValue('--text-color');
        categoryPieChart.options.plugins.legend.labels.color = getComputedStyle(document.body).getPropertyValue('--text-color');
        categoryPieChart.update();
    }
}

// Event listeners for settings
saveBudgetBtn.addEventListener("click", saveBudget);
checkBudgetWarning();

// Initial render
renderExpenses();
switchTab("expenses");

// Make deleteExpense available globally
window.deleteExpense = deleteExpense;
