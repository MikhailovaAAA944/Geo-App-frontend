import {useNavigate} from "react-router-dom";
import {useMemo} from "react";
import {formatDate} from "src/utils/utils.ts";
import CustomTable from "components/CustomTable";
import {T_Calculation} from "src/utils/types.ts";

export const CalculationsTable = ({calculations}:{calculations:T_Calculation[]}) => {
    const navigate = useNavigate()

    const handleClick = (calculation_id) => {
        navigate(`/payloadcalculation/${calculation_id}`)
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
                accessor: 'pk',
            },
            {
                Header: 'Статус',
                accessor: 'status',
                Cell: ({ value }) => value
            },
            {
                Header: 'Дата создания',
                accessor: 'creation_datetime',
                Cell: ({ value }) => formatDate(value)
            },
            {
                Header: 'Дата формирования',
                accessor: 'formation_datetime',
                Cell: ({ value }) => formatDate(value)
            },
            {
                Header: 'Дата завершения',
                accessor: 'completion_datetime',
                Cell: ({ value }) => formatDate(value)
            }
        ],
        []
    )

    return (
        <CustomTable columns={columns} data={calculations} onClick={handleClick}/>
    )
};