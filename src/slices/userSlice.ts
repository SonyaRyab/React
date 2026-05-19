import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { api } from '../api/index';
import { resetApplicationsFilters } from './applicationsSlice';

type UserRole = 'researcher' | 'professor' | 'admin' | null;

interface JwtPayload {
  role?: UserRole;
  exp?: number;
}

interface UserState {
  username: string | null;
  login: string | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('login');
  localStorage.removeItem('role');

  sessionStorage.removeItem('token');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('login');
  sessionStorage.removeItem('role');
};

const getStoredAuth = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const username =
    sessionStorage.getItem('username') || localStorage.getItem('username');
  const login = sessionStorage.getItem('login') || localStorage.getItem('login');
  const role =
    (sessionStorage.getItem('role') || localStorage.getItem('role')) as UserRole;

  return { token, username, login, role };
};

const stored = getStoredAuth();

const initialState: UserState = {
  username: stored.username || null,
  login: stored.login || null,
  role: stored.role || null,
  token: stored.token || null,
  isAuthenticated: Boolean(stored.token),
  error: null,
};

const getErrorMessage = (error: any): string =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Ошибка запроса';

export const loginUserAsync = createAsyncThunk<
  { accessToken: string; username: string; login: string },
  { login: string; password: string },
  { rejectValue: string }
>('user/loginUserAsync', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.auth.loginCreate(payload);
    const data = response.data ?? {};

    return {
      accessToken: data.accesstoken ?? '',
      username: data.username ?? data.login ?? payload.login,
      login: data.login ?? payload.login,
    };
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const registerUserAsync = createAsyncThunk<
  boolean,
  { login: string; name: string; pass: string },
  { rejectValue: string }
>('user/registerUserAsync', async (payload, { rejectWithValue }) => {
  try {
    await axios.post('http://localhost:8080/auth/register', payload);
    return true;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const logoutUserAsync = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string; dispatch: any; state: any }
>('user/logoutUserAsync', async (_, { getState, dispatch }) => {
  const token = getState().user.token;
  try {
    if (token) {
      await api.auth.logoutCreate({
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {}

  dispatch(resetApplicationsFilters());
  return true;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        const token = action.payload.accessToken;
        const decoded = jwtDecode<JwtPayload>(token);

        state.username = action.payload.username;
        state.login = action.payload.login;
        state.role = decoded.role ?? 'researcher';
        state.token = token;
        state.isAuthenticated = true;
        state.error = null;

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('username', action.payload.username);
        sessionStorage.setItem('login', action.payload.login);
        sessionStorage.setItem('role', decoded.role ?? 'researcher');
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.username = null;
        state.login = null;
        state.role = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload ?? 'Login failed';
        clearStoredAuth();
      })
      .addCase(registerUserAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(registerUserAsync.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.error = action.payload ?? 'Register failed';
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.username = null;
        state.login = null;
        state.role = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        clearStoredAuth();
      })
      .addCase(logoutUserAsync.rejected, (state, action) => {
        state.error = action.payload ?? 'Logout failed';
      }),
});

export default userSlice.reducer;