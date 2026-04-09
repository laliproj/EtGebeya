<?php
// backend/helpers/validator.php

class Validator {
    /**
     * Sanitize input string
     */
    public static function sanitize($data) {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
