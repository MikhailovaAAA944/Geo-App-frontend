export type T_Rocket =  {
    pk: number,
    name: string,
    short_description: string,
    gto_playload: number,
    description: string,
    imagerocket: string,
    is_active: boolean,
    order?: number
}

export type T_Mission = {
    id: string | null
    status: E_MissionStatus
    date_complete: string
    date_created: string
    date_formation: string
    owner: string
    moderator: string
    samples: T_Rocket[]
    name: string
    success: string
}

export enum E_MissionStatus {
    Draft=1,
    InWork,
    Completed,
    Rejected,
    Deleted
}

export type T_User = {
    id: number
    username: string
    email: string
    is_authenticated: boolean
    validation_error: boolean
    validation_success: boolean
    checked: boolean
}

export type T_LoginCredentials = {
    username: string
    password: string
}

export type T_RegisterCredentials = {
    name: string
    email: string
    password: string
}

export type T_RocketsListResponse = {
    samples: T_Rocket[],
    draft_mission_id: number,
    samples_count: number
}