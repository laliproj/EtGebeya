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
                        }
                    }
                }
            }
        }
        
        jsonResponse(false, "Access denied. Invalid or missing token.", null, 401);
    }

    /**
     * Generate JWT Token
     */
    public static function generateToken($user) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24 * 7), // 1 week
            'data' => [
                'id' => $user['id'],
                'email' => $user['email']
            ]
        ]);

        $base64UrlHeader = self::base64url_encode($header);
        $base64UrlPayload = self::base64url_encode($payload);
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);
        $base64UrlSignature = self::base64url_encode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
}

// Helper function for apache_request_headers if not using Apache
if (!function_exists('apache_request_headers')) {
    function apache_request_headers() {
        $arh = array();
        $rx_http = '/\AHTTP_/';
        foreach ($_SERVER as $key => $val) {
            if (preg_match($rx_http, $key)) {
                $arh_key = preg_replace($rx_http, '', $key);
                $rx_matches = array();
                $rx_matches = explode('_', $arh_key);
                if (count($rx_matches) > 0 and strlen($arh_key) > 2) {
                    foreach ($rx_matches as $ak_key => $ak_val) $rx_matches[$ak_key] = ucfirst(strtolower($ak_val));
                    $arh_key = implode('-', $rx_matches);
                }
                $arh[$arh_key] = $val;
            }
        }
        return $arh;
    }
}
?>
