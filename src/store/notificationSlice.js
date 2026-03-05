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
      return rejectWithValue(err.message);
    }
  }
);

export const removeNotificationAPI = createAsyncThunk(
  'notifications/remove',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/delete.php', { id });
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action) {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsAPI.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotificationsAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(fetchNotificationsAPI.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markAsReadAPI.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.items.find(n => n.id === id);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsReadAPI.fulfilled, (state) => {
        state.items.forEach(n => { n.read = true; });
        state.unreadCount = 0;
      })
      .addCase(removeNotificationAPI.fulfilled, (state, action) => {
        const id = action.payload;
        const index = state.items.findIndex(n => n.id === id);
        if (index !== -1) {
          if (!state.items[index].read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.items.splice(index, 1);
        }
      });
  }
});

export const { addNotification } = notificationSlice.actions;

export default notificationSlice.reducer;

// 
// 
// 
// 
// 