<?php
// backend/api/sellers/products.php
// Public: ?id=X  -> only returns active/sold products
// Private: ?id=X&own=1 (requires auth) -> returns all statuses for the seller's own dashboard
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if (!isset($_GET['id'])) {
    jsonResponse(false, "Seller ID is required", null, 400);
