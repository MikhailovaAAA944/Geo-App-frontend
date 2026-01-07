import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {T_Rocket, T_RocketsListResponse} from "src/utils/types.ts";
import {AsyncThunkConfig} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {saveMission} from "store/slices/missionsSlice.ts";
import {api} from "modules/api.ts";
import {AxiosResponse} from "axios";

type T_RocketsSlice = {
    sample_name: string
    selectedSample: null | T_Rocket
    samples: T_Rocket[]
}

const initialState:T_RocketsSlice = {
    sample_name: "",
    selectedSample: null,
    samples: []
}

export const fetchSample = createAsyncThunk<T_Rocket, string, AsyncThunkConfig>(
    "fetch_sample",
    async function(id) {
        const response = await api.launchvehicle.launchvehicleRead(id) as unknown as AxiosResponse<T_Rocket>
        return response.data
    }
)

export const fetchSamples = createAsyncThunk<T_Rocket[], object, AsyncThunkConfig>(
    "fetch_samples",
    async function(_, thunkAPI) {
        const state = thunkAPI.getState();
        const response = await api.launchvehicle.launchvehicleList({
            title: state.samples.sample_name
        }) as unknown as AxiosResponse<T_RocketsListResponse>

        thunkAPI.dispatch(saveMission({
            draft_mission_id: response.data.draft_mission_id,
            samples_count: response.data.samples_count
        }))

        return response.data
    }
)

export const addRocketToCalculation = createAsyncThunk<void, string, AsyncThunkConfig>(
    "samples/add_sample_to_mission",
    async function(rocket_id) {
        await api.launchvehicle.launchvehicleAddToCalculationCreate(rocket_id)
    }
)

const samplesSlice = createSlice({
    name: 'samples',
    initialState: initialState,
    reducers: {
        updateSampleName: (state, action) => {
            state.sample_name = action.payload
        },
        removeSelectedSample: (state) => {
            state.selectedSample = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSamples.fulfilled, (state:T_RocketsSlice, action: PayloadAction<T_Rocket[]>) => {
            state.samples = action.payload
        });
        builder.addCase(fetchSample.fulfilled, (state:T_RocketsSlice, action: PayloadAction<T_Rocket>) => {
            state.selectedSample = action.payload
        });
    }
})

export const { updateSampleName, removeSelectedSample} = samplesSlice.actions;

export default samplesSlice.reducer