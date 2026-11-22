
package SmartExpenseTracker;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DatabaseController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/test-db")
    public String testDatabase() {

        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM expenses",
            Integer.class
        );

        return "Database connected successfully! Total expenses: " + count;
    }
}
