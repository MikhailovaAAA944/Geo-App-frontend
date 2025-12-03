import {useState} from "react";
import Header from "components/Header";
import Breadcrumbs from "components/Breadcrumbs";
import RocketPage from "pages/RocketPage";
import RocketsListPage from "pages/RocketListPage";
import {Route, Routes} from "react-router-dom";
import {T_Rocket} from "src/modules/types.ts";
import {Container, Row} from "reactstrap";
import HomePage from "pages/HomePage";
import "./styles.css"

function App() {

    const [rockets, setRockets] = useState<T_Rocket[]>([])

    const [selectedRocket, setselectedRocket] = useState<T_Rocket | null>(null)

    const [isMock, setIsMock] = useState(false);

    const [rocketName, setRocketName] = useState<string>("")

    return (
        <div>
            <Header/>
            <Container className="pt-4">
                <Row className="mb-3">
                    <Breadcrumbs selectedRocket={selectedRocket} />
                </Row>
                <Row>
                    <Routes>
						<Route path="/" element={<HomePage />} />
                        <Route path="/launchvehicle/" element={<RocketsListPage rockets={rockets} setRockets={setRockets} isMock={isMock} setIsMock={setIsMock} rocketName={rocketName} setRocketName={setRocketName}/>} />
                        <Route path="/launchvehicle/:id" element={<RocketPage selectedRocket={selectedRocket} setselectedRocket={setselectedRocket} isMock={isMock} setIsMock={setIsMock}/>} />
                    </Routes>
                </Row>
            </Container>
        </div>
    )
}

export default App
