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

interface LoginResponse {
  login: string;
  accessToken: string;
}

interface RegisterPayload {
  login: string;
  name: string;
  pass: string;
  role?: string;
}

interface UserState {
  username: string;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  error?: string | null; 
}

const savedToken = localStorage.getItem('token');
const savedUsername = localStorage.getItem('username') || localStorage.getItem('login') || '';
const savedRole = (localStorage.getItem('role') as UserRole) || null;

const initialState: UserState = {
  username: savedUsername,
  role: savedRole,
  token: savedToken,
  isAuthenticated: !!savedToken,
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
        accessToken: response.data.access_token,
        username: response.data.username ?? credentials.login,
        login: response.data.login ?? credentials.login,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Ошибка входа'
      );
    }
  }
);

export const registerUserAsync = createAsyncThunk<
  boolean,
  { login: string; name: string; pass: string },
  { rejectValue: string }
>('user/registerUserAsync', async (payload, { rejectWithValue }) => {
  try {
    await axios.post('http://localhost:8080/auth/register', payload);
    return true;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      'Ошибка регистрации'
    );
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
      await api.auth.authLogoutCreate(undefined, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } as any);
    }

  } catch (error) {
    // dispatch(resetApplicationsFilters());
    // return rejectWithValue(
    //   error?.response?.data?.error ||
    //   error?.response?.data?.message ||
    //   'Ошибка выхода'
    // );
    console.log("Ошибка выхода", error);
  }
  dispatch(resetApplicationsFilters());
  return true;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        const token = action.payload.accessToken;
        const decoded = jwtDecode<{ role?: 'researcher' | 'professor' | 'admin' }>(token);

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
        state.username = '';
        state.role = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload ?? 'Ошибка входа';
      })

      .addCase(registerUserAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(registerUserAsync.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.error = action.payload ?? 'Ошибка регистрации';
      })

      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.username = '';
        state.role = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;

        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('login');
      })
      
      .addCase(logoutUserAsync.rejected, (state, action) => {
        state.error = action.payload ?? 'Ошибка выхода';
      });      
  },
});

export default userSlice.reducer;