import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {
    deleteDraftMission,
    fetchMission,
    removeMission,
    sendDraftMission,
    triggerUpdateMM,
    updateMission
} from "store/slices/missionsSlice.ts";
import SampleCard from "src/components/RocketCard";
import {Button, Col, Form, Row} from "reactstrap";
import {E_MissionStatus, T_Rocket} from "src/utils/types.ts";
import CustomInput from "components/CustomInput";

export const MissionPage = () => {
    const { id } = useParams<{id: string}>();

    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const isAuthenticated = useAppSelector((state) => state.user?.is_authenticated)

    const mission = useAppSelector((state) => state.missions.mission)

    const [name, setName] = useState<string>(mission?.name)
    const [success, setSuccess] = useState<string>(mission?.success)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/403/")
        }
    }, [isAuthenticated]);

    useEffect(() => {
        dispatch(fetchMission(id))
        return () => dispatch(removeMission())
    }, []);

    useEffect(() => {
        setName(mission?.name)
        setSuccess(mission?.success)
    }, [mission]);

    const sendMission = async (e) => {
        e.preventDefault()

        await saveMission()

        await dispatch(sendDraftMission())

        navigate("/missions")
    }

    const saveMission = async (e?) => {
        e?.preventDefault()

        const data = {
            name
        }

        await dispatch(updateMission(data))
        await dispatch(triggerUpdateMM())
    }

    const deleteMission = async () => {
        await dispatch(deleteDraftMission())
        navigate("/samples")
    }

    if (!mission) {
        return (
            <div>

            </div>
        )
    }

    const isDraft = mission.status == E_MissionStatus.Draft
    const isCompleted = mission.status == E_MissionStatus.Completed

    return (
        <Form onSubmit={sendMission} className="pb-5">
            <h2 className="mb-5">{isDraft ? "Черновая миссия" : `Миссия №${id}` }</h2>
            <Row className="mb-5 fs-5 w-25">
                <CustomInput label="Название" placeholder="Введите название" value={name} setValue={setName} disabled={!isDraft}/>
                {isCompleted && <CustomInput label="Исход миссии" value={success ? "Успех" : "Неудача"} disabled={true}/>}
            </Row>
            <Row>
                {mission.samples.length > 0 ? mission.samples.map((sample:T_Rocket) => (
                    <Col md="4" key={sample.id} className="d-flex justify-content-center mb-5">
                        <SampleCard sample={sample} showRemoveBtn={isDraft} showMM={true} editMM={isDraft} value={sample.order}/>
                    </Col>
                )) :
                    <h3 className="text-center">Ракеты еще не добавлены</h3>
                }
            </Row>
            {isDraft &&
                <Row className="mt-5">
                    <Col className="d-flex gap-5 justify-content-center">
                        <Button color="success" className="fs-4" onClick={saveMission}>Сохранить</Button>
                        <Button color="primary" className="fs-4" type="submit">Отправить</Button>
                        <Button color="danger" className="fs-4" onClick={deleteMission}>Удалить</Button>
                    </Col>
                </Row>
            }
        </Form>
    );
};