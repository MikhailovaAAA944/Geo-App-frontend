import {Button, Card, CardBody, CardImg, CardText, CardTitle} from "reactstrap";
import mockImage from "assets/mock.png";
import {Link} from "react-router-dom";
import {T_Rocket} from "modules/types.ts";

interface RocketCardProps {
    rocket: T_Rocket,
    isMock: boolean
}

const RocketCard = ({rocket, isMock}: RocketCardProps) => {
    return (
        <Card key={rocket.id} style={{width: '18rem', margin: "0 auto 50px", height: "calc(100% - 50px)" }}>
            <CardImg
                src={isMock ? mockImage as string : rocket.image}
                style={{"height": "200px"}}
            />
            <CardBody className="d-flex flex-column justify-content-between">
                <CardTitle tag="h5">
                    {rocket.name}
                </CardTitle>
                <CardText>
                    Исходная полезная нагрузка: {rocket.payload}
                </CardText>
                <Link to={`/launchvehicle/${rocket.id}`}>
                    <Button color="primary">
                        Подробнее
                    </Button>
                </Link>
            </CardBody>
        </Card>
    );
};

export default RocketCard