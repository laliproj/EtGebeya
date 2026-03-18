import { createSlice } from '@reduxjs/toolkit';

/**
 * UI Slice — manages global UI state like theme and modals
 */

const storedTheme = localStorage.getItem('theme') || 'light';
if (storedTheme === 'dark') {
  document.body.classList.add('dark');
}

const initialState = {
  theme: storedTheme,
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
