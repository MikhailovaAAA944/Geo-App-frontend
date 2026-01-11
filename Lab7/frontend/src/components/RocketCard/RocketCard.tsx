import {Button, Card, CardBody, CardText, CardTitle, Col} from "reactstrap";
import {Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {addRocketToCalculation, fetchRockets} from "src/store/slices/rocketsSlice";
import {T_Rocket} from "utils/types.ts";
import {removeRocketFromDraftPayloadcalculation, updateRocketValue} from "store/slices/payloadcalculationsSlice.ts";
import CustomInput from "components/CustomInput";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

type Props = {
    rocket: T_Rocket,
    showAddBtn?: boolean,
    showRemoveBtn?: boolean,
    showMM?: boolean,
    editMM?: boolean
}

export const RocketCard = ({rocket, showAddBtn = false, showRemoveBtn = false, showMM=false, editMM = false}:Props) => {

    const dispatch = useAppDispatch()

    const {save_mm} = useAppSelector(state => state.payloadcalculations)

    const [local_comment, setLocal_comment] = useState(rocket.comment)

    const handeAddToDraftPayloadcalculation = async () => {
        await dispatch(addRocketToCalculation(rocket.pk))
        await dispatch(fetchRockets())
    }
    const navigate = useNavigate() 
    
   
    
    const handleRemoveFromDraftPayloadcalculation = async () => {
        await dispatch(removeRocketFromDraftPayloadcalculation(rocket.pk))
        navigate(`/launchvehicle`)
    }

    useEffect(() => {
        dispatch(updateRocketValue({
            rocket_id: rocket.pk,
            comment: local_comment
        }))
    }, [save_mm]);

    return (
        <Card key={rocket.pk} style={{width: '18rem' }}>
            <img
                alt=""
                src={`http://127.0.0.1:9000/django-media/${rocket.imagerocket}`}
                style={{"height": "200px"}}
            />
            <CardBody>
                <CardTitle tag="h5">
                    {rocket.name}
                </CardTitle>
                <CardText>
                    Изначальная полезная нагрузка: {rocket.gto_playload}.
                </CardText>
                {showMM && <CustomInput label="Комментарий" type="text" value={local_comment} setValue={setLocal_comment} disabled={!editMM} />}
                <Col className="d-flex justify-content-between">
                    <Link to={`/launchvehicle/${rocket.pk}`}>
                        <Button color="primary" type="button">
                            Подробнее
                        </Button>
                    </Link>
                    {showAddBtn &&
                        <Button color="secondary" onClick={handeAddToDraftPayloadcalculation}>
                            Добавить в расчет
                        </Button>
                    }
                    {showRemoveBtn &&
                        <Button color="danger" onClick={handleRemoveFromDraftPayloadcalculation}>
                            Удалить
                        </Button>
                    }
                </Col>
            </CardBody>
        </Card>
    );
};