<?php
// backend/api/auth/forgot-password.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email'])) {
    jsonResponse(false, "Email is required", null, 400);
}

$email = Validator::sanitize($data['email']);

if (!Validator::isValidEmail($email)) {
    jsonResponse(false, "Invalid email format", null, 400);
}

// In a real application, you would:
// 1. Check if email exists
// 2. Generate a secure reset token
// 3. Save token in db with expiration
// 4. Send email with the reset link

// For this project, we just mock the success response.
jsonResponse(true, "If that email is in our database, we will send a password reset link.");
?>
