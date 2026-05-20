import axios from 'axios';

/**
 * Axios Instance Configuration
 * 
 * BACKEND INTEGRATION NOTE:
 * Update the baseURL to your PHP backend URL (e.g., 'http://localhost:8000/api')
 * The interceptors will automatically attach JWT tokens from localStorage.
 */

const api = axios.create({
