import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api/index";
import type { Reagent } from "../modules/types";
import type { RootState } from "../store";
import { API_BASE } from "../api/config";

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
  appid?: number;
  count: number;
  reagents: ReagentInApplication[];
  methaneData: MethaneData;
  error: string | null;
  isDraft: boolean;
  loading?: boolean;
}

interface ServerMethaneReagent {
  volume?: number;
  methaneyield?: number;
  reagent?: Reagent | null;
}

interface ServerMethane {
  id?: number;
  name?: string;
  status?: string;
  temperature?: number;
  comment?: string;
  methaneyield?: number;
  reagents?: ServerMethaneReagent[];
}

const initialState: MethaneApplicationState = {
  appid: undefined,
  count: 0,
  reagents: [],
  methaneData: {
    topic: "Синтез метана по реакции Сабатье",
    reagenttemperature: "300",
    comment: "",
    volume: "1",
  },
  error: null,
  isDraft: true,
  loading: false,
};

const getErrorMessage = (error: any): string =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  "Request failed";

const applyServerMethaneToState = (
  state: MethaneApplicationState,
  payload: ServerMethane
) => {
  state.appid = payload.id;
  state.reagents = (payload.reagents ?? [])
    .filter((item) => item.reagent?.id)
    .map((item) => ({
      reagent: item.reagent as Reagent,
      count: Number(item.volume ?? 1),
    }));

  state.count = state.reagents.reduce((sum, item) => sum + item.count, 0);
  state.methaneData = {
    topic: payload.name ?? "",
    reagenttemperature:
      payload.temperature !== undefined && payload.temperature !== null
        ? String(payload.temperature)
        : "300",
    comment: payload.comment ?? "",
    volume:
      payload.methaneyield !== undefined && payload.methaneyield !== null
        ? String(payload.methaneyield)
        : "1",
  };
  state.isDraft = (payload.status ?? "draft") === "draft";
  state.error = null;
};

const ensureDraft = async (): Promise<number> => {
  try {
    const existing = await api.api.methanesDraftList();
    if (existing.data?.id) {
      return Number(existing.data.id);
    }
  } catch {
    //
  }

  const created = await api.api.methanesDraftCreate();
  if (created.data?.id) {
    return Number(created.data.id);
  }

  throw new Error("Не удалось получить или создать draft-заявку");
};

export const getMethaneApplication = createAsyncThunk<
  ServerMethane,
  void,
  { rejectValue: string }
>(
  "methaneApplication/getMethaneApplication",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.methanesDraftList();
      return response.data as ServerMethane;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addReagentToMethaneApplication = createAsyncThunk<
  ServerMethane,
  { reagentId: number; count: number },
  { rejectValue: string; state: RootState }
>(
  "methaneApplicationDraft/addReagent",
  async ({ reagentId, count }, { getState, dispatch, rejectWithValue }) => {
    try {
      const numericReagentId = Number(reagentId);
      const numericCount = Number(count);

      if (!Number.isFinite(numericReagentId) || numericReagentId <= 0) {
        return rejectWithValue(`Некорректный reagentId: ${String(reagentId)}`);
      }

      if (!Number.isFinite(numericCount) || numericCount <= 0) {
        return rejectWithValue(`Некорректный объем: ${String(count)}`);
      }

      let appId = getState().methaneApplicationDraft.appid;

      if (!appId) {
        appId = await ensureDraft();
      }

      if (!appId || appId <= 0) {
        return rejectWithValue("Не удалось создать черновик");
      }

      dispatch(setAppId(appId));

      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      const payload = {
        reagent_id: numericReagentId,
        volume: numericCount,
      };

      console.log("ADD REAGENT payload:", payload);

      const response = await fetch(`${API_BASE}/api/methanes/${appId}/reagents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      let parsed: any = {};
      try {
        parsed = rawText ? JSON.parse(rawText) : {};
      } catch {
        parsed = { error: rawText };
      }

      if (!response.ok) {
        return rejectWithValue(parsed?.error || `HTTP ${response.status}`);
      }

      const updated = await api.api.methanesDetail(appId);
      return updated.data as ServerMethane;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Не удалось добавить реагент в заявку"
      );
    }
  }
);

export const saveMethaneTemperature = createAsyncThunk<
  ServerMethane,
  { appId?: number; temperature: string },
  { rejectValue: string; state: RootState }
>(
  "methaneApplicationDraft/saveTemperature",
  async ({ appId, temperature }, { getState, rejectWithValue }) => {
    try {
      const draftId = appId ?? (await ensureDraft());
      await api.api.methanesFormUpdate(draftId, {
        name: getState().methaneApplicationDraft.methaneData.topic ?? "",
        temperature: Number(temperature || 0),
        methaneyield: Number(
          getState().methaneApplicationDraft.methaneData.volume || 0
        ),
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
  "methaneApplicationDraft/saveVolume",
  async ({ appId, volume }, { getState, rejectWithValue }) => {
    try {
      const draftId = appId ?? (await ensureDraft());
      await api.api.methanesFormUpdate(draftId, {
        name: getState().methaneApplicationDraft.methaneData.topic ?? "",
        temperature: Number(
          getState().methaneApplicationDraft.methaneData.reagenttemperature || 0
        ),
        methaneyield: Number(volume || 0),
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
  "methaneApplicationDraft/saveForm",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().methaneApplicationDraft;
      const draftId = await ensureDraft();

      await api.api.methanesFormUpdate(draftId, {
        name: state.methaneData.topic ?? "",
        temperature: Number(state.methaneData.reagenttemperature || 0),
        methaneyield: Number(state.methaneData.volume || 0),
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
  "methaneApplicationDraft/saveReagentQuantity",
  async ({ reagentId, count }, { getState, rejectWithValue }) => {
    try {
      const appId = getState().methaneApplicationDraft.appid;

      if (!appId) {
        return rejectWithValue("Черновик заявки не найден");
      }

      const numericReagentId = Number(reagentId);
      const numericCount = Number(count);

      if (!Number.isFinite(numericReagentId) || numericReagentId <= 0) {
        return rejectWithValue(`Некорректный reagentId: ${String(reagentId)}`);
      }

      if (!Number.isFinite(numericCount) || numericCount <= 0) {
        return rejectWithValue(`Некорректный объем: ${String(count)}`);
      }

      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      const payload = {
        reagent_id: numericReagentId,
        volume: numericCount,
      };

      console.log("UPDATE REAGENT payload:", payload);

      const response = await fetch(
        `${API_BASE}/api/methanes/${appId}/reagents/${numericReagentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const rawText = await response.text();
      let parsed: any = {};
      try {
        parsed = rawText ? JSON.parse(rawText) : {};
      } catch {
        parsed = { error: rawText };
      }

      if (!response.ok) {
        return rejectWithValue(parsed?.error || `HTTP ${response.status}`);
      }

      const updated = await api.api.methanesDetail(appId);
      return updated.data as ServerMethane;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Не удалось сохранить количество"
      );
    }
  }
);

export const removeReagentFromMethaneApplication = createAsyncThunk<
  ServerMethane,
  number,
  { rejectValue: string; state: RootState }
>(
  "methaneApplication/removeReagentFromMethaneApplication",
  async (reagentId, { getState, rejectWithValue }) => {
    try {
      const appId = getState().methaneApplicationDraft.appid;
      if (!appId) {
        return rejectWithValue("Нет активной заявки");
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
  "methaneApplication/clearMethaneApplicationOnServer",
  async (_, { getState, rejectWithValue }) => {
    try {
      const appId = getState().methaneApplicationDraft.appid;
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
  name: "methaneApplicationDraft",
  initialState,
  reducers: {
    setAppId: (state, action: PayloadAction<number | undefined>) => {
      state.appid = action.payload;
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
      state.appid = undefined;
      state.count = 0;
      state.reagents = [];
      state.methaneData = {
        topic: "",
        reagenttemperature: "300",
        comment: "",
        volume: "1",
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
        state.error = action.payload ?? "Failed to load draft";
      })
      .addCase(addReagentToMethaneApplication.fulfilled, (state, action) => {
        applyServerMethaneToState(state, action.payload);
      })
      .addCase(addReagentToMethaneApplication.rejected, (state, action) => {
        state.error = action.payload ?? "Не удалось добавить реагент";
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