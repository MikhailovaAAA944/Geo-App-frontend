import * as React from 'react';
import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {CardImg, Col, Container, Row} from "reactstrap";
import mockImage from "assets/mock.png";
import {T_Rocket} from "modules/types.ts";
import {SampleMocks} from "modules/mocks.ts";

type Props = {
    selectedRocket: T_Rocket | null,
    setSelectedRocket: React.Dispatch<React.SetStateAction<T_Rocket | null>>,
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const RocketPage = ({selectedRocket, setSelectedRocket, isMock, setIsMock}: Props) => {
    const { id } = useParams<{id: string}>();

    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/rockets/${id}`)
            const data = await response.json()
            setSelectedRocket(data)
        } catch {
            createMock()
        }
    }

    const createMock = () => {
        setIsMock(true)
        setSelectedRocket(SampleMocks.find(rockets => rockets?.pk == parseInt(id as string)) as T_Rocket)
    }

    useEffect(() => {
        if (!isMock) {
            fetchData()
        } else {
            createMock()
        }

        return () => setSelectedRocket(null)
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
                    <CardImg src={isMock ? mockImage as string : selectedRocket.imagerocket} className="mb-3" />
                </Col>
                <Col md="6">
                    <h1 className="mb-3">{selectedRocket.name}</h1>
                    <p className="fs-5">Полезная нагрузка: {selectedRocket.gto_playload}.</p>
                    <p className="fs-5">Описание: {selectedRocket.description}</p>
                </Col>
            </Row>
        </Container>
    );
};

export default RocketPage