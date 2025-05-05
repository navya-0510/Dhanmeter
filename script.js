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

// Initialize expenses from localStorage or empty array
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

// Check for saved theme preference
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
}

// Save expenses to localStorage
function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Filter expenses by category
function filterExpenses(category) {
  currentFilter = category;
  renderExpenses();
}

// Calculate total expenses
function calculateTotal() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalExpensesEl.textContent = `₹${total.toFixed(2)}`;

  // Calculate this month's expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  monthExpensesEl.textContent = `₹${monthExpenses.toFixed(2)}`;
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
      <button class="delete-btn" onclick="deleteExpense(${
        expense.id
      })">✕</button>
    `;
      expenseList.appendChild(expenseItem);
    });
  }

  calculateTotal();
}

// Helper function to format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
}

// Helper function to get category name
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

// Tab switching
navTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabId = tab.getAttribute("data-tab");
    switchTab(tabId);
  });
});

footerBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabId = btn.getAttribute("data-tab");
    switchTab(tabId);
  });
});

function switchTab(tabId) {
  // Update active tab in navigation
  navTabs.forEach((tab) => {
    if (tab.getAttribute("data-tab") === tabId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Update active tab in footer
  footerBtns.forEach((btn) => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Show/hide tab content
  tabContents.forEach((content) => {
    if (content.id === `${tabId}-tab`) {
      content.style.display = "block";
    } else {
      content.style.display = "none";
    }
  });

  currentTab = tabId;
}

// Category filter buttons
categoryBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const category = btn.getAttribute("data-category");
    categoryBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filterExpenses(category);
  });
});

// Initial render
renderExpenses();
