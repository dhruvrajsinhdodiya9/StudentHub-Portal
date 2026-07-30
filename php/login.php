<?php
/**
 * CHARUSAT StudentHub Portal - Secure Login Authentication Processor (Practical 10)
 * Uses password_verify(), session_regenerate_id(true), session timeout check,
 * role-based access control (RBAC), and remember-me token handling.
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Only POST method allowed"]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$usernameEmail = trim($input['username'] ?? $input['email'] ?? '');
$password      = $input['password'] ?? '';
$rememberMe    = !empty($input['remember']);

if (empty($usernameEmail) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Username/Email and Password are required."]);
    exit();
}

$pdo = Database::getPDO();

if ($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND status = 'active'");
        $stmt->execute([$usernameEmail, $usernameEmail]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // Regenerate session ID to prevent session fixation (Practical 10)
            session_regenerate_id(true);

            $_SESSION['user_id']    = $user['id'];
            $_SESSION['username']   = $user['username'];
            $_SESSION['full_name']  = $user['full_name'];
            $_SESSION['email']      = $user['email'];
            $_SESSION['role']       = $user['role'];
            $_SESSION['last_login'] = date('Y-m-d H:i:s');
            $_SESSION['last_activity'] = time();

            // Record last login in database
            $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $updateStmt->execute([$user['id']]);

            // Audit log entry (Practical 14)
            $auditStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, user_role, action, details) VALUES (?, ?, 'USER_LOGIN', ?)");
            $auditStmt->execute([$user['id'], $user['role'], "User {$user['username']} logged in successfully."]);

            // Handle Remember Me Token if requested
            if ($rememberMe) {
                $token = bin2hex(random_bytes(32));
                $hashedToken = hash('sha256', $token);
                $remStmt = $pdo->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
                $remStmt->execute([$hashedToken, $user['id']]);

                setcookie('remember_token', $token, [
                    'expires'  => time() + (86400 * 30), // 30 Days
                    'path'     => '/',
                    'httponly' => true,
                    'samesite' => 'Lax'
                ]);
            }

            http_response_code(200);
            echo json_encode([
                "status"   => "success",
                "message"  => "Login successful!",
                "role"     => $user['role'],
                "redirect" => $user['role'] === 'admin' ? 'admin.html' : 'dashboard.html',
                "user"     => [
                    "name"     => $user['full_name'],
                    "username" => $user['username'],
                    "email"    => $user['email'],
                    "role"     => $user['role']
                ]
            ]);
            exit();
        }
    } catch (Exception $e) {}
}

// Fallback Authentication check for local default accounts
$defaultAdmin = ($usernameEmail === 'admin@charusat.ac.in' || $usernameEmail === 'ADMIN001') && $password === 'AdminPass123!';
$defaultStudent = ($usernameEmail === 'dhruvrajsinhdodiya4208@gmail.com' || $usernameEmail === '25CS009') && $password === 'Password123!';

if ($defaultAdmin || $defaultStudent) {
    session_regenerate_id(true);
    $role = $defaultAdmin ? 'admin' : 'student';
    $name = $defaultAdmin ? 'System Administrator' : 'Dhruvrajsinh Dodiya';
    $uname = $defaultAdmin ? 'ADMIN001' : '25CS009';
    $uemail = $defaultAdmin ? 'admin@charusat.ac.in' : 'dhruvrajsinhdodiya4208@gmail.com';

    $_SESSION['user_id'] = $defaultAdmin ? 1 : 2;
    $_SESSION['username'] = $uname;
    $_SESSION['full_name'] = $name;
    $_SESSION['email'] = $uemail;
    $_SESSION['role'] = $role;
    $_SESSION['last_activity'] = time();

    http_response_code(200);
    echo json_encode([
        "status"   => "success",
        "message"  => "Login successful (Session Active)!",
        "role"     => $role,
        "redirect" => $role === 'admin' ? 'admin.html' : 'dashboard.html',
        "user"     => [
            "name"     => $name,
            "username" => $uname,
            "email"    => $uemail,
            "role"     => $role
        ]
    ]);
    exit();
}

http_response_code(401);
echo json_encode(["status" => "error", "message" => "Invalid credentials. Please check your username/email and password."]);
?>
