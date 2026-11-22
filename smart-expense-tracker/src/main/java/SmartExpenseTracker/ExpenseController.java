
package SmartExpenseTracker;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;



@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowCredentials = "true"
)
@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    private final JdbcTemplate jdbcTemplate;

    public ExpenseController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

private int getLoggedInUserId(HttpSession session) {

    Integer userId = (Integer) session.getAttribute("userId");

    if (userId == null) {
        throw new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Please login first"
        );
    }

    return userId;
}




   @PostMapping("/add")
public String addExpense(
        @Valid @RequestBody Expense expense,
        HttpSession session) {

    int userId = getLoggedInUserId(session);

    String sql = "INSERT INTO expenses " +
            "(title, amount, category, expense_date, description, user_id) " +
            "VALUES (?, ?, ?, ?, ?, ?)";

    jdbcTemplate.update(
            sql,
            expense.getTitle(),
            expense.getAmount(),
            expense.getCategory(),
            expense.getExpenseDate(),
            expense.getDescription(),
            userId
    );

    return "Expense added successfully!";
}
    


@GetMapping("/all")
public List<Expense> getAllExpenses(HttpSession session) {

    int userId = getLoggedInUserId(session);

    String sql = "SELECT * FROM expenses WHERE user_id = ?";

    return jdbcTemplate.query(sql, (rs, rowNum) -> {

        Expense expense = new Expense();

        expense.setId(rs.getInt("id"));
        expense.setTitle(rs.getString("title"));
        expense.setAmount(rs.getDouble("amount"));
        expense.setCategory(rs.getString("category"));

        expense.setExpenseDate(
            rs.getDate("expense_date").toLocalDate()
        );

        expense.setDescription(rs.getString("description"));

        return expense;
    }, userId);
}







@DeleteMapping("/delete/{id}")
public String deleteExpense(
        @PathVariable int id,
        HttpSession session) {

    int userId = getLoggedInUserId(session);

    String sql = "DELETE FROM expenses WHERE id = ? AND user_id = ?";

    int rows = jdbcTemplate.update(sql, id, userId);

    if (rows > 0) {
        return "Expense deleted successfully!";
    } else {
        return "Expense not found!";
    }
}


@PutMapping("/update/{id}")
public String updateExpense(
        @PathVariable int id,
        @RequestBody Expense expense,
        HttpSession session) {

    int userId = getLoggedInUserId(session);

    String sql = "UPDATE expenses SET title = ?, amount = ?, " +
            "category = ?, expense_date = ?, description = ? " +
            "WHERE id = ? AND user_id = ?";

    int rows = jdbcTemplate.update(
        sql,
        expense.getTitle(),
        expense.getAmount(),
        expense.getCategory(),
        expense.getExpenseDate(),
        expense.getDescription(),
        id,
        userId
    );

    if (rows > 0) {
        return "Expense updated successfully!";
    } else {
        return "Expense not found!";
    }
}

@GetMapping("/total")
public double getTotalExpenses(HttpSession session) {

    int userId = getLoggedInUserId(session);

    String sql = "SELECT COALESCE(SUM(amount), 0) " +
                 "FROM expenses WHERE user_id = ?";

    Double total = jdbcTemplate.queryForObject(
        sql,
        Double.class,
        userId
    );

    return total;
}
@GetMapping("/monthly/{year}/{month}")
public double getMonthlyExpenses(
        @PathVariable int year,
        @PathVariable int month,
        HttpSession session) {

    int userId = getLoggedInUserId(session);

    String sql = "SELECT COALESCE(SUM(amount), 0) FROM expenses " +
                 "WHERE YEAR(expense_date) = ? " +
                 "AND MONTH(expense_date) = ? " +
                 "AND user_id = ?";

    Double total = jdbcTemplate.queryForObject(
            sql, Double.class, year, month, userId);

    return total;
}

@GetMapping("/category-summary")
public List<Map<String, Object>> getCategorySummary(
        HttpSession session) {

    int userId = getLoggedInUserId(session);

    String sql = "SELECT category, SUM(amount) AS total " +
                 "FROM expenses WHERE user_id = ? " +
                 "GROUP BY category";

    return jdbcTemplate.queryForList(sql, userId);
}


@GetMapping("/search/{title}")
public List<Expense> searchExpenses(
        @PathVariable String title,
        HttpSession session) {

    int userId = getLoggedInUserId(session);

    String sql = "SELECT * FROM expenses " +
                 "WHERE title LIKE ? AND user_id = ?";

    return jdbcTemplate.query(sql, (rs, rowNum) -> {

        Expense expense = new Expense();

        expense.setId(rs.getInt("id"));
        expense.setTitle(rs.getString("title"));
        expense.setAmount(rs.getDouble("amount"));
        expense.setCategory(rs.getString("category"));
        expense.setExpenseDate(
            rs.getDate("expense_date").toLocalDate()
        );
        expense.setDescription(rs.getString("description"));

        return expense;

    }, "%" + title + "%", userId);
}

@GetMapping("/filter")
public List<Expense> filterExpenses(
        @RequestParam String startDate,
        @RequestParam String endDate,
        HttpSession session) {

    int userId = getLoggedInUserId(session);

    String sql = "SELECT * FROM expenses " +
                 "WHERE expense_date BETWEEN ? AND ? " +
                 "AND user_id = ?";

    return jdbcTemplate.query(sql, (rs, rowNum) -> {

        Expense expense = new Expense();

        expense.setId(rs.getInt("id"));
        expense.setTitle(rs.getString("title"));
        expense.setAmount(rs.getDouble("amount"));
        expense.setCategory(rs.getString("category"));
        expense.setExpenseDate(
            rs.getDate("expense_date").toLocalDate()
        );
        expense.setDescription(rs.getString("description"));

        return expense;

    }, startDate, endDate, userId);
}

@GetMapping("/dashboard")
public Map<String, Object> getDashboard(HttpSession session) {

    int userId = getLoggedInUserId(session);

    String sql = "SELECT " +
            "COALESCE(SUM(amount), 0) AS totalExpenses, " +
            "COUNT(*) AS totalCount, " +
            "COALESCE(MAX(amount), 0) AS highestExpense, " +
            "COALESCE(MIN(amount), 0) AS lowestExpense " +
            "FROM expenses WHERE user_id = ?";

    return jdbcTemplate.queryForMap(sql, userId);
}












}
