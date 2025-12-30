import {createSlice} from "@reduxjs/toolkit";

type T_RocketsSlice = {
    sample_name: string
}

const initialState:T_RocketsSlice = {
    sample_name: "",
}


const samplesSlice = createSlice({
    name: 'samples',
    initialState: initialState,
    reducers: {
        updateSampleName: (state, action) => {
            state.sample_name = action.payload
        }
    }
})

export const { updateSampleName} = samplesSlice.actions;

export default samplesSlice.reducer