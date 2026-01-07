import {Button, Card, CardBody, CardText, CardTitle, Col} from "reactstrap";
import {Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {addRocketToCalculation, fetchSamples} from "src/store/slices/rocketsSlice";
import {T_Rocket} from "utils/types.ts";
import {removeSampleFromDraftMission, updateSampleValue} from "store/slices/missionsSlice.ts";
import CustomInput from "components/CustomInput";
import {useEffect, useState} from "react";

type Props = {
    sample: T_Rocket,
    showAddBtn?: boolean,
    showRemoveBtn?: boolean,
    showMM?: boolean,
    editMM?: boolean
}

export const RocketCard = ({sample, showAddBtn = false, showRemoveBtn = false, showMM=false, editMM = false}:Props) => {

    const dispatch = useAppDispatch()

    const {save_mm} = useAppSelector(state => state.missions)

    const [local_order, setLocal_order] = useState(sample.order)

    const handeAddToDraftMission = async () => {
        await dispatch(addRocketToCalculation(sample.pk))
        await dispatch(fetchSamples())
    }

    const handleRemoveFromDraftMission = async () => {
        await dispatch(removeSampleFromDraftMission(sample.pk))
    }

    useEffect(() => {
        dispatch(updateSampleValue({
            sample_id: sample.pk,
            order: local_order
        }))
    }, [save_mm]);

    return (
        <Card key={sample.pk} style={{width: '18rem' }}>
            <img
                alt=""
                src={`http://127.0.0.1:9000/django-media/${sample.imagerocket}`}
                style={{"height": "200px"}}
            />
            <CardBody>
                <CardTitle tag="h5">
                    {sample.name}
                </CardTitle>
                <CardText>
                    Изначальная полезная нагрузка: {sample.gto_playload}.
                </CardText>
                {showMM && <CustomInput label="Порядковый номер" type="number" value={local_order} setValue={setLocal_order} disabled={!editMM} />}
                <Col className="d-flex justify-content-between">
                    <Link to={`/launchvehicle/${sample.pk}`}>
                        <Button color="primary" type="button">
                            Подробнее
                        </Button>
                    </Link>
                    {showAddBtn &&
                        <Button color="secondary" onClick={handeAddToDraftMission}>
                            Добавить в расчет
                        </Button>
                    }
                    {showRemoveBtn &&
                        <Button color="danger" onClick={handleRemoveFromDraftMission}>
                            Удалить
                        </Button>
                    }
                </Col>
            </CardBody>
        </Card>
    );
};