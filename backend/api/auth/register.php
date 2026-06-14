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
