import {useState} from "react";
import Header from "components/Header";
import Breadcrumbs from "components/Breadcrumbs";
import SamplePage from "pages/SamplePage";
import SamplesListPage from "pages/SamplesListPage";
import {Route, Routes} from "react-router-dom";
import {T_Sample} from "src/modules/types.ts";
import {Container, Row} from "reactstrap";
import HomePage from "pages/HomePage";
import "./styles.css"

function App() {

    const [samples, setSamples] = useState<T_Sample[]>([])

    const [selectedSample, setSelectedSample] = useState<T_Sample | null>(null)

    const [isMock, setIsMock] = useState(false);

    const [sampleName, setSampleName] = useState<string>("")

    return (
        <div>
            <Header/>
            <Container className="pt-4">
                <Row className="mb-3">
                    <Breadcrumbs selectedSample={selectedSample} />
                </Row>
                <Row>
                    <Routes>
						<Route path="/" element={<HomePage />} />
                        <Route path="/launchvehicle/" element={<SamplesListPage samples={samples} setSamples={setSamples} isMock={isMock} setIsMock={setIsMock} sampleName={sampleName} setSampleName={setSampleName}/>} />
                        <Route path="/launchvehicle/:id" element={<SamplePage selectedSample={selectedSample} setSelectedSample={setSelectedSample} isMock={isMock} setIsMock={setIsMock}/>} />
                    </Routes>
                </Row>
            </Container>
        </div>
    )
}

export default App
