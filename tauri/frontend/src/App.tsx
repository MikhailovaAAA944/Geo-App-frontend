import Header from "components/Header";
import Breadcrumbs from "components/Breadcrumbs";
import RocketPage from "src/pages/RocketPage";
import RocketsListPage from "src/pages/RocketsListPage";
import {Route, Routes} from "react-router-dom";
import {Container, Row} from "reactstrap";
import HomePage from "pages/HomePage";
import {useState} from "react";
import {T_Rocket} from "modules/types.ts";

function App() {

    const [rockets, setRockets] = useState<T_Rocket[]>([])

    const [selectedRocket, setSelectedRocket] = useState<T_Rocket | null>(null)

    const [isMock, setIsMock] = useState(false);

    return (
        <>
            <Header/>
            <Container className="pt-4">
                <Row className="mb-3">
                    <Breadcrumbs selectedRocket={selectedRocket}/>
                </Row>
                <Row>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/rockets/" element={<RocketsListPage rockets={rockets} setRockets={setRockets} isMock={isMock} setIsMock={setIsMock} />} />
                        <Route path="/rockets/:id" element={<RocketPage selectedRocket={selectedRocket} setSelectedRocket={setSelectedRocket} isMock={isMock} setIsMock={setIsMock} />} />
                    </Routes>
                </Row>
            </Container>
        </>
    )
}

export default App
