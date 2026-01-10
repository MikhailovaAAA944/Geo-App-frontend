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

export type T_Calculation = {
    pk: string | null
    status: E_MissionStatus
    completion_datetime: string
    creation_datetime: string
    formation_datetime: string
    client: string
    manager: string
    rocket: T_Rocket[]
    name: string
    success: string
}

export enum E_MissionStatus {
    Draft='Черновик',
    InWork='В расчете',
    Completed='Расчет завершен',
    Rejected='Ошибка в расчете',
    Deleted='Удален'
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
    rockets_count: number
}