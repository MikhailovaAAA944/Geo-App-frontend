import {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchMissions, T_missionsFilters, updateFilters} from "store/slices/missionsSlice.ts";
import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import {MissionsTable} from "components/MissionsTable/MissionsTable.tsx";
import {useNavigate} from "react-router-dom";
import CustomDropdown from "components/CustomDropdown/CustomDropdown.tsx";

export const MissionsPage = () => {

    const dispatch = useAppDispatch()

    const missions = useAppSelector((state) => state.missions.missions)

    const isAuthenticated = useAppSelector((state) => state.user?.is_authenticated)

    const filters = useAppSelector<T_missionsFilters>((state) => state.missions.filters)

    const navigate = useNavigate()

    const [status, setStatus] = useState(filters.status)

    const [dateFormationStart, setDateFormationStart] = useState(filters.date_formation_start)

    const [dateFormationEnd, setDateFormationEnd] = useState(filters.date_formation_end)

    const statusOptions = {
        0: "Любой",
        2: "В работе",
        3: "Завершен",
        4: "Отклонен"
    }

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/403/")
        }
    }, [isAuthenticated]);

    useEffect(() => {
        dispatch(fetchMissions())
    }, []);

    const applyFilters = async (e) => {
        e.preventDefault()

        const filters:T_missionsFilters = {
            status: status,
            date_formation_start: dateFormationStart,
            date_formation_end: dateFormationEnd
        }

        await dispatch(updateFilters(filters))
        await dispatch(fetchMissions())
    }

    return (
        <Container>
            <Form onSubmit={applyFilters}>
                <Row className="mb-4 d-flex align-items-center">
                    <Col md="2" className="d-flex flex-row gap-3 align-items-center">
                        <label>От</label>
                        <Input type="date" value={dateFormationStart} onChange={(e) => setDateFormationStart(e.target.value)} required/>
                    </Col>
                    <Col md="2" className="d-flex flex-row gap-3 align-items-center">
                        <label>До</label>
                        <Input type="date" value={dateFormationEnd} onChange={(e) => setDateFormationEnd(e.target.value)} required/>
                    </Col>
                    <Col md="3">
                        <CustomDropdown label="Статус" selectedItem={status} setSelectedItem={setStatus} options={statusOptions} />
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <Button color="primary" type="submit">Применить</Button>
                    </Col>
                </Row>
            </Form>
            {missions.length ? <MissionsTable missions={missions}/> : <h3 className="text-center mt-5">Миссии не найдены</h3>}
        </Container>
    )
};