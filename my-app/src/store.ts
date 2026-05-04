// глобальное хранилище
import { configureStore } from "@reduxjs/toolkit";
import reagentsReducer from './slices/reagentsSlice';
import userReducer from './slices/userSlice'; 
import methaneApplicationDraftReducer from './slices/methaneApplicationDraftSlice';

export const store = configureStore({
    reducer: {
        reagents: reagentsReducer,
        user: userReducer,  
        methaneApplicationDraft: methaneApplicationDraftReducer,      
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;