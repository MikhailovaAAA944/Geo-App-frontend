import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {T_Rocket, T_RocketsListResponse} from "src/utils/types.ts";
import {AsyncThunkConfig} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {savePayloadcalculation} from "store/slices/payloadcalculationsSlice.ts";
import {api} from "modules/api.ts";
import {AxiosResponse} from "axios";

type T_RocketsSlice = {
    rocket_name: string
    selectedRocket: null | T_Rocket
    rockets: T_Rocket[]
}

const initialState:T_RocketsSlice = {
    rocket_name: "",
    selectedRocket: null,
    rockets: []
}

export const fetchRocket = createAsyncThunk<T_Rocket, string, AsyncThunkConfig>(
    "fetch_rocket",
    async function(id) {
        const response = await api.launchvehicle.launchvehicleRead(id) as unknown as AxiosResponse<T_Rocket>
        return response.data
    }
)

export const fetchRockets = createAsyncThunk<T_Rocket[], object, AsyncThunkConfig>(
    "fetch_rockets",
    async function(_, thunkAPI) {
        const state = thunkAPI.getState();
        const response = await api.launchvehicle.launchvehicleList({
            title: state.rockets.rocket_name
        }) as unknown as AxiosResponse<T_RocketsListResponse>

        thunkAPI.dispatch(savePayloadcalculation({
            draft_payloadcalculation_id: response.data.draft_calculation_id,
            rockets_count: response.data.rockets_count
        }))

        return response.data.rockets
    }
)

export const addRocketToCalculation = createAsyncThunk<void, string, AsyncThunkConfig>(
    "rockets/add_rocket_to_payloadcalculation",
    async function(rocket_id) {
        await api.launchvehicle.launchvehicleAddToCalculationCreate(rocket_id)
    }
)

const rocketsSlice = createSlice({
    name: 'rockets',
    initialState: initialState,
    reducers: {
        updateRocketName: (state, action) => {
            state.rocket_name = action.payload
        },
        removeSelectedRocket: (state) => {
            state.selectedRocket = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchRockets.fulfilled, (state:T_RocketsSlice, action: PayloadAction<T_Rocket[]>) => {
            state.rockets = action.payload
        });
        builder.addCase(fetchRocket.fulfilled, (state:T_RocketsSlice, action: PayloadAction<T_Rocket>) => {
            state.selectedRocket = action.payload
        });
    }
})

export const { updateRocketName, removeSelectedRocket} = rocketsSlice.actions;

export default rocketsSlice.reducer