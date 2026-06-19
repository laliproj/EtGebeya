<?php
// backend/api/auth/profile.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Authenticate and get user ID
$userId = AuthMiddleware::authenticate();

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get profile
    try {
        $query = "SELECT id, name, email, avatar, phone, location, joinDate, bio, trustScore, totalSold, totalRatings, isVerified, warnings, isBanned 
                  FROM users WHERE id = :id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            // Cast types
            $user['trustScore'] = (float)$user['trustScore'];
            $user['totalSold'] = (int)$user['totalSold'];
            $user['totalRatings'] = (int)$user['totalRatings'];
            $user['isVerified'] = (bool)$user['isVerified'];
            $user['warnings'] = (int)$user['warnings'];
            $user['isBanned'] = (bool)$user['isBanned'];
            
            jsonResponse(true, "Profile retrieved successfully", $user);
        } else {
            jsonResponse(false, "User not found", null, 404);
        }
    } catch(PDOException $e) {
        jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update profile
