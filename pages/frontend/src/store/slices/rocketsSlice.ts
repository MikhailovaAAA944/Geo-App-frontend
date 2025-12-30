import {createSlice} from "@reduxjs/toolkit";

type T_RocketsSlice = {
    rocket_name: string
}

const initialState:T_RocketsSlice = {
    rocket_name: "",
}


const rocketsSlice = createSlice({
    name: 'rockets',
    initialState: initialState,
    reducers: {
        updateRocketName: (state, action) => {
            state.rocket_name = action.payload
        }
    }
})

export const { updateRocketName} = rocketsSlice.actions;

export default rocketsSlice.reducer