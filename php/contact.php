<?php
/**
 * CHARUSAT StudentHub Portal - Contact Form & Feedback Processor (Practical 7)
 * Validates inputs, appends records to CSV file (data/contact.csv) and MySQL.
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

$fullName = htmlspecialchars(trim($input['name'] ?? ''), ENT_QUOTES, 'UTF-8');
$email    = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$country  = htmlspecialchars(trim($input['country'] ?? ''), ENT_QUOTES, 'UTF-8');
$state    = htmlspecialchars(trim($input['state'] ?? ''), ENT_QUOTES, 'UTF-8');
$city     = htmlspecialchars(trim($input['city'] ?? ''), ENT_QUOTES, 'UTF-8');
$subject  = htmlspecialchars(trim($input['subject'] ?? ''), ENT_QUOTES, 'UTF-8');
$message  = htmlspecialchars(trim($input['message'] ?? ''), ENT_QUOTES, 'UTF-8');
$rating   = intval($input['rating'] ?? 5);

if (empty($fullName) || empty($email) || empty($subject) || empty($message)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Please fill in all required fields."]);
    exit();
}

// 1. MySQL Storage if database is connected
$pdo = Database::getPDO();
if ($pdo) {
    try {
        $stmt = $pdo->prepare("INSERT INTO contact_messages (full_name, email, country, state, city, subject, message, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$fullName, $email, $country, $state, $city, $subject, $message, $rating]);
    } catch (Exception $e) {}
}

// 2. CSV File Storage (Practical 7)
$csvFile = __DIR__ . '/../data/contact.csv';
$isNew = !file_exists($csvFile);

$fp = fopen($csvFile, 'a');
if ($fp) {
    if ($isNew) {
        fputcsv($fp, ['Timestamp', 'Full Name', 'Email', 'Country', 'State', 'City', 'Subject', 'Message', 'Rating']);
    }
    fputcsv($fp, [date('Y-m-d H:i:s'), $fullName, $email, $country, $state, $city, $subject, $message, $rating]);
    fclose($fp);
}

http_response_code(200);
echo json_encode(["status" => "success", "message" => "Thank you! Your message has been saved and logged to CSV."]);
?>
