import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

export type ApplicationStatus =
  | 'draft'
  | 'formed'
  | 'completed'
  | 'rejected'
  | 'today'
  | string;

export interface ApplicationUser {
  id?: number;
  login?: string;
  username?: string;
  role?: string;
  uuid?: string;
  email?: string;
}

export interface ApplicationReagentDetails {
  id?: number;
  name?: string;
  formula?: string;
  price?: number;
  img?: string;
  molarmass?: number;
}

export interface ApplicationReagent {
  id?: number;
  volume?: number;
  methaneyield?: number;
  reagent?: ApplicationReagentDetails | null;
}

export interface ApplicationItem {
  id: number;
  name?: string;
  status?: ApplicationStatus;
  datecreate?: string;
  dateupdate?: string;
  datefinish?: string;
  temperature?: number;
  methaneyield?: number;
  topic?: string;
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

const today = new Date();
const todayValue = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`;

const initialState: ApplicationsState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  filters: {
    status: 'today',
    createdFrom: todayValue,
    createdTo: todayValue,
    creator: '',
  },
  pollingEnabled: true,
};

const getErrorMessage = (error: any): string =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Ошибка запроса';

const normalizeItem = (item: any): ApplicationItem => ({
  id: Number(item.id),
  name: item.name ?? item.topic ?? '',
  topic: item.name ?? item.topic ?? '',
  status: item.status ?? '',
  datecreate: item.datecreate ?? item.date_create ?? '',
  dateupdate: item.dateupdate ?? item.date_update ?? '',
  datefinish: item.datefinish ?? item.date_finish ?? '',
  temperature: item.temperature ?? null,
  methaneyield: item.methaneyield ?? item.methane_yield ?? null,
  researcher: item.researcher ?? null,
  professor: item.professor ?? null,
  reagents: item.reagents ?? [],
});

const normalizeArray = (payload: any): ApplicationItem[] => {
  const source = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  return source.map(normalizeItem);
};

const isInToday = (value?: string) => {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return date >= start && date <= end;
};

export const fetchMyApplications = createAsyncThunk<
  ApplicationItem[],
  void,
  { rejectValue: string }
>('applications/fetchMyApplications', async (_, { rejectWithValue }) => {
  try {
    const response = await api.api.methanesList?.();
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

    const response = await api.api.methanesList?.();
    let items = normalizeArray(response?.data);

    if (status && status !== 'today') {
      items = items.filter((item) => item.status === status);
    }

    if (status === 'today') {
      items = items.filter((item) => isInToday(item.datecreate));
    }

    if (createdFrom) {
      const from = new Date(createdFrom);
      from.setHours(0, 0, 0, 0);
      items = items.filter((item) => {
        if (!item.datecreate) return false;
        return new Date(item.datecreate).getTime() >= from.getTime();
      });
    }

    if (createdTo) {
      const to = new Date(createdTo);
      to.setHours(23, 59, 59, 999);
      items = items.filter((item) => {
        if (!item.datecreate) return false;
        return new Date(item.datecreate).getTime() <= to.getTime();
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
>(
  'applications/fetchApplicationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.api.methanesDetail(id);
      return normalizeItem(response.data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const confirmDraftApplication = createAsyncThunk<
  boolean,
  { id: number; payload: { name: string; temperature: number; methaneyield: number } },
  { rejectValue: string }
>('applications/confirmDraftApplication', async ({ id, payload }, { rejectWithValue }) => {
  try {
    await api.api.methanesFormUpdate(id, {
      name: payload.name,
      temperature: payload.temperature,
      methane_yield: payload.methaneyield,
    });
    await api.api.methanesCompleteUpdate(id, { status: 'formed' });
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
    await api.api.methanesCompleteUpdate(id, { status });
    return true;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    setApplicationsFilter: <K extends keyof ApplicationsFilters>(
      state: ApplicationsState,
      action: PayloadAction<{ key: K; value: ApplicationsFilters[K] }>
    ) => {
      state.filters[action.payload.key] = action.payload.value;
    },
    resetApplicationsFilters: (state) => {
      state.filters = {
        status: 'today',
        createdFrom: todayValue,
        createdTo: todayValue,
        creator: '',
      };
    },
    setPollingEnabled: (state, action: PayloadAction<boolean>) => {
      state.pollingEnabled = action.payload;
    },
    clearCurrentApplication: (state) => {
      state.currentItem = null;
    },
  },
  extraReducers: (builder) =>
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
        state.error = action.payload ?? 'Failed to fetch applications';
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
        state.error = action.payload ?? 'Failed to fetch all applications';
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
        state.error = action.payload ?? 'Failed to fetch application';
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
        state.error = action.payload ?? 'Failed to confirm application';
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
        state.error = action.payload ?? 'Failed to change status';
      }),
});

export const {
  setApplicationsFilter,
  resetApplicationsFilters,
  setPollingEnabled,
  clearCurrentApplication,
} = applicationsSlice.actions;

export default applicationsSlice.reducer;