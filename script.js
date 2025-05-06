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

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let currentFilter = "all";
let currentTab = "expenses";

// Initialize date to today
expenseDate.valueAsDate = new Date();

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
    renderChart(expenses);

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
  renderChart(expenses);
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
      '<p style="text-align: center; color: var(--text-color);">No expenses found</p>';
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
    food: "Food",
    transport: "Transport",
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
  navTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.getAttribute("data-tab") === tabId);
  });

  footerBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
  });

  tabContents.forEach((content) => {
    content.style.display = content.id === `${tabId}-tab` ? "block" : "none";
  });

  currentTab = tabId;
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

// Render chart
function renderChart(expenses) {
  const ctxPlaceholder = document.querySelector(".chart-placeholder");
  if (!ctxPlaceholder) return;

  // Clear existing chart
  ctxPlaceholder.innerHTML = '<canvas id="expenseChart"></canvas>';
  const ctx = document.getElementById("expenseChart").getContext("2d");

  const categoryTotals = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(categoryTotals).map(getCategoryName),
      datasets: [
        {
          label: "Expenses by Category",
          data: Object.values(categoryTotals),
          backgroundColor: "rgba(67, 97, 238, 0.6)",
          borderColor: "rgba(67, 97, 238, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// Initial render
renderExpenses();
renderChart(expenses);
