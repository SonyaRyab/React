import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api/index';
import type { Reagent } from '../modules/types';
import { getReagents } from '../modules/api';
import { REAGENTS_MOCK } from "../modules/mock"; // мок-данные
// import { setAppId, setCount } from './methaneApplicationDraftSlice';
import type { RootState } from '../store';
import { getReagentsPaginated } from '../modules/api';

interface ReagentsState {
  searchValue: string;
  reagents: Reagent[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const initialState: ReagentsState = {
  searchValue: '',
  reagents: [],
  loading: false,
  error: null,
  page: 1,
  limit: 24,
  total: 0,
  totalPages: 1,
};

export const getReagentsList = createAsyncThunk(
  'reagents/getReagentsList',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;

    try {
      return await getReagentsPaginated(
        state.reagents.searchValue,
        state.reagents.page,
        state.reagents.limit,
      );
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to fetch reagents');
    }
  },
);

const reagentsSlice = createSlice({
  name: 'reagents',
  initialState,
  reducers: {
    setSearchValue(state, action: PayloadAction<string>) {
      state.searchValue = action.payload;
      state.page = 1;
    },
    clearSearchValue(state) {
      state.searchValue = '';
      state.page = 1;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    setPageLimit(state, action: PayloadAction<number>) {
      state.limit = Math.max(1, action.payload);
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReagentsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReagentsList.fulfilled, (state, action) => {
        state.loading = false;
        state.reagents = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getReagentsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;

        const filtered = REAGENTS_MOCK.filter(
          (item) =>
            item.name.toLowerCase().includes(state.searchValue.toLowerCase()) ||
            item.formula.toLowerCase().includes(state.searchValue.toLowerCase()),
        );

        const start = (state.page - 1) * state.limit;
        state.reagents = filtered.slice(start, start + state.limit);
        state.total = filtered.length;
        state.totalPages = Math.max(1, Math.ceil(filtered.length / Math.max(1, state.limit)));
      });
  },
});

export const { setSearchValue, clearSearchValue, setCurrentPage, setPageLimit } = reagentsSlice.actions;

export default reagentsSlice.reducer;