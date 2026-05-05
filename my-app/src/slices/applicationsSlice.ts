//список заявок, фильтры, polling, смена статуса

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

export type ApplicationStatus =
  | 'draft'
  | 'formed'
  | 'completed'
  | 'rejected'
  | string;

export interface ApplicationUser {
  id?: number;
  login?: string;
  username?: string;
  role?: string;
  uuid?: string;
  email?: string;
}

export interface ApplicationReagent {
  methane_yield?: number;
  quantity?: number;
}

export interface ApplicationItem {
  id: number;
  name?: string;
  status?: ApplicationStatus;
  date_create?: string;
  date_update?: string;
  date_finish?: string;
  researcher?: ApplicationUser | null;
  professor?: ApplicationUser | null;
  reagents?: ApplicationReagent[];
}

export interface ApplicationsFilters {
  status: string;
  createdFrom: string;
  createdTo: string;
  creator: string;
}

interface ApplicationsState {
  items: ApplicationItem[];
  currentItem: ApplicationItem | null;
  loading: boolean;
  error: string | null;
  filters: ApplicationsFilters;
  pollingEnabled: boolean;
}

const initialState: ApplicationsState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    createdFrom: '',
    createdTo: '',
    creator: '',
  },
  pollingEnabled: true,
};

const getErrorMessage = (error: any): string =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Ошибка запроса';

const normalizeArray = (payload: any): ApplicationItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const fetchMyApplications = createAsyncThunk<
  ApplicationItem[],
  void,
  { rejectValue: string; state: any }
>('applications/fetchMyApplications', async (_, { rejectWithValue }) => {
  try {
    const response = await api.methanes.methanesList?.();
    return normalizeArray(response?.data);
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAllApplications = createAsyncThunk<
  ApplicationItem[],
  void,
  { rejectValue: string; state: any }
>('applications/fetchAllApplications', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const { status, createdFrom, createdTo } = state.applications.filters as ApplicationsFilters;

    const response = await api.methanes.methanesList?.();
    let items = normalizeArray(response?.data);

    if (status) {
      items = items.filter((item) => item.status === status);
    }

    if (createdFrom) {
      const from = new Date(createdFrom).setHours(0, 0, 0, 0);
      items = items.filter((item) => {
        if (!item.date_create) return false;
        return new Date(item.date_create).getTime() >= from;
      });
    }

    if (createdTo) {
      const to = new Date(createdTo).setHours(23, 59, 59, 999);
      items = items.filter((item) => {
        if (!item.date_create) return false;
        return new Date(item.date_create).getTime() <= to;
      });
    }

    return items;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchApplicationById = createAsyncThunk<
  ApplicationItem,
  number,
  { rejectValue: string }
>('applications/fetchApplicationById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.methanes.methanesList?.();
    const items = normalizeArray(response?.data);
    const found = items.find((item) => item.id === id);

    if (!found) {
      throw new Error('Заявка не найдена');
    }

    return found;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const confirmDraftApplication = createAsyncThunk<
  boolean,
  { id: number; payload: { name: string; temperature: number; methane_yield: number } },
  { rejectValue: string }
>('applications/confirmDraftApplication', async ({ id, payload }, { rejectWithValue }) => {
  try {
    await api.instance.put(`/api/methanes/${id}/form`, payload);
    return true;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const changeApplicationStatus = createAsyncThunk<
  boolean,
  { id: number; status: string },
  { rejectValue: string }
>('applications/changeApplicationStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    await api.instance.put(`/api/methanes/${id}/complete`, { status });
    return true;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    setApplicationsFilter<K extends keyof ApplicationsFilters>(
      state,
      action: PayloadAction<{ key: K; value: ApplicationsFilters[K] }>
    ) {
      state.filters[action.payload.key] = action.payload.value;
    },
    resetApplicationsFilters(state) {
      state.filters = {
        status: '',
        createdFrom: '',
        createdTo: '',
        creator: '',
      };
    },
    setPollingEnabled(state, action: PayloadAction<boolean>) {
      state.pollingEnabled = action.payload;
    },
    clearCurrentApplication(state) {
      state.currentItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось загрузить заявки';
      })

      .addCase(fetchAllApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось загрузить заявки';
      })

      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось загрузить заявку';
      })

      .addCase(confirmDraftApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmDraftApplication.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(confirmDraftApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось сформировать заявку';
      })

      .addCase(changeApplicationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeApplicationStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changeApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось изменить статус заявки';
      });
  },
});

export const {
  setApplicationsFilter,
  resetApplicationsFilters,
  setPollingEnabled,
  clearCurrentApplication,
} = applicationsSlice.actions;

export default applicationsSlice.reducer;