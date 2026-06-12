<?php
// backend/api/auth/login.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

$missing = Validator::checkRequired($data, ['email', 'password']);
if (!empty($missing)) {
    jsonResponse(false, "Missing required fields: " . implode(', ', $missing), null, 400);
}

$email = Validator::sanitize($data['email']);
$password = $data['password'];

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, name, email, password, avatar, phone, location, joinDate, bio,
                     trustScore, totalSold, totalRatings, isVerified, isBanned, isAdmin, warnings 
              FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row['isBanned']) {
            jsonResponse(false, "Your account has been banned due to policy violations.", null, 403);
        }

        if (password_verify($password, $row['password'])) {
            $user = [
                'id'           => (int)$row['id'],
                'name'         => $row['name'],
                'email'        => $row['email'],
                'avatar'       => $row['avatar'],
                'phone'        => $row['phone'],
                'location'     => $row['location'],
                'joinDate'     => $row['joinDate'],
                'bio'          => $row['bio'],
                'trustScore'   => (float)$row['trustScore'],
                'totalSold'    => (int)$row['totalSold'],
                'totalRatings' => (int)$row['totalRatings'],
                'isVerified'   => (bool)$row['isVerified'],
                'isBanned'     => (bool)$row['isBanned'],
                'isAdmin'      => (bool)$row['isAdmin'],
                'warnings'     => (int)$row['warnings'],
            ];

            $token = AuthMiddleware::generateToken($user);
            $user['token'] = $token;

            jsonResponse(true, "Login successful", $user);
        } else {
            jsonResponse(false, "Invalid email or password", null, 401);
        }
    } else {
        jsonResponse(false, "Invalid email or password", null, 401);
    }
} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
