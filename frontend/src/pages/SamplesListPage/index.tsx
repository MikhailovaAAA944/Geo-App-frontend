import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import {T_Sample} from "src/modules/types.ts";
import SampleCard from "components/SampleCard";
import {SampleMocks} from "src/modules/mocks.ts";
import {FormEvent, useEffect} from "react";
import * as React from "react";

type Props = {
    samples: T_Sample[],
    setSamples: React.Dispatch<React.SetStateAction<T_Sample[]>>
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
    sampleName: string,
    setSampleName: React.Dispatch<React.SetStateAction<string>>
}

const SamplesListPage = ({samples, setSamples, isMock, setIsMock, sampleName, setSampleName}:Props) => {

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/launchvehicle/?sample_name=${sampleName.toLowerCase()}`)
            const data = await response.json()
            setSamples(data.samples)
            setIsMock(false)
        } catch {
            createMocks()
        }
    }

    const createMocks = () => {
        setIsMock(true)
        setSamples(SampleMocks.filter(sample => sample.name.toLowerCase().includes(sampleName.toLowerCase())))
    }

    const handleSubmit = async (e:FormEvent) => {
        e.preventDefault()
        if (isMock) {
            createMocks()
        } else {
            await fetchData()
        }
    }

    useEffect(() => {
        fetchData()
    }, []);

    return (
        <Container>
            <Row className="mb-5">
                <Col md="6">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md="8">
                                <Input value={sampleName} onChange={(e) => setSampleName(e.target.value)} placeholder="Поиск..."></Input>
                            </Col>
                            <Col>
                                <Button color="primary" className="w-100 search-btn">Поиск</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row>
                {samples?.map(sample => (
                    <Col key={sample.id} xs="4">
                        <SampleCard sample={sample} isMock={isMock} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default SamplesListPage