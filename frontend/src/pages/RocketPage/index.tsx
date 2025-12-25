import * as React from 'react';
import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {T_Rocket} from "src/modules/types.ts";
import {Col, Container, Row} from "reactstrap";
import {RocketMocks} from "src/modules/mocks.ts";
import mockImage from "assets/mock.png";

type Props = {
    selectedRocket: T_Rocket | null,
    setselectedRocket: React.Dispatch<React.SetStateAction<T_Rocket | null>>,
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const RocketPage = ({selectedRocket, setselectedRocket, isMock, setIsMock}: Props) => {
    const { id } = useParams<{id: string}>();

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/launchvehicle/${id}`)
            const data = await response.json()
            setselectedRocket(data)
        } catch {
            createMock()
        }
    }

    const createMock = () => {
        setIsMock(true)
        setselectedRocket(RocketMocks.find(rocket => rocket?.pk == parseInt(id as string)) as T_Rocket)
    }

    useEffect(() => {
        if (!isMock) {
            fetchData()
        } else {
            createMock()
        }

        return () => setselectedRocket(null)
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
                        src={isMock ? mockImage as string : `http://127.0.0.1:9000/django-media/${selectedRocket.imagerocket}`}
                        className="w-100"
                    />
                </Col>
                <Col md="6">
                    <h1 className="mb-3">{selectedRocket.name}</h1>
                    <p className="fs-5">Описание: {selectedRocket.description}</p>
                    <p className="fs-5">Исходная полезная нагрузка: {selectedRocket.gto_playload}kg</p>
                </Col>
                
            </Row>
        </Container>
    );
};

export default RocketPage