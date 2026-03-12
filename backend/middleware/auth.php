<?php
// backend/middleware/auth.php
require_once __DIR__ . '/../helpers/response.php';

class AuthMiddleware {
    // Secret key for JWT - should be in env in production
    private static $secret_key = "electromart_super_secret_jwt_key_2026";
    
    /**
     * Simple JWT Decode
     */
    private static function base64url_decode($data) {
        $b64 = strtr($data, '-_', '+/');
        return base64_decode($b64);
    }

    /**
     * Simple JWT Encode
     */
    private static function base64url_encode($data) {
        $b64 = base64_encode($data);
        if ($b64 === false) return false;
