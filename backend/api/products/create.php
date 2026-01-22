<?php
// backend/api/products/create.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';
require_once __DIR__ . '/../../helpers/upload.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Authenticate and get seller ID
$sellerId = AuthMiddleware::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

$database = new Database();
$db = $database->getConnection();

// Check if seller is banned
try {
    $banCheck = $db->prepare("SELECT isBanned FROM users WHERE id = :id");
    $banCheck->execute([':id' => $sellerId]);
    if ($banCheck->fetchColumn()) {
        jsonResponse(false, "Your account is banned. You cannot post products.", null, 403);
    }
} catch (PDOException $e) {
    jsonResponse(false, "Database error", null, 500);
}

// Since we're dealing with FormData (multipart/form-data), data is in $_POST, not php://input
$title = isset($_POST['title']) ? Validator::sanitize($_POST['title']) : '';
$description = isset($_POST['description']) ? Validator::sanitize($_POST['description']) : '';
$price = isset($_POST['price']) ? (float)$_POST['price'] : 0;
$category = isset($_POST['category']) ? Validator::sanitize($_POST['category']) : '';
$brand = isset($_POST['brand']) ? Validator::sanitize($_POST['brand']) : '';
$model = isset($_POST['model']) ? Validator::sanitize($_POST['model']) : '';
$condition = isset($_POST['condition']) ? Validator::sanitize($_POST['condition']) : '';
$location = isset($_POST['location']) ? Validator::sanitize($_POST['location']) : '';

// Validation
if (empty($title) || empty($description) || $price <= 0 || empty($category) || empty($brand) || empty($condition) || empty($location)) {
    jsonResponse(false, "Please fill all required fields correctly", null, 400);
}

// Parse specs and features which are sent as JSON strings in FormData
$specs = isset($_POST['specs']) ? json_decode($_POST['specs'], true) : [];
$features = isset($_POST['features']) ? json_decode($_POST['features'], true) : [];

// Handle Image Uploads
if (!isset($_FILES['images']) || empty($_FILES['images']['name'][0])) {
    jsonResponse(false, "At least one image is required", null, 400);
}

$uploader = new Uploader();
$uploadResult = $uploader->uploadImages($_FILES['images']);

if (!$uploadResult['success']) {
    jsonResponse(false, $uploadResult['message'], null, 400);
}

$imageUrls = $uploadResult['urls'];

try {
    $db->beginTransaction();

    // 1. Insert product (status = 'pending' — awaits admin approval)
    $query = "INSERT INTO products (sellerId, title, description, price, category, brand, model, `condition`, location, status)
              VALUES (:sellerId, :title, :description, :price, :category, :brand, :model, :condition, :location, 'pending')";
    $stmt = $db->prepare($query);
    $stmt->execute([
        ':sellerId'    => $sellerId,
        ':title'       => $title,
        ':description' => $description,
        ':price'       => $price,
        ':category'    => $category,
        ':brand'       => $brand,
        ':model'       => $model,
        ':condition'   => $condition,
        ':location'    => $location
    ]);

    $productId = $db->lastInsertId();

