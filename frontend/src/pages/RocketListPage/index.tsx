import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import {T_Rocket} from "src/modules/types.ts";
import RocketCard from "src/components/RocketCard";
import {RocketMocks} from "src/modules/mocks.ts";
import {FormEvent, useEffect} from "react";
import * as React from "react";

type Props = {
    rockets: T_Rocket[],
    setRockets: React.Dispatch<React.SetStateAction<T_Rocket[]>>
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
    rocketName: string,
    setRocketName: React.Dispatch<React.SetStateAction<string>>
}

const RocketsListPage = ({rockets, setRockets, isMock, setIsMock, rocketName, setRocketName}:Props) => {

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/launchvehicle/?rocket_name=${rocketName.toLowerCase()}`)
            const data = await response.json()
            setRockets(data.rockets)
            setIsMock(false)
        } catch {
            createMocks()
        }
    }

    const createMocks = () => {
        setIsMock(true)
        setRockets(RocketMocks.filter(rocket => rocket.name.toLowerCase().includes(rocketName.toLowerCase())))
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
                                <Input value={rocketName} onChange={(e) => setRocketName(e.target.value)} placeholder="Поиск..."></Input>
                            </Col>
                            <Col>
                                <Button color="primary" className="w-100 search-btn">Поиск</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row>
                {rockets?.map(rocket => (
                    <Col key={rocket.id} xs="4">
                        <RocketCard rocket={rocket} isMock={isMock} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default RocketsListPage