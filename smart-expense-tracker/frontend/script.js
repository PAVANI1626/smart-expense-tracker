const apiUrl = "http://127.0.0.1:8080/expenses";
const authUrl = "http://127.0.0.1:8080/auth";
function apiFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        credentials: "include"
    });
}

function showAuth(type) {
    document.getElementById("loginBox").style.display =
        type === "login" ? "block" : "none";

    document.getElementById("signupBox").style.display =
        type === "signup" ? "block" : "none";
}

document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const user = {
        name: document.getElementById("signupName").value,
        email: document.getElementById("signupEmail").value,
        password: document.getElementById("signupPassword").value
    };


   

    apiFetch(authUrl + "/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(response => response.text().then(message => {
        if (!response.ok) throw new Error(message);
        return message;
    }))
    .then(message => {
    document.getElementById("signupForm").reset();
    document.getElementById("signupError").textContent = "";
    showAuth("login");
})
    .catch(error => {
    document.getElementById("signupError").textContent =
        error.message.includes("409")
            ? "Account already exists. Please login."
            : "Signup failed. Please try again.";
});
});



function logout() {
    apiFetch(authUrl + "/logout", {
        method: "POST"
    })
    .then(response => response.text())
    .then(message => {
        alert(message);

        document.getElementById("appContainer").style.display = "none";
        document.getElementById("authContainer").style.display = "block";

        // Clear previous login details
        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";
        document.getElementById("loginError").textContent = "";
        document.getElementById("signupName").value = "";
document.getElementById("signupEmail").value = "";
document.getElementById("signupPassword").value = "";
document.getElementById("signupError").textContent = "";

        // Show empty login page
        showAuth("login");
    })
    .catch(error => alert("Logout failed"));
}



document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const user = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
    };

    apiFetch(authUrl + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(response => response.text().then(message => {
        if (!response.ok) throw new Error(message);
        return message;
    }))
    .then(message => {
        

        document.getElementById("authContainer").style.display = "none";
        document.getElementById("appContainer").style.display = "flex";

        showPage("dashboardPage");
    })
  .catch(error => {
    document.getElementById("loginError").textContent =
        error.message.includes("404")
            ? "Account does not exist. Please sign up."
            : error.message.includes("401")
            ? "Invalid password. Please try again."
            : "Login failed. Please try again.";
});
});


// Page Navigation
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });

    document.getElementById(pageId).style.display = "block";

    if (pageId === "dashboardPage") {
        loadDashboard();
        loadCategoryChart();
        loadMonthlyChart();
    }

    if (pageId === "expensesPage") {
        loadExpenses();
    }
}
// Load all expenses
function loadExpenses() {
    apiFetch(apiUrl + "/all")
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById("expenseTable");
            table.innerHTML = "";

            data.forEach(expense => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${expense.id}</td>
<td>${expense.title}</td>
<td>${expense.amount}</td>
<td>${expense.category}</td>
<td>${expense.expenseDate}</td>
<td>
    <button onclick="editExpense(${expense.id})">Edit</button>
    <button onclick="deleteExpense(${expense.id})">Delete</button>
</td>
                `;

                table.appendChild(row);
            });
        });
}

// Add expense
document.getElementById("expenseForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const expense = {
        title: document.getElementById("title").value,
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        expenseDate: document.getElementById("expenseDate").value,
        description: document.getElementById("description").value
    };

    apiFetch(apiUrl + "/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(expense)
    })
    .then(async response => {
    const message = await response.text();

    if (!response.ok) {
        throw new Error(message);
    }

    return message;
})
.then(message => {
    alert(message);
    document.getElementById("expenseForm").reset();
    loadExpenses();
    loadDashboard();
    loadCategoryChart();
    loadMonthlyChart();
})
.catch(error => alert(error.message));
    
    
});


function editExpense(id) {
    const newTitle = prompt("Enter new expense title:");

    if (newTitle === null || newTitle.trim() === "") {
        return;
    }

    const newAmount = prompt("Enter new amount:");

    if (newAmount === null || Number(newAmount) <= 0) {
        alert("Enter valid amount");
        return;
    }

    const newCategory = prompt("Enter new category:");

    if (newCategory === null || newCategory.trim() === "") {
        return;
    }

    const newDate = prompt("Enter date (YYYY-MM-DD):");

    if (newDate === null || newDate === "") {
        return;
    }

    const updatedExpense = {
        title: newTitle,
        amount: Number(newAmount),
        category: newCategory,
        expenseDate: newDate,
        description: "Updated expense"
    };

    apiFetch(apiUrl + "/update/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedExpense)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Update failed");
        }
        return response.text();
    })
    .then(message => {
       alert("Expense updated successfully!");
        loadExpenses();
        loadDashboard();
    })
    .catch(error => alert(error.message));
}

function deleteExpense(id) {
    // Delete code ikkada
}
// Delete expense
function deleteExpense(id) {
    apiFetch(apiUrl + "/delete/" + id, {
        method: "DELETE"
    })
    .then(response => response.text())
    .then(message => {
        alert("Expense deleted successfully!");
        loadExpenses();
        loadDashboard();
    });
}


// Load dashboard summary
function loadDashboard() {
    apiFetch(apiUrl + "/dashboard")
        .then(response => response.json())
        .then(data => {
            document.getElementById("totalExpenses").innerText =
                "₹" + data.totalExpenses;

            document.getElementById("totalCount").innerText =
                data.totalCount;

            document.getElementById("highestExpense").innerText =
                "₹" + data.highestExpense;

            document.getElementById("lowestExpense").innerText =
                "₹" + data.lowestExpense;
        });
}

loadDashboard();

// Load expenses when website opens
loadExpenses();



function searchExpense() {
    const title = document.getElementById("searchTitle").value;

    if (title.trim() === "") {
        alert("Please enter expense title");
        return;
    }

    apiFetch(apiUrl + "/search/" + encodeURIComponent(title))
        .then(response => {
            if (!response.ok) {
                throw new Error("Expense not found");
            }
            return response.json();
        })
        .then(data => {
            const table = document.getElementById("expenseTable");
            table.innerHTML = "";

            data.forEach(expense => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${expense.id}</td>
                    <td>${expense.title}</td>
                    <td>${expense.amount}</td>
                    <td>${expense.category}</td>
                    <td>${expense.expenseDate}</td>
                    <td>
                        <button onclick="editExpense(${expense.id})">Edit</button>
                        <button onclick="deleteExpense(${expense.id})">Delete</button>
                    </td>
                `;

                table.appendChild(row);
            });
        })
        .catch(error => alert(error.message));
}


function filterExpenses() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (startDate === "" || endDate === "") {
        alert("Please select both dates");
        return;
    }

    if (startDate > endDate) {
        alert("Start date should be before end date");
        return;
    }

    apiFetch(apiUrl + "/filter?startDate=" + startDate + "&endDate=" + endDate)
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById("expenseTable");
            table.innerHTML = "";

            data.forEach(expense => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${expense.id}</td>
                    <td>${expense.title}</td>
                    <td>${expense.amount}</td>
                    <td>${expense.category}</td>
                    <td>${expense.expenseDate}</td>
                    <td>
                        <button onclick="editExpense(${expense.id})">Edit</button>
                        <button onclick="deleteExpense(${expense.id})">Delete</button>
                    </td>
                `;

                table.appendChild(row);
            });
        })
        .catch(error => alert("Unable to filter expenses"));
}



let expenseChartInstance = null;

function loadCategoryChart() {
    apiFetch(apiUrl + "/category-summary")
        .then(response => response.json())
        .then(data => {
            const categories = data.map(item => item.category);
            const amounts = data.map(item => item.total);

            const ctx = document.getElementById("expenseChart");

            if (expenseChartInstance !== null) {
                expenseChartInstance.destroy();
            }

            expenseChartInstance = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: categories,
                    datasets: [{
                        label: "Expenses",
                        data: amounts
                    }]
                },
                options: {
                    responsive: true
                }
            });
        });
}



let monthlyChartInstance = null;

function loadMonthlyChart() {
    const year = document.getElementById("yearSelect").value;
    const months = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ];

    const requests = [];

    for (let month = 1; month <= 12; month++) {
        requests.push(
            apiFetch(apiUrl + "/monthly/" + year + "/" + month)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Monthly data loading failed");
                    }
                    return response.json();
                })
        );
    }

    Promise.all(requests)
        .then(amounts => {
            const ctx = document.getElementById("monthlyChart");

            if (monthlyChartInstance !== null) {
                monthlyChartInstance.destroy();
            }

            monthlyChartInstance = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: months,
                    datasets: [{
                        label: "Monthly Expenses (₹)",
                        data: amounts
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => alert(error.message));
}



function exportExpenses() {
    apiFetch(apiUrl + "/all")
        .then(response => response.json())
        .then(data => {
            let csv = "ID,Title,Amount,Category,Date,Description\n";

            data.forEach(expense => {
                csv += `${expense.id},${expense.title},${expense.amount},${expense.category},${expense.expenseDate},${expense.description}\n`;
            });

            const blob = new Blob([csv], {
                type: "text/csv"
            });

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "expenses.csv";
            link.click();

            URL.revokeObjectURL(url);
        })
        .catch(error => alert("Unable to export expenses"));
}
apiFetch(authUrl + "/me")
    .then(response => {
        if (response.ok) {
            document.getElementById("authContainer").style.display = "none";
            document.getElementById("appContainer").style.display = "flex";
            showPage("dashboardPage");
        } else {
            document.getElementById("authContainer").style.display = "block";
            document.getElementById("appContainer").style.display = "none";
        }
    })
    .catch(() => {
        document.getElementById("authContainer").style.display = "block";
        document.getElementById("appContainer").style.display = "none";
    });