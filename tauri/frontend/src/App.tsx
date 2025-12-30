import Header from "components/Header";
import Breadcrumbs from "components/Breadcrumbs";
import SamplePage from "pages/SamplePage";
import SamplesListPage from "pages/SamplesListPage";
import {Route, Routes} from "react-router-dom";
import {Container, Row} from "reactstrap";
import HomePage from "pages/HomePage";
import {useState} from "react";
import {T_Rocket} from "modules/types.ts";

function App() {

    const [samples, setSamples] = useState<T_Rocket[]>([])

    const [selectedSample, setSelectedSample] = useState<T_Rocket | null>(null)

    const [isMock, setIsMock] = useState(false);

    return (
        <>
            <Header/>
            <Container className="pt-4">
                <Row className="mb-3">
                    <Breadcrumbs selectedSample={selectedSample}/>
                </Row>
                <Row>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/samples/" element={<SamplesListPage samples={samples} setSamples={setSamples} isMock={isMock} setIsMock={setIsMock} />} />
                        <Route path="/samples/:id" element={<SamplePage selectedSample={selectedSample} setSelectedSample={setSelectedSample} isMock={isMock} setIsMock={setIsMock} />} />
                    </Routes>
                </Row>
            </Container>
        </>
    )
}

export default App
