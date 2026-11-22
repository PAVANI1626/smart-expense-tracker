const apiUrl = "http://localhost:8080/expenses";

// Load all expenses
function loadExpenses() {
    fetch(apiUrl + "/all")
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

    fetch(apiUrl + "/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(expense)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Please enter valid expense details.");
        }
        return response.text();
    })
    .then(message => {
        alert(message);
        document.getElementById("expenseForm").reset();
        loadExpenses();
        loadDashboard();
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

    fetch(apiUrl + "/update/" + id, {
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
    fetch(apiUrl + "/delete/" + id, {
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
    fetch(apiUrl + "/dashboard")
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

    fetch(apiUrl + "/search/" + encodeURIComponent(title))
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

    fetch(apiUrl + "/filter?startDate=" + startDate + "&endDate=" + endDate)
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
    fetch(apiUrl + "/category-summary")
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

loadCategoryChart();


let monthlyChartInstance = null;

function loadMonthlyChart() {
    const year = new Date().getFullYear();

    const months = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ];

    const requests = [];

    for (let month = 1; month <= 12; month++) {
        requests.push(
            fetch(apiUrl + "/monthly/" + year + "/" + month)
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

loadMonthlyChart();


function exportExpenses() {
    fetch(apiUrl + "/all")
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
alert("Expense added successfully!");