import {useNavigate} from "react-router-dom";
import {useMemo} from "react";
import {formatDate} from "src/utils/utils.ts";
import CustomTable from "components/CustomTable";
import {T_Mission} from "src/utils/types.ts";

export const MissionsTable = ({missions}:{missions:T_Mission[]}) => {
    const navigate = useNavigate()

    const handleClick = (mission_id) => {
        navigate(`/missions/${mission_id}`)
    }

    const statuses = {
        1: "Черновик",
        2: "В работе",
        3: "Завершен",
        4: "Отменён",
        5: "Удалён"
    }

    const columns = useMemo(
        () => [
            {
                Header: '№',
                accessor: 'id',
            },
            {
                Header: 'Статус',
                accessor: 'status',
                Cell: ({ value }) => statuses[value]
            },
            {
                Header: 'Дата создания',
                accessor: 'date_created',
                Cell: ({ value }) => formatDate(value)
            },
            {
                Header: 'Дата формирования',
                accessor: 'date_formation',
                Cell: ({ value }) => formatDate(value)
            },
            {
                Header: 'Дата завершения',
                accessor: 'date_complete',
                Cell: ({ value }) => formatDate(value)
            }
        ],
        []
    )

    return (
        <CustomTable columns={columns} data={missions} onClick={handleClick}/>
    )
};