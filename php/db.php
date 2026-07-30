<?php
/**
 * CHARUSAT StudentHub Portal - Database Connection Handler
 * Supports PDO & MySQLi prepared statements (Practical 8, 9, 10, 11)
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'studenthub_db');

class Database {
    private static $pdoInstance = null;
    private static $mysqliInstance = null;

    public static function getPDO() {
        if (self::$pdoInstance === null) {
            try {
                $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                self::$pdoInstance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                // Return null if database connection fails so API degrades gracefully
                return null;
            }
        }
        return self::$pdoInstance;
    }

    public static function getMySQLi() {
        if (self::$mysqliInstance === null) {
            try {
                self::$mysqliInstance = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
                if (self::$mysqliInstance->connect_error) {
                    return null;
                }
                self::$mysqliInstance->set_charset("utf8mb4");
            } catch (Exception $e) {
                return null;
            }
        }
        return self::$mysqliInstance;
    }
}
?>
