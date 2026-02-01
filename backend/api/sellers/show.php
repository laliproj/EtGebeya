<?php
// backend/api/sellers/show.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

if (!isset($_GET['id'])) {
    jsonResponse(false, "Seller ID is required", null, 400);
}

$sellerId = (int)$_GET['id'];

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, name, avatar, location, joinDate, bio, trustScore, totalSold, totalRatings, isVerified 
