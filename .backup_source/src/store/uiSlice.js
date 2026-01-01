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
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      if (state.theme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    setMobileMenuOpen(state, action) {
      state.mobileMenuOpen = action.payload;
    },
    setSearchOpen(state, action) {
      state.searchOpen = action.payload;
    },
  },
});

export const { toggleTheme, setSidebarOpen, setMobileMenuOpen, setSearchOpen } = uiSlice.actions;

export default uiSlice.reducer;
