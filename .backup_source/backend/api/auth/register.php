<?php
// backend/api/auth/register.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

// Get raw POST data
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
$required = ['name', 'email', 'password'];
$missing = Validator::checkRequired($data, $required);

if (!empty($missing)) {
    jsonResponse(false, "Missing required fields: " . implode(', ', $missing), null, 400);
}

// Sanitize inputs
$name = Validator::sanitize($data['name']);
$email = Validator::sanitize($data['email']);
$password = $data['password']; // Don't sanitize password
$phone = isset($data['phone']) ? Validator::sanitize($data['phone']) : '';
$location = isset($data['location']) ? Validator::sanitize($data['location']) : '';

// Validate email
if (!Validator::isValidEmail($email)) {
    jsonResponse(false, "Invalid email format", null, 400);
}

// Validate password strength
if (!Validator::isStrongPassword($password)) {
    jsonResponse(false, "Password must be at least 8 characters long and contain at least one uppercase letter and one number", null, 400);
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

try {
    // Check if email already exists
    $query = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        jsonResponse(false, "Email already registered", null, 409);
    }

    // Hash password
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    
    // Generate default avatar
    $avatar = "https://ui-avatars.com/api/?name=" . urlencode($name) . "&background=3b82f6&color=fff";
    $joinDate = date('Y-m-d');

    // Insert user
    $query = "INSERT INTO users (name, email, password, avatar, phone, location, joinDate) 
              VALUES (:name, :email, :password, :avatar, :phone, :location, :joinDate)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':avatar', $avatar);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':location', $location);
    $stmt->bindParam(':joinDate', $joinDate);

    if ($stmt->execute()) {
        $userId = $db->lastInsertId();
        
        $user = [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'avatar' => $avatar,
            'phone' => $phone,
            'location' => $location,
            'joinDate' => $joinDate,
            'bio' => '',
            'trustScore' => 5.0,
            'isVerified' => false
        ];

        // Generate JWT
        $token = AuthMiddleware::generateToken($user);
        $user['token'] = $token;

        jsonResponse(true, "User registered successfully", $user, 201);
    } else {
        jsonResponse(false, "Unable to register user", null, 500);
    }
} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
