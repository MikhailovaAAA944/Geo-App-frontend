import * as React from 'react';
import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {T_Sample} from "src/modules/types.ts";
import {Col, Container, Row} from "reactstrap";
import {SampleMocks} from "src/modules/mocks.ts";
import mockImage from "assets/mock.png";

type Props = {
    selectedSample: T_Sample | null,
    setSelectedSample: React.Dispatch<React.SetStateAction<T_Sample | null>>,
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const SamplePage = ({selectedSample, setSelectedSample, isMock, setIsMock}: Props) => {
    const { id } = useParams<{id: string}>();

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/launchvehicle/${id}`)
            const data = await response.json()
            setSelectedSample(data)
        } catch {
            createMock()
        }
    }

    const createMock = () => {
        setIsMock(true)
        setSelectedSample(SampleMocks.find(sample => sample?.id == parseInt(id as string)) as T_Sample)
    }

    useEffect(() => {
        if (!isMock) {
            fetchData()
        } else {
            createMock()
        }

        return () => setSelectedSample(null)
    }, []);

    if (!selectedSample) {
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
                        src={isMock ? mockImage as string : selectedSample.image}
                        className="w-100"
                    />
                </Col>
                <Col md="6">
                    <h1 className="mb-3">{selectedSample.name}</h1>
                    <p className="fs-5">Описание: {selectedSample.description}</p>
                    <p className="fs-5">Дата обнаружения: {selectedSample.date_discovery}.</p>
                </Col>
            </Row>
        </Container>
    );
};

export default SamplePage