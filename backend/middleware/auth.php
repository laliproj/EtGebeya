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
        $url = strtr($b64, '+/', '-_');
        return rtrim($url, '=');
    }

    /**
     * Authenticate request and return user ID
     */
    public static function authenticate() {
        $headers = apache_request_headers();
        
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        if (empty($authHeader)) {
            $authHeader = isset($headers['authorization']) ? $headers['authorization'] : '';
        }

        if ($authHeader) {
            $arr = explode(" ", $authHeader);
            $token = isset($arr[1]) ? $arr[1] : '';

            if ($token) {
                $parts = explode('.', $token);
                if (count($parts) === 3) {
                    list($header64, $payload64, $signature) = $parts;
                    
                    $valid_signature = self::base64url_encode(hash_hmac('sha256', $header64 . "." . $payload64, self::$secret_key, true));
                    
                    if ($signature === $valid_signature) {
                        $payload = json_decode(self::base64url_decode($payload64), true);
                        if ($payload['exp'] >= time()) {
                            return $payload['data']['id'];
                        } else {
                            jsonResponse(false, "Access denied. Token expired.", null, 401);
