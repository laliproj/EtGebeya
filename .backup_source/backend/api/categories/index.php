<?php
// backend/api/categories/index.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT c.*, (SELECT COUNT(*) FROM products WHERE category = c.slug) as actual_count FROM categories c";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $categories = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $categories[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'icon' => $row['icon'],
            'image' => $row['image'],
            'count' => (int)$row['actual_count']
        ];
    }

    jsonResponse(true, "Categories retrieved", $categories);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
