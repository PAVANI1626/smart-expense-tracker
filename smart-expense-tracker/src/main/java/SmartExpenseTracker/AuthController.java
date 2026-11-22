
package SmartExpenseTracker;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowCredentials = "true"
)
public class AuthController {

    private final JdbcTemplate jdbcTemplate;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/signup")
    public String signup(@RequestBody Map<String, String> data) {

        String name = data.get("name");
        String email = data.get("email");
        String password = data.get("password");

        if (name == null || name.isBlank()
                || email == null || email.isBlank()
                || password == null || password.length() < 8) {
            throw new IllegalArgumentException(
                "Enter name, email and a password of at least 8 characters"
            );
        }

        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users WHERE email = ?",
            Integer.class, email
        );

        if (count != null && count > 0) {
            throw new ResponseStatusException(
    HttpStatus.CONFLICT,
    "Account already exists. Please login."
);
        }

        String hashedPassword = passwordEncoder.encode(password);

        jdbcTemplate.update(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            name, email, hashedPassword
        );

        return "Registration successful!";
    }

   @PostMapping("/login")
public String login(
        @RequestBody Map<String, String> data,
        HttpSession session) {

    String email = data.get("email");
    String password = data.get("password");

    var users = jdbcTemplate.queryForList(
        "SELECT * FROM users WHERE email = ?", email
    );

    if (users.isEmpty()) {
    throw new ResponseStatusException(
        HttpStatus.NOT_FOUND,
        "Account does not exist. Please sign up."
    );
}


    int userId = (Integer) users.get(0).get("id");
    String savedPassword = (String) users.get(0).get("password");

    if (!passwordEncoder.matches(password, savedPassword)) {
    throw new ResponseStatusException(
        HttpStatus.UNAUTHORIZED,
        "Invalid password. Please try again."
    );
}

    session.setAttribute("userId", userId);

    return "Login successful!";
}
@GetMapping("/me")
public Map<String, Object> checkLogin(HttpSession session) {
    Integer userId = (Integer) session.getAttribute("userId");

    if (userId == null) {
        throw new ResponseStatusException(
            HttpStatus.UNAUTHORIZED, "Please login first"
        );
    }

    return Map.of(
        "loggedIn", true,
        "userId", userId
    );
}

@PostMapping("/logout")
public String logout(HttpSession session) {
    session.invalidate();
    return "Logout successful!";
}






}
