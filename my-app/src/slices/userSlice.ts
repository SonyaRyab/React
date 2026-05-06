import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { resetApplicationsFilters } from './applicationsSlice';

type UserRole = 'researcher' | 'professor' | 'admin' | null;

type JwtPayload = {
  role?: UserRole;
  username?: string;
  login?: string;
  sub?: string;
  useruuid?: string;
  exp?: number;
  iat?: number;
};

interface UserState {
  username: string | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  error?: string | null;
}

const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  localStorage.removeItem('login');
};

const readStoredAuth = () => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || localStorage.getItem('login');
  const role = (localStorage.getItem('role') as UserRole) || null;

  if (!token) {
    return {
      username: null,
      role: null,
      token: null,
      isAuthenticated: false,
    };
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      clearStoredAuth();
      return {
        username: null,
        role: null,
        token: null,
        isAuthenticated: false,
      };
    }

    return {
      username,
      role,
      token,
      isAuthenticated: true,
    };
  } catch {
    clearStoredAuth();
    return {
      username: null,
      role: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

const initialAuth = readStoredAuth();

const initialState: UserState = {
  username: initialAuth.username,
  role: initialAuth.role,
  token: initialAuth.token,
  isAuthenticated: initialAuth.isAuthenticated,
  error: null,
};

const getErrorMessage = (error: any): string =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Ошибка запроса';

// Асинхронное действие для авторизации
export const loginUserAsync = createAsyncThunk<
  { accessToken: string; username: string; login: string },
  { login: string; password: string },
  { rejectValue: string }
>('user/loginUserAsync', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.auth.loginCreate(credentials as any);
    return {
      accessToken: response.data.accesstoken,
      username: response.data.username ?? credentials.login,
      login: response.data.login ?? credentials.login,
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

// Асинхронное действие для деавторизации
export const logoutUserAsync = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string; dispatch: any; state: any }
>('user/logoutUserAsync', async (_, { getState, dispatch }) => {
  const token = getState().user.token;
  try {
    if (token) {
      await api.auth.logoutCreate({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
  }

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
        state.role = decoded.role ?? 'researcher';
        state.token = token;
        state.isAuthenticated = true;
        state.error = null;

        localStorage.setItem('token', token);
        localStorage.setItem('username', action.payload.username);
        localStorage.setItem('login', action.payload.login);
        localStorage.setItem('role', decoded.role ?? 'researcher');
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.username = null;
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