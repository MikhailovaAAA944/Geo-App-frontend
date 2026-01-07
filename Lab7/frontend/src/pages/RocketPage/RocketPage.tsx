import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchSample, removeSelectedSample} from "src/store/slices/rocketsSlice";


export const RocketPage = () => {
    const { id } = useParams<{id: string}>();

    const dispatch = useAppDispatch()

    const selectedRocket = useAppSelector((state) => state.samples.selectedSample)

    useEffect(() => {
        dispatch(fetchSample(id))
        return () => dispatch(removeSelectedSample())
    }, []);

    if (!selectedRocket) {
        return (
            <div>

            </div>
        )
    }

    return (
        <Container>
            <Row>
                <Col md="6">
                    <img
                        alt=""
                        src={`http://127.0.0.1:9000/django-media/${selectedRocket.imagerocket}`}
                        className="w-100"
                    />
                </Col>
                <Col md="6">
                    <h1 className="mb-3">{selectedRocket.name}</h1>
                    <p className="fs-5">Изначальная полезная нагрузка: {selectedRocket.gto_playload}.</p>
                    <p className="fs-5">Описание: {selectedRocket.description}</p>
                </Col>
            </Row>
        </Container>
    );
};