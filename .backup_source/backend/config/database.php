<?php
// backend/config/database.php

class Database {
    // Database credentials
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = getenv('DB_HOST') ?: "localhost";
        $this->port = getenv('DB_PORT') ?: "3306";
        $this->db_name = getenv('DB_NAME') ?: "electromart_db";
        $this->username = getenv('DB_USER') ?: "root";
        $this->password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : "";
    }

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            // Set PDO error mode to exception
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            // Return associative arrays by default
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            // In a production environment, this should be logged instead of displayed
            error_log("Connection error: " . $exception->getMessage());
            die(json_encode([
                "success" => false,
                "message" => "Database connection failed."
            ]));
        }

        return $this->conn;
    }
}
?>
