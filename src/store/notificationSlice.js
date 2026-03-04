import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchNotificationsAPI = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/index.php');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAsReadAPI = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/read.php', { id });
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAllAsReadAPI = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/read-all.php');
      if (response.data.success) {
        return true;
      }
      return rejectWithValue(response.data.message);
    } catch (err) {
