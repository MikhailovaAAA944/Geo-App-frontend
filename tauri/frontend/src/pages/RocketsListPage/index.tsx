import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import RocketCard from "src/components/RocketCard";
import {ChangeEvent, FormEvent, useEffect} from "react";
import * as React from "react";
import {useAppSelector} from "src/store/store.ts";
import {updateRocketName} from "src/store/slices/rocketsSlice.ts";
import {T_Rocket} from "modules/types.ts";
import {RocketMocks} from "modules/mocks.ts";
import {useDispatch} from "react-redux";

type Props = {
    rockets: T_Rocket[],
    setRockets: React.Dispatch<React.SetStateAction<T_Rocket[]>>
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const RocketsListPage = ({rockets, setRockets, isMock, setIsMock}:Props) => {

    const dispatch = useDispatch()

    const {rocket_name} = useAppSelector((state) => state.rockets)

    const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        dispatch(updateRocketName(e.target.value))
    }

    const createMocks = () => {
        setIsMock(true)
        setRockets(RocketMocks.filter(rockets => rockets.name.toLowerCase().includes(rocket_name.toLowerCase())))
    }

    const handleSubmit = async (e:FormEvent) => {
        e.preventDefault()
        await fetchRockets()
    }

    const fetchRockets = async () => {
        try {
            const env = await import.meta.env;
            const response = await fetch(`${env.VITE_API_URL}/api/rockets/?rockets_name=${rocket_name.toLowerCase()}`)
            const data = await response.json()
            setRockets(data)
            setIsMock(false)
        } catch {
            createMocks()
        }
    }

    useEffect(() => {
        fetchRockets()
    }, []);

    return (
        <Container>
            <Row className="mb-5">
                <Col md="6">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col xs="8">
                                <Input value={rocket_name} onChange={handleChange} placeholder="Поиск..."></Input>
                            </Col>
                            <Col>
                                <Button color="primary" className="w-100 search-btn">Поиск</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row>
                {rockets?.map(rockets => (
                    <Col key={rockets.pk} sm="12" md="6" lg="4">
                        <RocketCard rockets={rockets} isMock={isMock} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default RocketsListPage