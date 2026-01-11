import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import RocketCard from "src/components/RocketCard";
import {ChangeEvent, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchRockets, updateRocketName} from "src/store/slices/rocketsSlice";
import Bin from "components/Bin";

export const RocketsListPage = () => {

    const dispatch = useAppDispatch()

    const rockets = useAppSelector((state) => state.rockets.rockets)

    const isAuthenticated = useAppSelector((state) => state.user?.is_authenticated)

    const {draft_payloadcalculation_id, rockets_count} = useAppSelector((state) => state.payloadcalculations)

    const hasDraft = draft_payloadcalculation_id != null

    const query = useAppSelector((state) => state.rockets.query)

    const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        dispatch(updateRocketName(e.target.value))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(fetchRockets())
    }

    useEffect(() => {
        dispatch(fetchRockets())
    }, [])

    return (
        <Container>
            <Row className="mb-5">
                <Col md="6">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col xs="8">
                                <Input value={query} onChange={handleChange} placeholder="Поиск..."></Input>
                            </Col>
                            <Col>
                                <Button color="primary" className="w-100 search-btn">Поиск</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
                {isAuthenticated &&
                    <Col className="d-flex flex-row justify-content-end" md="6">
                        <Bin isActive={hasDraft} draft_payloadcalculation_id={draft_payloadcalculation_id} rockets_count={rockets_count} />
                    </Col>
                }
            </Row>
            <Row className="mt-5 d-flex">
                {rockets?.map(rocket => (
                    <Col key={rocket.pk} className="mb-5 d-flex justify-content-center" sm="12" md="6" lg="4">
                        <RocketCard rocket={rocket} showAddBtn={isAuthenticated} showMM={false} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};