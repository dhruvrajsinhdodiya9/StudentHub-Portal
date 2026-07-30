<?php
/**
 * CHARUSAT StudentHub Portal - Asynchronous JSON REST API (Practical 13)
 * Provides JSON endpoints for Events, Students, Notices, FAQs with HTTP Status Codes
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'events';
$pdo = Database::getPDO();

// Fallback to local JSON files if database connection is unavailable
$dataDir = __DIR__ . '/../data/';

switch ($action) {
    case 'events':
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM events ORDER BY event_date ASC");
                $events = $stmt->fetchAll();
                http_response_code(200);
                echo json_encode(["status" => "success", "source" => "mysql", "data" => $events]);
                exit();
            } catch (Exception $e) {}
        }
        // Fallback to events.json
        if (file_exists($dataDir . 'events.json')) {
            http_response_code(200);
            echo json_encode(["status" => "success", "source" => "json_file", "data" => json_decode(file_get_contents($dataDir . 'events.json'))]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Events data not found"]);
        }
        break;

    case 'students':
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM students WHERE status != 'SoftDeleted' ORDER BY id ASC");
                $students = $stmt->fetchAll();
                http_response_code(200);
                echo json_encode(["status" => "success", "source" => "mysql", "data" => $students]);
                exit();
            } catch (Exception $e) {}
        }
        if (file_exists($dataDir . 'students.json')) {
            http_response_code(200);
            echo json_encode(["status" => "success", "source" => "json_file", "data" => json_decode(file_get_contents($dataDir . 'students.json'))]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Students data not found"]);
        }
        break;

    case 'faqs':
        if (file_exists($dataDir . 'faqs.json')) {
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => json_decode(file_get_contents($dataDir . 'faqs.json'))]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "FAQs not found"]);
        }
        break;

    case 'notices':
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM notices ORDER BY published_date DESC");
                $notices = $stmt->fetchAll();
                http_response_code(200);
                echo json_encode(["status" => "success", "data" => $notices]);
                exit();
            } catch (Exception $e) {}
        }
        if (file_exists($dataDir . 'notices.json')) {
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => json_decode(file_get_contents($dataDir . 'notices.json'))]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Notices not found"]);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid API action specified"]);
        break;
}
?>
