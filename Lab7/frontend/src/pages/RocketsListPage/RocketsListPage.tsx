import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import SampleCard from "src/components/RocketCard";
import {ChangeEvent, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchSamples, updateSampleName} from "src/store/slices/rocketsSlice";
import Bin from "components/Bin";

export const RocketsListPage = () => {

    const dispatch = useAppDispatch()

    const samples = useAppSelector((state) => state.samples.samples)

    const isAuthenticated = useAppSelector((state) => state.user?.is_authenticated)

    const {draft_mission_id, samples_count} = useAppSelector((state) => state.missions)

    const hasDraft = draft_mission_id != null

    const query = useAppSelector((state) => state.samples.query)

    const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        dispatch(updateSampleName(e.target.value))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(fetchSamples())
    }

    useEffect(() => {
        dispatch(fetchSamples())
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
                        <Bin isActive={hasDraft} draft_mission_id={draft_mission_id} samples_count={samples_count} />
                    </Col>
                }
            </Row>
            <Row className="mt-5 d-flex">
                {samples?.map(sample => (
                    <Col key={sample.pk} className="mb-5 d-flex justify-content-center" sm="12" md="6" lg="4">
                        <SampleCard sample={sample} showAddBtn={isAuthenticated} showMM={false} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};