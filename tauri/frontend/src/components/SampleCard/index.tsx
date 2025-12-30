import {Button, Card, CardBody, CardImg, CardText, CardTitle} from "reactstrap";
import mockImage from "assets/mock.png";
import {Link} from "react-router-dom";
import {T_Rocket} from "modules/types.ts";

interface SampleCardProps {
    sample: T_Rocket,
    isMock: boolean
}

const SampleCard = ({sample, isMock}: SampleCardProps) => {
    return (
        <Card key={sample.id} style={{width: '18rem', margin: "0 auto 50px" }}>
            <CardImg
                src={isMock ? mockImage as string : sample.image}
                style={{"height": "200px"}}
            />
            <CardBody>
                <CardTitle tag="h5">
                    {sample.name}
                </CardTitle>
                <CardText>
                    Дата обнаружения: {sample.date_discovery}.
                </CardText>
                <Link to={`/samples/${sample.id}`}>
                    <Button color="primary">
                        Открыть
                    </Button>
                </Link>
            </CardBody>
        </Card>
    );
};

export default SampleCard