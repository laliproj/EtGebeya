<?php
// backend/api/auth/logout.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

// With JWT, logout is handled client-side by deleting the token.
// We just verify the token is valid before returning success.
$userId = AuthMiddleware::authenticate();

jsonResponse(true, "Logged out successfully");
?>
