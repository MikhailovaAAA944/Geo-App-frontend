import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {T_Calculation, T_Rocket} from "src/utils/types.ts";
import {AsyncThunkConfig} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {api} from "modules/api.ts";
import {AxiosResponse} from "axios";
import {NEXT_YEAR, PREV_YEAR} from "utils/consts.ts";

type T_missionsSlice = {
    draft_mission_id: number | null,
    rockets_count: number | null,
    mission: T_Calculation | null,
    missions: T_Calculation[],
    filters: T_missionsFilters,
    save_mm: boolean
}

export type T_missionsFilters = {
    date_formation_start: string
    date_formation_end: string
    status: number
}

const initialState:T_missionsSlice = {
    draft_mission_id: null,
    rockets_count: null,
    mission: null,
    missions: [],
    filters: {
        status: 0,
        date_formation_start: PREV_YEAR.toISOString().split('T')[0],
        date_formation_end: NEXT_YEAR.toISOString().split('T')[0]
    },
    save_mm: false
}

export const fetchMission = createAsyncThunk<T_Calculation, string, AsyncThunkConfig>(
    "missions/mission",
    async function(calculation_id) {
        const response = await api.payloadcalculation.payloadcalculationRead(calculation_id) as unknown as AxiosResponse<T_Calculation>
        return response.data
    }
)

export const fetchMissions = createAsyncThunk<T_Calculation[], object, AsyncThunkConfig>(
    "missions/missions",
    async function(_, thunkAPI) {
        const state = thunkAPI.getState()

        const response = await api.payloadcalculation.payloadcalculationList({
            status: state.missions.filters.status,
            date_formation_start: state.missions.filters.date_formation_start,
            date_formation_end: state.missions.filters.date_formation_end
        }) as unknown as AxiosResponse<T_Calculation[]>
        return response.data
    }
)

export const removeSampleFromDraftMission = createAsyncThunk<T_Rocket[], string, AsyncThunkConfig>(
    "missions/remove_sample",
    async function(sample_id, thunkAPI) {
        const state = thunkAPI.getState()
        const response = await api.missions.missionsDeleteSampleDelete(state.missions.mission.id, sample_id) as AxiosResponse<T_Rocket[]>
        return response.data
    }
)

export const deleteDraftMission = createAsyncThunk<void, object, AsyncThunkConfig>(
    "missions/delete_draft_mission",
    async function(_, {getState}) {
        const state = getState()
        await api.missions.missionsDeleteDelete(state.missions.mission.id)
    }
)

export const sendDraftMission = createAsyncThunk<void, object, AsyncThunkConfig>(
    "missions/send_draft_mission",
    async function(_, {getState}) {
        const state = getState()
        await api.missions.missionsUpdateStatusUserUpdate(state.missions.mission.id)
    }
)

export const updateMission = createAsyncThunk<void, object, AsyncThunkConfig>(
    "missions/update_mission",
    async function(data, {getState}) {
        const state = getState()
        await api.missions.missionsUpdateUpdate(state.missions.mission.id, {
            ...data
        })
    }
)

export const updateSampleValue = createAsyncThunk<void, object, AsyncThunkConfig>(
    "missions/update_mm_value",
    async function({sample_id, order},thunkAPI) {
        const state = thunkAPI.getState()
        await api.missions.missionsUpdateSampleUpdate(state.missions.mission.id, sample_id, {order})
    }
)

const missionsSlice = createSlice({
    name: 'missions',
    initialState: initialState,
    reducers: {
        saveMission: (state, action) => {
            state.draft_mission_id = action.payload.draft_mission_id
            state.rockets_count = action.payload.rockets_count
        },
        removeMission: (state) => {
            state.mission = null
        },
        triggerUpdateMM: (state) => {
            state.save_mm = !state.save_mm
        },
        updateFilters: (state, action) => {
            state.filters = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMission.fulfilled, (state:T_missionsSlice, action: PayloadAction<T_Calculation>) => {
            state.mission = action.payload
        });
        builder.addCase(fetchMissions.fulfilled, (state:T_missionsSlice, action: PayloadAction<T_Calculation[]>) => {
            state.missions = action.payload
        });
        builder.addCase(removeSampleFromDraftMission.rejected, (state:T_missionsSlice) => {
            state.mission = null
        });
        builder.addCase(removeSampleFromDraftMission.fulfilled, (state:T_missionsSlice, action: PayloadAction<T_Rocket[]>) => {
            (state.mission as T_Calculation).rocket = action.payload
        });
        builder.addCase(sendDraftMission.fulfilled, (state:T_missionsSlice) => {
            state.mission = null
        });
    }
})

export const { saveMission, removeMission, triggerUpdateMM, updateFilters } = missionsSlice.actions;

export default missionsSlice.reducer