import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';
import type { Reagent } from '../modules/types';

interface ReagentInApplication {
  reagent: Reagent;
  count: number;
}

interface MethaneData {
  process_name?: string | null;
  reagent_temperature?: string | null;
  comment?: string | null;
}

interface MethaneApplicationState {
  app_id?: number;
  count: number;
  reagents: ReagentInApplication[];
  methaneData: MethaneData;
  error: string | null;
  isDraft: boolean;
}

const initialState: MethaneApplicationState = {
  app_id: undefined,
  count: 0,
  reagents: [],
  methaneData: {
    process_name: 'Синтез метана по реакции Сабатье',
    reagent_temperature: '300-400',
    comment: '',
  },
  error: null,
  isDraft: true,
};

export const getMethaneApplication = createAsyncThunk(
  'methaneApplication/getMethaneApplication',
  async (appId: string, { rejectWithValue }) => {
    try {
      // Подставь точное имя метода из твоего сгенерированного Api.ts
      const response = await api.methaneApplications.methaneApplicationsRead(appId);
      return response.data;
    } catch {
      return rejectWithValue('Ошибка при загрузке заявки');
    }
  }
);

export const addReagentToMethaneApplication = createAsyncThunk(
  'methaneApplication/addReagentToMethaneApplication',
  async (reagent: Reagent, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const existing = state.methaneApplicationDraft.reagents.find(
        (item: ReagentInApplication) => item.reagent.id === reagent.id
      );

      return {
        reagent,
        count: existing ? existing.count + 1 : 1,
      };
    } catch {
      return rejectWithValue('Ошибка при добавлении реагента');
    }
  }
);

export const removeReagentFromMethaneApplication = createAsyncThunk(
  'methaneApplication/removeReagentFromMethaneApplication',
  async (reagentId: number, { rejectWithValue }) => {
    try {
      return reagentId;
    } catch {
      return rejectWithValue('Ошибка при удалении реагента');
    }
  }
);

export const updateMethaneApplication = createAsyncThunk(
  'methaneApplication/updateMethaneApplication',
  async ({
    appId,
    methaneData,
  }: {
    appId: string;
    methaneData: MethaneData;
  },
  { rejectWithValue }
) => {
    try {
      // Подставь точное имя метода из твоего сгенерированного Api.ts
      const response =
        await api.methaneApplications.methaneApplicationsUpdateMethaneApplicationUpdate(
          appId,
          methaneData
        );
      return response.data;
    } catch {
      return rejectWithValue('Ошибка при обновлении заявки');
    }
  }
);

export const clearMethaneApplicationOnServer = createAsyncThunk(
  'methaneApplication/clearMethaneApplicationOnServer',
  async (appId: string, { rejectWithValue }) => {
    try {
      // Подставь точное имя метода из твоего сгенерированного Api.ts
      await api.methaneApplications.methaneApplicationsDeleteMethaneApplicationDelete(appId);
      return true;
    } catch {
      return rejectWithValue('Ошибка при удалении заявки');
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
      state.methaneData = {
        ...state.methaneData,
        ...action.payload,
      };
    },
    updateReagentCount(
      state,
      action: PayloadAction<{ reagentId: number; count: number }>
    ) {
      const item = state.reagents.find(
        (r) => r.reagent.id === action.payload.reagentId
      );
      if (item) {
        item.count = action.payload.count;
      }
      state.count = state.reagents.reduce((sum, r) => sum + r.count, 0);
    },
    resetDraft(state) {
      state.app_id = undefined;
      state.count = 0;
      state.reagents = [];
      state.methaneData = {
        process_name: 'Синтез метана по реакции Сабатье',
        reagent_temperature: '300-400',
        comment: '',
      };
      state.error = null;
      state.isDraft = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addReagentToMethaneApplication.fulfilled, (state, action) => {
        const existing = state.reagents.find(
          (item) => item.reagent.id === action.payload.reagent.id
        );
        if (existing) {
          existing.count = action.payload.count;
        } else {
          state.reagents.push(action.payload);
        }
        state.count = state.reagents.reduce((sum, item) => sum + item.count, 0);
        state.isDraft = true;
        state.error = null;
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
        state.error = action.payload as string;
      })
      .addCase(clearMethaneApplicationOnServer.fulfilled, (state) => {
        state.app_id = undefined;
        state.count = 0;
        state.reagents = [];
        state.error = null;
        state.isDraft = true;
      });
  },
});

export const {
  setAppId,
  setCount,
  setError,
  setMethaneData,
  updateReagentCount,
  resetDraft,
} = methaneApplicationDraftSlice.actions;

export default methaneApplicationDraftSlice.reducer;