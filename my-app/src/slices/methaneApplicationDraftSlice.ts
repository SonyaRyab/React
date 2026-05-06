import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';
import type { Reagent } from '../modules/types';
import type { RootState } from '../store';

interface ReagentInApplication {
  reagent: Reagent;
  count: number;
}

interface MethaneData {
  processname?: string | null;
  reagenttemperature?: string | null;
  comment?: string | null;
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
  reagents?: ServerMethaneReagent[];
}

const initialState: MethaneApplicationState = {
  app_id: undefined,
  count: 0,
  reagents: [],
  methaneData: {
    processname: 'Синтез метана по реакции Сабатье',
    reagenttemperature: '300-400',
    comment: '',
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
    processname: payload.name ?? '',
    reagenttemperature:
      payload.temperature !== undefined && payload.temperature !== null
        ? String(payload.temperature)
        : '300-400',
    comment: payload.comment ?? '',
  };
  state.isDraft = (payload.status ?? 'draft') === 'draft';
  state.error = null;
};

export const getMethaneApplication = createAsyncThunk<
  ServerMethane,
  void,
  { rejectValue: string }
>('methaneApplication/getMethaneApplication', async (_, { rejectWithValue }) => {
  try {
    const response = await api.api.methanesDraftList();
    return response.data as unknown as ServerMethane;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addReagentToMethaneApplication = createAsyncThunk<
  ServerMethane,
  Reagent,
  { rejectValue: string; state: { methaneApplicationDraft: MethaneApplicationState } }
>(
  'methaneApplicationDraft/addReagent',
  async (reagent, { getState, rejectWithValue }) => {
    try {
      let appId = getState().methaneApplicationDraft.app_id;

      // Если нет appId, пробуем получить или создать черновик
      if (!appId) {
        try {
          const draftResp = await api.api.methanesDraftList();
          if (draftResp.data?.id) {
            appId = draftResp.data.id;
          }
        } catch {}

        if (!appId) {
          const createResp = await api.api.methanesDraftCreate();
          if (createResp.data?.id) {
            appId = createResp.data.id;
          }
        }
      }

      if (!appId) {
        return rejectWithValue('Не удалось получить id черновика');
      }

      // Добавляем реагент
      const response = await api.api.methanesReagentsCreate(appId, {
        reagent_id: reagent.id!,
        quantity: 1,
      });

      return response.data as ServerMethane;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error ||
        error?.message ||
        'Не удалось добавить реагент в заявку'
      );
    }
  }
);

export const removeReagentFromMethaneApplication = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  'methaneApplication/removeReagentFromMethaneApplication',
  async (reagentId, { rejectWithValue }) => {
    try {
      return reagentId;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateMethaneApplication = createAsyncThunk<
  any,
  { appId: number; methaneData: MethaneData },
  { rejectValue: string }
>(
  'methaneApplication/updateMethaneApplication',
  async ({ appId, methaneData }, { rejectWithValue }) => {
    try {
      const response = await api.api.methanesFormUpdate(appId, {
        name: methaneData.processname ?? '',
        temperature: Number(methaneData.reagenttemperature ?? 0),
        methane_yield: 0,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const clearMethaneApplicationOnServer = createAsyncThunk<
  boolean,
  string,
  { rejectValue: string }
>(
  'methaneApplication/clearMethaneApplicationOnServer',
  async (_, { rejectWithValue }) => {
    try {
      return true;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const loadMethaneApplicationById = createAsyncThunk<
  any, // Используй DsMethane, если импортируешь из Api.ts
  number,
  { rejectValue: string }
>(
  'methaneApplicationDraft/loadMethaneApplicationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.api.methanesDetail(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Не удалось загрузить заявку'
      );
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
    updateReagentCount: (
      state,
      action: PayloadAction<{ reagentId: number; count: number }>
    ) => {
      const item = state.reagents.find(
        (r) => r.reagent.id === action.payload.reagentId
      );
      if (item) {
        item.count = action.payload.count;
      }
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
        processname: '',
        reagenttemperature: '300-400',
        comment: '',
      };
      state.error = null;
      state.isDraft = true;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(getMethaneApplication.pending, (state) => {
        state.error = null;
      })
      .addCase(getMethaneApplication.fulfilled, (state, action) => {
        applyServerMethaneToState(state, action.payload);
      })
      .addCase(getMethaneApplication.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to load draft';
      })

      // .addCase(addReagentToMethaneApplication.fulfilled, (state, action) => {
      //   if (action.payload.appid) {
      //     state.app_id = action.payload.appid;
      //   }

      //   const existing = state.reagents.find(
      //     (item) => item.reagent.id === action.payload.reagent.id
      //   );

      //   if (existing) {
      //     existing.count = action.payload.count;
      //   } else {
      //     state.reagents.push({
      //       reagent: action.payload.reagent,
      //       count: action.payload.count,
      //     });
      //   }

      //   state.count = state.reagents.reduce((sum, item) => sum + item.count, 0);
      //   state.isDraft = true;
      //   state.error = null;
      // })
      // .addCase(addReagentToMethaneApplication.rejected, (state, action) => {
      //   state.error = action.payload ?? 'Failed to add reagent';
      // })

      .addCase(addReagentToMethaneApplication.fulfilled, (state, action) => {
        applyServerMethaneToState(state, action.payload);
      })
      .addCase(addReagentToMethaneApplication.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to add reagent';
      })

      .addCase(removeReagentFromMethaneApplication.fulfilled, (state, action) => {
        state.reagents = state.reagents.filter(
          (item) => item.reagent.id !== action.payload
        );
        state.count = state.reagents.reduce((sum, item) => sum + item.count, 0);
      })

      .addCase(updateMethaneApplication.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(updateMethaneApplication.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to update methane application';
      })

      .addCase(clearMethaneApplicationOnServer.fulfilled, (state) => {
        state.app_id = undefined;
        state.count = 0;
        state.reagents = [];
        state.error = null;
        state.isDraft = true;
      })
      .addCase(clearMethaneApplicationOnServer.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to clear draft';
      })
      
      .addCase(loadMethaneApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMethaneApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        
        const methane = action.payload;
        
        state.app_id = methane.id ?? null;
        state.isDraft = methane.status === 'draft';
        
        state.methaneData = {
          processname: methane.name ?? '',
          reagenttemperature: methane.temperature?.toString() ?? '',
          comment: '',
        };
        
        state.reagents = (methane.reagents ?? []).map((item: any) => ({
          reagent: {
            id: item.reagent?.id ?? 0,
            name: item.reagent?.name ?? '',
            formula: item.reagent?.formula ?? '',
            price: item.reagent?.price ?? 0,
          },
          count: item.quantity ?? 1,
        }));
        
        state.count = state.reagents.reduce((sum, item) => sum + item.count, 0);
      })
      .addCase(loadMethaneApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Ошибка загрузки заявки';
      }),
});


export const {
  setAppId,
  setCount,
  setError,
  setMethaneData,
  updateReagentCount,
  loadDraftFromServer,
  resetDraft,
} = methaneApplicationDraftSlice.actions;

export default methaneApplicationDraftSlice.reducer;