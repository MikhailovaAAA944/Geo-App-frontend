import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {T_Calculation, T_Rocket} from "src/utils/types.ts";
import {AsyncThunkConfig} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {api} from "modules/api.ts";
import {AxiosResponse} from "axios";
import {NEXT_YEAR, PREV_YEAR} from "utils/consts.ts";

type T_payloadcalculationsSlice = {
    draft_payloadcalculation_id: number | null,
    rockets_count: number | null,
    payloadcalculation: T_Calculation | null,
    payloadcalculations: T_Calculation[],
    filters: T_payloadcalculationsFilters,
    save_mm: boolean
}

export type T_payloadcalculationsFilters = {
    date_formation_start: string
    date_formation_end: string
    status: number
}

const initialState:T_payloadcalculationsSlice = {
    draft_payloadcalculation_id: null,
    rockets_count: null,
    payloadcalculation: null,
    payloadcalculations: [],
    filters: {
        status: 0,
        date_formation_start: PREV_YEAR.toISOString().split('T')[0],
        date_formation_end: NEXT_YEAR.toISOString().split('T')[0]
    },
    save_mm: false
}

export const fetchPayloadcalculation = createAsyncThunk<T_Calculation, string, AsyncThunkConfig>(
    "payloadcalculations/payloadcalculation",
    async function(calculation_id) {
        const response = await api.payloadcalculation.payloadcalculationRead(calculation_id) as unknown as AxiosResponse<T_Calculation>
        return response.data
    }
)

export const fetchPayloadcalculations = createAsyncThunk<T_Calculation[], object, AsyncThunkConfig>(
    "payloadcalculations/payloadcalculations",
    async function(_, thunkAPI) {
        const state = thunkAPI.getState()

        const response = await api.payloadcalculation.payloadcalculationList({
            status: state.payloadcalculations.filters.status,
            date_formation_start: state.payloadcalculations.filters.date_formation_start,
            date_formation_end: state.payloadcalculations.filters.date_formation_end
        }) as unknown as AxiosResponse<T_Calculation[]>
        return response.data
    }
)

export const removeRocketFromDraftPayloadcalculation = createAsyncThunk<T_Rocket[], string, AsyncThunkConfig>(
    "payloadcalculations/remove_rocket",
    async function(rocket_id, thunkAPI) {
        const state = thunkAPI.getState()
        console.log(state);
        console.log(state.payloadcalculations);
        console.log(state.payloadcalculations.payloadcalculation);
        const response = await api.mm.mmPayloadcalculationDeleteRocketDelete(state.payloadcalculations.payloadcalculation.pk, rocket_id) as unknown as AxiosResponse<T_Rocket[]>
        return response.data
    }
)

export const deleteDraftPayloadcalculation = createAsyncThunk<void, object, AsyncThunkConfig>(
    "payloadcalculations/delete_draft_payloadcalculation",
    async function(_, {getState}) {
        const state = getState()
        console.log(state);
        console.log(state.payloadcalculations);
        console.log(state.payloadcalculations.payloadcalculation);

        await api.payloadcalculation.payloadcalculationDeleteDelete(state.payloadcalculations.payloadcalculation.pk)
    }
)

export const sendDraftPayloadcalculation = createAsyncThunk<
    void, 
    {
        cosmodrome: string;
        comment?: string;
    }, 
    AsyncThunkConfig
>(
    "payloadcalculations/send_draft_payloadcalculation",
    async function(payload, {getState}) {
        const state = getState();
        console.log('Payload data:', payload); 
        
        await api.payloadcalculation.payloadcalculationUpdateStatusUserUpdate(
            state.payloadcalculations.payloadcalculation.pk,
            {
                cosmodrome: payload.cosmodrome,
                comment: payload.comment || "" // отправляем пустую строку если undefined
            }
        );
    }
);

export const updatePayloadcalculation = createAsyncThunk<void, object, AsyncThunkConfig>(
    "payloadcalculations/update_payloadcalculation",
    async function(data, {getState}) {
        const state = getState()
        await api.payloadcalculations.payloadcalculationsUpdateUpdate(state.payloadcalculations.payloadcalculation.id, {
            ...data
        })
    }
)

export const updateRocketValue = createAsyncThunk<void, object, AsyncThunkConfig>(
    "payloadcalculations/update_mm_value",
    async function({rocket_id, comment},thunkAPI) {
        const state = thunkAPI.getState()
        await api.payloadcalculations.payloadcalculationsUpdateRocketUpdate(state.payloadcalculations.payloadcalculation.id, rocket_id, {comment})
    }
)

const payloadcalculationsSlice = createSlice({
    name: 'payloadcalculations',
    initialState: initialState,
    reducers: {
        savePayloadcalculation: (state, action) => {
            state.draft_payloadcalculation_id = action.payload.draft_payloadcalculation_id
            state.rockets_count = action.payload.rockets_count
        },
        removePayloadcalculation: (state) => {
            state.payloadcalculation = null
        },
        triggerUpdateMM: (state) => {
            state.save_mm = !state.save_mm
        },
        updateFilters: (state, action) => {
            state.filters = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPayloadcalculation.fulfilled, (state:T_payloadcalculationsSlice, action: PayloadAction<T_Calculation>) => {
            state.payloadcalculation = action.payload
        });
        builder.addCase(fetchPayloadcalculations.fulfilled, (state:T_payloadcalculationsSlice, action: PayloadAction<T_Calculation[]>) => {
            state.payloadcalculations = action.payload
        });
        builder.addCase(removeRocketFromDraftPayloadcalculation.rejected, (state:T_payloadcalculationsSlice) => {
            state.payloadcalculation = null
        });
        builder.addCase(removeRocketFromDraftPayloadcalculation.fulfilled, (state:T_payloadcalculationsSlice, action: PayloadAction<T_Rocket[]>) => {
            (state.payloadcalculation as T_Calculation).rocket = action.payload
        });
        builder.addCase(sendDraftPayloadcalculation.fulfilled, (state:T_payloadcalculationsSlice) => {
            state.payloadcalculation = null
        });
    }
})

export const { savePayloadcalculation, removePayloadcalculation, triggerUpdateMM, updateFilters } = payloadcalculationsSlice.actions;

export default payloadcalculationsSlice.reducer