import { createSlice } from '@reduxjs/toolkit';

/**
 * UI Slice — manages global UI state like theme and modals
 */

const storedTheme = localStorage.getItem('theme') || 'light';
if (storedTheme === 'dark') {
  document.body.classList.add('dark');
}

const initialState = {
