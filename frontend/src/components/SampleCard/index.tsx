import {Button, Card, CardBody, CardImg, CardText, CardTitle} from "reactstrap";
import mockImage from "assets/mock.png";
import {Link} from "react-router-dom";
import {T_Sample} from "modules/types.ts";

interface SampleCardProps {
    sample: T_Sample,
    isMock: boolean
}

const SampleCard = ({sample, isMock}: SampleCardProps) => {
    return (
        <Card key={sample.id} style={{width: '18rem', margin: "0 auto 50px", height: "calc(100% - 50px)" }}>
            <CardImg
                src={isMock ? mockImage as string : sample.image}
                style={{"height": "200px"}}
            />
            <CardBody className="d-flex flex-column justify-content-between">
                <CardTitle tag="h5">
                    {sample.name}
                </CardTitle>
                <CardText>
                    Исходная полезная нагрузка: {sample.date_discovery}
                </CardText>
                <Link to={`/launchvehicle/${sample.id}`}>
                    <Button color="primary">
                        Подробнее
                    </Button>
                </Link>
            </CardBody>
        </Card>
    );
};

export default SampleCard