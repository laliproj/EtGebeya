<?php
// backend/api/brands/index.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';

$database = new Database();
$db = $database->getConnection();

try {
    if (isset($_GET['category'])) {
        $category = Validator::sanitize($_GET['category']);
        $query = "SELECT * FROM brands WHERE category_slug = :category";
        $stmt = $db->prepare($query);
        $stmt->execute([':category' => $category]);
    } else {
        $query = "SELECT * FROM brands";
        $stmt = $db->prepare($query);
        $stmt->execute();
    }

    $brands = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Fetch models for this brand
        $modelQuery = "SELECT name FROM models WHERE brand_id = :brand_id";
        $modelStmt = $db->prepare($modelQuery);
        $modelStmt->execute([':brand_id' => $row['id']]);
        
        $models = [];
        while ($mRow = $modelStmt->fetch(PDO::FETCH_ASSOC)) {
            $models[] = $mRow['name'];
        }

        $brands[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'logo' => $row['logo'],
            'models' => $models,
