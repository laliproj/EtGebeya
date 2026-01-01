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

    // 2. Insert images
    $imgQuery = "INSERT INTO product_images (product_id, image_url, is_cover) VALUES (:pid, :url, :cover)";
    $imgStmt = $db->prepare($imgQuery);
    foreach ($imageUrls as $index => $url) {
        $imgStmt->execute([
            ':pid' => $productId,
            ':url' => $url,
            ':cover' => ($index === 0) ? 1 : 0
        ]);
    }

    // 3. Insert specs
    if (!empty($specs) && is_array($specs)) {
        $specQuery = "INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES (:pid, :key, :val)";
        $specStmt = $db->prepare($specQuery);
        foreach ($specs as $key => $value) {
            $specStmt->execute([
                ':pid' => $productId,
                ':key' => Validator::sanitize($key),
                ':val' => Validator::sanitize($value)
            ]);
        }
    }

    // 4. Insert features
    if (!empty($features) && is_array($features)) {
        $featQuery = "INSERT INTO product_features (product_id, feature) VALUES (:pid, :feat)";
        $featStmt = $db->prepare($featQuery);
        foreach ($features as $feature) {
            $featStmt->execute([
                ':pid' => $productId,
                ':feat' => Validator::sanitize($feature)
            ]);
        }
    }

    $db->commit();

    // 5. Notify Admins
    try {
        $adminQ = $db->query("SELECT id FROM users WHERE isAdmin = 1");
        $admins = $adminQ->fetchAll(PDO::FETCH_ASSOC);
        $notifQuery = "INSERT INTO notifications (user_id, type, title, message, icon) VALUES (:uid, 'pending_product', 'New Listing Request', 'A new product is awaiting approval: $title', '📦')";
        $nStmt = $db->prepare($notifQuery);
        foreach ($admins as $adminRow) {
            $nStmt->execute([':uid' => $adminRow['id']]);
        }
    } catch(Exception $ex) {
        // Ignore notification errors
    }

    jsonResponse(true, "Product created successfully", ['id' => $productId], 201);

} catch(Exception $e) {
    $db->rollBack();
    jsonResponse(false, "Failed to create product: " . $e->getMessage(), null, 500);
}
?>
