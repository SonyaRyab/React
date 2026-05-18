import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';
import type { Reagent } from '../modules/types';
import type { RootState } from '../store';

interface ReagentInApplication {
  reagent: Reagent;
  count: number;
}

interface MethaneData {
  topic?: string | null;
  reagenttemperature?: string | null;
  comment?: string | null;
  volume?: string | null;
}

interface MethaneApplicationState {
  app_id?: number;
  count: number;
  reagents: ReagentInApplication[];
  methaneData: MethaneData;
  error: string | null;
  isDraft: boolean;
  loading?: boolean;
}

interface ServerMethaneReagent {
  quantity?: number;
  methaneyield?: number;
  reagent?: Reagent | null;
}

interface ServerMethane {
  id?: number;
  name?: string;
  status?: string;
  temperature?: number;
  comment?: string;
  methane_yield?: number;
  reagents?: ServerMethaneReagent[];
}

const initialState: MethaneApplicationState = {
  app_id: undefined,
  count: 0,
  reagents: [],
  methaneData: {
    topic: 'Синтез метана по реакции Сабатье',
    reagenttemperature: '300',
    comment: '',
    volume: '1',
  },
  error: null,
  isDraft: true,
  loading: false,
};

const getErrorMessage = (error: any): string =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'Request failed';

const applyServerMethaneToState = (
  state: MethaneApplicationState,
  payload: ServerMethane
) => {
  state.app_id = payload.id;
  state.reagents = (payload.reagents ?? [])
    .filter((item) => item.reagent?.id)
    .map((item) => ({
      reagent: item.reagent as Reagent,
      count: Number(item.quantity ?? 1),
    }));

  state.count = state.reagents.reduce((sum, item) => sum + item.count, 0);
  state.methaneData = {
    topic: payload.name ?? '',
    reagenttemperature:
      payload.temperature !== undefined && payload.temperature !== null
        ? String(payload.temperature)
        : '300',
    comment: payload.comment ?? '',
    volume:
      payload.methane_yield !== undefined && payload.methane_yield !== null
        ? String(payload.methane_yield)
        : '1',
  };
  state.isDraft = (payload.status ?? 'draft') === 'draft';
  state.error = null;
};

const ensureDraft = async (state: RootState): Promise<number> => {
  let appId = state.methaneApplicationDraft.app_id;

  if (appId) return appId;

  try {
    const existing = await api.api.methanesDraftList();
    if (existing.data?.id) {
      return existing.data.id;
    }
  } catch {}

  const created = await api.api.methanesDraftCreate();
  if (created.data?.id) return created.data.id;

  throw new Error('Не удалось создать черновик заявки');
};

export const getMethaneApplication = createAsyncThunk<
  ServerMethane,
  void,
  { rejectValue: string }
>('methaneApplication/getMethaneApplication', async (_, { rejectWithValue }) => {
  try {
    const response = await api.api.methanesDraftList();
    return response.data as ServerMethane;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addReagentToMethaneApplication = createAsyncThunk<
  ServerMethane,
  { reagentId: number; count: number },
  { rejectValue: string; state: RootState }
>(
  'methaneApplicationDraft/addReagent',
  async ({ reagentId, count }, { getState, rejectWithValue }) => {
    try {
      const appId = await ensureDraft(getState());

      await api.api.methanesReagentsCreate(appId, {
        reagent_id: reagentId,
        quantity: count,
      });

      const response = await api.api.methanesDetail(appId);
      return response.data as ServerMethane;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.status === 400
          ? error?.response?.data?.message || 'Ошибка 400 при добавлении в заявку'
          : getErrorMessage(error)
      );
    }
  }
);

export const saveMethaneTemperature = createAsyncThunk<
  ServerMethane,
  { appId?: number; temperature: string },
  { rejectValue: string; state: RootState }
>(
  'methaneApplicationDraft/saveTemperature',
  async ({ appId, temperature }, { getState, rejectWithValue }) => {
    try {
      const draftId = appId || (await ensureDraft(getState()));
      await api.api.methanesFormUpdate(draftId, {
        name: getState().methaneApplicationDraft.methaneData.topic ?? '',
        temperature: Number(temperature || 0),
        methane_yield: Number(getState().methaneApplicationDraft.methaneData.volume || 0),
      });

      const response = await api.api.methanesDetail(draftId);
      return response.data as ServerMethane;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const saveMethaneVolume = createAsyncThunk<
  ServerMethane,
  { appId?: number; volume: string },
  { rejectValue: string; state: RootState }
>(
  'methaneApplicationDraft/saveVolume',
  async ({ appId, volume }, { getState, rejectWithValue }) => {
    try {
      const draftId = appId || (await ensureDraft(getState()));
      await api.api.methanesFormUpdate(draftId, {
        name: getState().methaneApplicationDraft.methaneData.topic ?? '',
        temperature: Number(getState().methaneApplicationDraft.methaneData.reagenttemperature || 0),
        methane_yield: Number(volume || 0),
      });

      const response = await api.api.methanesDetail(draftId);
      return response.data as ServerMethane;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const saveMethaneApplicationForm = createAsyncThunk<
  ServerMethane,
  void,
  { rejectValue: string; state: RootState }
>(
  'methaneApplicationDraft/saveForm',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().methaneApplicationDraft;
      const draftId = await ensureDraft(getState());

      await api.api.methanesFormUpdate(draftId, {
        name: state.methaneData.topic ?? '',
        temperature: Number(state.methaneData.reagenttemperature || 0),
        methane_yield: Number(state.methaneData.volume || 0),
      });

      const response = await api.api.methanesDetail(draftId);
      return response.data as ServerMethane;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const saveReagentQuantity = createAsyncThunk<
  ServerMethane,
  { reagentId: number; count: number },
  { rejectValue: string; state: RootState }
>(
  'methaneApplicationDraft/saveReagentQuantity',
  async ({ reagentId, count }, { getState, rejectWithValue }) => {
    try {
      const appId = getState().methaneApplicationDraft.app_id;
      if (!appId) {
        return rejectWithValue('Нет активной заявки');
      }

      await api.api.methanesReagentsUpdate(appId, reagentId, {
        quantity: count,
      });

      const response = await api.api.methanesDetail(appId);
      return response.data as ServerMethane;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeReagentFromMethaneApplication = createAsyncThunk<
  ServerMethane,
  number,
  { rejectValue: string; state: RootState }
>(
  'methaneApplication/removeReagentFromMethaneApplication',
  async (reagentId, { getState, rejectWithValue }) => {
    try {
      const appId = getState().methaneApplicationDraft.app_id;
      if (!appId) {
        return rejectWithValue('Нет активной заявки');
      }

      await api.api.methanesReagentsDelete(appId, reagentId);
      const response = await api.api.methanesDetail(appId);
      return response.data as ServerMethane;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const clearMethaneApplicationOnServer = createAsyncThunk<
  boolean,
  string,
  { rejectValue: string; state: RootState }
>(
  'methaneApplication/clearMethaneApplicationOnServer',
  async (_, { getState, rejectWithValue }) => {
    try {
      const appId = getState().methaneApplicationDraft.app_id;
      const reagents = getState().methaneApplicationDraft.reagents;

      if (!appId) return true;

      for (const item of reagents) {
        await api.api.methanesReagentsDelete(appId, item.reagent.id);
      }

      return true;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const methaneApplicationDraftSlice = createSlice({
  name: 'methaneApplicationDraft',
  initialState,
  reducers: {
    setAppId: (state, action: PayloadAction<number | undefined>) => {
      state.app_id = action.payload;
    },
    setCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMethaneData: (state, action: PayloadAction<Partial<MethaneData>>) => {
      state.methaneData = { ...state.methaneData, ...action.payload };
    },
    updateReagentCountLocal: (
      state,
      action: PayloadAction<{ reagentId: number; count: number }>
    ) => {
      const item = state.reagents.find(
        (r) => r.reagent.id === action.payload.reagentId
      );
      if (item) item.count = action.payload.count;
      state.count = state.reagents.reduce((sum, r) => sum + r.count, 0);
    },
    loadDraftFromServer: (state, action: PayloadAction<ServerMethane>) => {
      applyServerMethaneToState(state, action.payload);
    },
    resetDraft: (state) => {
      state.app_id = undefined;
      state.count = 0;
      state.reagents = [];
      state.methaneData = {
        topic: '',
        reagenttemperature: '300',
        comment: '',
        volume: '1',
      };
      state.error = null;
      state.isDraft = true;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(getMethaneApplication.fulfilled, (state, action) => {
        applyServerMethaneToState(state, action.payload);
      })
      .addCase(getMethaneApplication.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to load draft';
      })
      .addCase(addReagentToMethaneApplication.fulfilled, (state, action) => {
        applyServerMethaneToState(state, action.payload);
      })
      .addCase(addReagentToMethaneApplication.rejected, (state, action) => {
        state.error = action.payload ?? 'Не удалось добавить реагент';
      })
      .addCase(saveMethaneTemperature.fulfilled, (state, action) => {
        applyServerMethaneToState(state, action.payload);
      })
      .addCase(saveMethaneVolume.fulfilled, (state, action) => {
        applyServerMethaneToState(state, action.payload);
      })
      .addCase(saveMethaneApplicationForm.fulfilled, (state, action) => {
        applyServerMethaneToState(state, action.payload);
      })
      .addCase(saveReagentQuantity.fulfilled, (state, action) => {
        applyServerMethaneToState(state, action.payload);
      })
      .addCase(removeReagentFromMethaneApplication.fulfilled, (state, action) => {
        applyServerMethaneToState(state, action.payload);
      })
      .addCase(clearMethaneApplicationOnServer.fulfilled, (state) => {
        state.reagents = [];
        state.count = 0;
      }),
});

export const {
  setAppId,
  setCount,
  setError,
  setMethaneData,
  updateReagentCountLocal,
  loadDraftFromServer,
  resetDraft,
} = methaneApplicationDraftSlice.actions;

export default methaneApplicationDraftSlice.reducer;