import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/index';
import type { Reagent } from '../modules/types';
import { getReagents } from '../modules/api';
import { REAGENTS_MOCK } from "../modules/mock"; // мок-данные
// import { setAppId, setCount } from './methaneApplicationDraftSlice';

interface ReagentsState {
  searchValue: string;
  reagents: Reagent[];
  loading: boolean;
  error: string | null;
}

const initialState: ReagentsState = {
  searchValue: '',
  reagents: [],
  loading: false,
  error: null,
};

export const getReagentsList = createAsyncThunk(
    'cities/getReagentsList',
    async (_, { getState, dispatch, rejectWithValue }) => {
    const { reagents }: any = getState();
    try {
      return await getReagents(reagents.searchValue);
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке данных');
    }
  }
);

const reagentsSlice  = createSlice({
  name: 'reagents',
  initialState,
  reducers: {
    setSearchValue(state, action) {
      state.searchValue = action.payload;
    },
    clearSearchValue(state) {
      state.searchValue = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReagentsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReagentsList.fulfilled, (state, action) => {
        state.loading = false;
        state.reagents = action.payload;
      })
      .addCase(getReagentsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.reagents = REAGENTS_MOCK.filter(
          (item) =>
            item.name.toLowerCase().includes(state.searchValue.toLowerCase()) ||
            item.formula.toLowerCase().includes(state.searchValue.toLowerCase())
        );
      });
  },
});

export const { setSearchValue, clearSearchValue } = reagentsSlice.actions;
export default reagentsSlice.reducer;