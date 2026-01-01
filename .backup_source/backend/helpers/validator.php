<?php
// backend/helpers/validator.php

class Validator {
    /**
     * Sanitize input string
     */
    public static function sanitize($data) {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = self::sanitize($value);
            }
            return $data;
        }
        return htmlspecialchars(strip_tags(trim($data)));
    }

    /**
     * Validate email format
     */
    public static function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate password strength (minimum 8 chars, 1 uppercase, 1 number)
     */
    public static function isStrongPassword($password) {
        if (strlen($password) < 8) return false;
        if (!preg_match('/[A-Z]/', $password)) return false;
        if (!preg_match('/[0-9]/', $password)) return false;
        return true;
    }

    /**
     * Check if required fields are present and not empty
     */
    public static function checkRequired($data, $required_fields) {
        $missing = [];
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $missing[] = $field;
            }
        }
        return $missing;
    }
}
?>
