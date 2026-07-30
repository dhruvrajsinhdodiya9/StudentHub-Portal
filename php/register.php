<?php
/**
 * CHARUSAT StudentHub Portal - Registration Processor (Practical 5, 7, 9)
 * Validates inputs with regular expressions, hashes passwords, checks duplicate email/username,
 * stores in MySQL or fallback data/registrations.json file.
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

$fullName = trim($input['name'] ?? $input['full_name'] ?? '');
$username = trim($input['username'] ?? '');
$email    = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$mobile   = trim($input['mobile'] ?? '');
$password = $input['password'] ?? '';
$confirmPass = $input['confirm_password'] ?? '';
$course   = trim($input['course'] ?? '');
$year     = trim($input['year'] ?? '');
$gender   = trim($input['gender'] ?? 'Male');
$csrfToken = $input['csrf_token'] ?? '';

// 1. Validation Logic
$errors = [];

if (empty($fullName) || strlen($fullName) < 3) {
    $errors[] = "Full name must be at least 3 characters long.";
}

if (empty($username) || !preg_match('/^[a-zA-Z0-9_]{4,20}$/', $username)) {
    $errors[] = "Username must be 4-20 alphanumeric characters or underscores.";
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Please provide a valid email address.";
}

if (!empty($mobile) && !preg_match('/^[6-9]\d{9}$/', $mobile)) {
    $errors[] = "Mobile number must be a valid 10-digit Indian phone number.";
}

// Password Complexity Regex Validation (Practical 5)
$passwordRegex = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/';
if (!preg_match($passwordRegex, $password)) {
    $errors[] = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character.";
}

if ($password !== $confirmPass) {
    $errors[] = "Password and confirm password do not match.";
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Validation failed", "errors" => $errors]);
    exit();
}

// 2. Password Hashing (Practical 9)
$passwordHash = password_hash($password, PASSWORD_BCRYPT);

// 3. MySQL Database Insert with Duplicate Check
$pdo = Database::getPDO();
if ($pdo) {
    try {
        // Duplicate Email / Username check
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $checkStmt->execute([$email, $username]);
        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "An account with this email or enrollment/username already exists."]);
            exit();
        }

        // Insert into Users Table
        $userStmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, full_name, role, status) VALUES (?, ?, ?, ?, 'student', 'active')");
        $userStmt->execute([$username, $email, $passwordHash, $fullName]);
        $userId = $pdo->lastInsertId();

        // Insert into Students Table
        $studentStmt = $pdo->prepare("INSERT INTO students (user_id, enrollment_no, full_name, email, department, year_of_study, phone_number, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $studentStmt->execute([$userId, $username, $fullName, $email, $course, $year, $mobile, $gender]);

        // Audit Log entry (Practical 14)
        $auditStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, user_role, action, details) VALUES (?, 'student', 'USER_REGISTRATION', ?)");
        $auditStmt->execute([$userId, "Registered new student account: {$username} ({$email})"]);

        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Registration successful! Account created in database."]);
        exit();
    } catch (Exception $e) {
        // Fallback to JSON file storage if DB operation fails
    }
}

// 4. File-Based Storage Fallback (Practical 7)
$jsonFile = __DIR__ . '/../data/registrations.json';
$registrations = file_exists($jsonFile) ? json_decode(file_get_contents($jsonFile), true) ?? [] : [];

// Check duplicates in JSON
foreach ($registrations as $reg) {
    if ($reg['email'] === $email || $reg['username'] === $username) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Account already registered in file storage."]);
        exit();
    }
}

$newRecord = [
    "id" => count($registrations) + 1,
    "name" => $fullName,
    "username" => $username,
    "email" => $email,
    "mobile" => $mobile,
    "course" => $course,
    "year" => $year,
    "gender" => $gender,
    "created_at" => date('Y-m-d H:i:s')
];

$registrations[] = $newRecord;
file_put_contents($jsonFile, json_encode($registrations, JSON_PRETTY_PRINT));

http_response_code(201);
echo json_encode(["status" => "success", "message" => "Registration processed and recorded in file storage."]);
?>
