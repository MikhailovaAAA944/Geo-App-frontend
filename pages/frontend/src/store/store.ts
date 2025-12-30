import {configureStore} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useSelector} from "react-redux";
import rocketsReducer from "./slices/rocketsSlice.ts"

export const store = configureStore({
    reducer: {
        rockets: rocketsReducer
    }
});

export type RootState = ReturnType<typeof store.getState>
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;