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
