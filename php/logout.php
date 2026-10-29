<?php
/**
 * CHARUSAT StudentHub Portal - Logout Handler (Practical 10)
 * Destroys session and clears remember cookies securely.
 */

session_start();
$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

setcookie('remember_token', '', time() - 3600, '/');
session_destroy();

header('Content-Type: application/json; charset=utf-8');
echo json_encode(["status" => "success", "message" => "Logged out successfully", "redirect" => "login.html"]);
?>
