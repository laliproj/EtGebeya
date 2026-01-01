<?php
require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $sql = file_get_contents(__DIR__ . '/migrations/004_ai_negotiations.sql');
    $db->exec($sql);
    echo "Migration 004 successful\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
