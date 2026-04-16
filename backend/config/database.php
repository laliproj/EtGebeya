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
