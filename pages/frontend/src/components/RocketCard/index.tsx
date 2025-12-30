import {Button, Card, CardBody, CardImg, CardText, CardTitle} from "reactstrap";
import mockImage from "assets/mock.png";
import {Link} from "react-router-dom";
import {T_Rocket} from "modules/types.ts";

interface SampleCardProps {
    rockets: T_Rocket,
    isMock: boolean
}

const SampleCard = ({rockets, isMock}: SampleCardProps) => {
    return (
        <Card key={rockets.pk} style={{width: '18rem', margin: "0 auto 50px" }}>
            <CardImg
                src={isMock ? mockImage as string : rockets.imagerocket}
                style={{"height": "200px"}}
            />
            <CardBody>
                <CardTitle tag="h5">
                    {rockets.name}
                </CardTitle>
                <CardText>
                    Исходная полезная нагрузка: {rockets.gto_playload}
                </CardText>
                <Link to={`/rockets/${rockets.pk}`}>
                    <Button color="primary">
                        Подробнее
                    </Button>
                </Link>
            </CardBody>
        </Card>
    );
};

export default SampleCard