import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {Button, Col, Form, Row, FormGroup, Label, Input} from "reactstrap";
import {
    deleteDraftPayloadcalculation,
    fetchPayloadcalculation,
    removePayloadcalculation,
    sendDraftPayloadcalculation,
    triggerUpdateMM,
    updatePayloadcalculation
} from "store/slices/payloadcalculationsSlice.ts";

import RocketCard from "src/components/RocketCard";
import {E_PayloadcalculationStatus, T_Rocket} from "src/utils/types.ts";
import CustomInput from "components/CustomInput";

export const PayloadcalculationPage = () => {
    const { id } = useParams<{id: string}>();

    const dispatch = useAppDispatch()
    
    // Данные космодромов
    const cosmodromes = [
        { name: "Байконур", coordinates: 45 },
        { name: "Восточный", coordinates: 51 },
        { name: "Куру", coordinates: 5 },
        { name: "Цзюцюань", coordinates: 40 },
    ];

    const navigate = useNavigate()
    const isAuthenticated = useAppSelector((state) => state.user?.is_authenticated)
    const payloadcalculation = useAppSelector((state) => state.payloadcalculations.payloadcalculation)

    // Состояния для формы
    const [selectedCosmodrome, setSelectedCosmodrome] = useState<string>(payloadcalculation?.cosmodrome || "");
    const [comment, setComment] = useState<string>(payloadcalculation?.comment || "");
    const [success, setSuccess] = useState<string>(payloadcalculation?.success ? "Успех" : "Неудача");

    console.log('Расчет из store:', payloadcalculation);
    console.log('Состояние всего payloadcalculations:', useAppSelector((state) => state.payloadcalculations));
    console.log('ID из URL:', id);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/403/")
        }
    }, [isAuthenticated]);

    useEffect(() => {
        dispatch(fetchPayloadcalculation(id))
        return () => dispatch(removePayloadcalculation())
    }, []);

    useEffect(() => {
        if (payloadcalculation) {
            setSelectedCosmodrome(payloadcalculation.cosmodrome || "");
            setComment(payloadcalculation.comment || "");
            setSuccess(payloadcalculation.success ? "Успех" : "Неудача");
        }
    }, [payloadcalculation]);

    const sendPayloadcalculation = async (e: React.FormEvent) => {
        e.preventDefault()

        // Сначала сохраняем космодром и комментарий
        await savePayloadcalculation();
        
        // Отправляем на расчет с дополнительными данными
        await dispatch(sendDraftPayloadcalculation({
            cosmodrome: selectedCosmodrome,
            comment: comment
        }));

        navigate("/payloadcalculation")
    }

    const savePayloadcalculation = async (e?: React.FormEvent) => {
        e?.preventDefault()

        const data = {
            cosmodrome: selectedCosmodrome,
            comment: comment
        }

        await dispatch(updatePayloadcalculation(data))
        await dispatch(triggerUpdateMM())
    }

    const deletePayloadcalculation = async () => {
        await dispatch(deleteDraftPayloadcalculation())
        navigate("/launchvehicle")
    }

    if (!payloadcalculation) {
        return (
            <div>
                НЕТ данных
            </div>
        )
    }

    const isDraft = payloadcalculation.status == E_PayloadcalculationStatus.Draft
    const isCompleted = payloadcalculation.status == E_PayloadcalculationStatus.Completed

    return (
        <Form onSubmit={sendPayloadcalculation} className="pb-5">
            <h2 className="mb-5">{isDraft ? "Черновик расчета" : `Расчет №${id}` }</h2>
            
            <Row className="mb-5 fs-5">
                <Col md="6">
                    <FormGroup>
                        <Label for="cosmodromeSelect">Космодром *</Label>
                        <Input
                            id="cosmodromeSelect"
                            type="select"
                            value={selectedCosmodrome}
                            onChange={(e) => setSelectedCosmodrome(e.target.value)}
                            disabled={!isDraft}
                            required={isDraft}
                        >
                            <option value="">Выберите космодром</option>
                            {cosmodromes.map((cosmo) => (
                                <option key={cosmo.name} value={cosmo.name}>
                                    {cosmo.name} (координаты: {cosmo.coordinates}°)
                                </option>
                            ))}
                        </Input>
                        <small className="form-text text-muted">
                            Выберите космодром для запуска
                        </small>
                    </FormGroup>
                </Col>
                
                <Col md="6">
                    <FormGroup>
                        <Label for="commentInput">Комментарий</Label>
                        <Input
                            id="commentInput"
                            type="textarea"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={!isDraft}
                            rows={3}
                            placeholder="Дополнительная информация о расчете"
                        />
                        <small className="form-text text-muted">
                            Необязательное поле для заметок
                        </small>
                    </FormGroup>
                </Col>
            </Row>

            {isCompleted && (
                <Row className="mb-5">
                    <Col md="6">
                        <CustomInput 
                            label="Исход миссии" 
                            value={success} 
                            disabled={true}
                        />
                    </Col>
                    <Col md="6">
                        <CustomInput 
                            label="Выбранный космодром" 
                            value={payloadcalculation.cosmodrome || "Не указан"} 
                            disabled={true}
                        />
                    </Col>
                </Row>
            )}

            <Row>
                {payloadcalculation.rockets.length > 0 ? payloadcalculation.rockets.map((item: T_Rocket) => (
                    <Col md="4" key={item.rocket.pk} className="d-flex justify-content-center mb-5">
                        <RocketCard 
                            rocket={item.rocket} 
                            showRemoveBtn={isDraft} 
                            showMM={true} 
                            editMM={isDraft} 
                            value={item.rocket.comment}
                        />
                    </Col>
                )) :
                    <h3 className="text-center">Ракеты еще не добавлены</h3>
                }
            </Row>
            
            {isDraft &&
                <Row className="mt-5">
                    <Col className="d-flex gap-5 justify-content-center">
                        <Button 
                            color="success" 
                            className="fs-4" 
                            onClick={savePayloadcalculation}
                        >
                            Сохранить черновик
                        </Button>
                        
                        <Button 
                            color="primary" 
                            className="fs-4" 
                            type="submit"
                            disabled={!selectedCosmodrome} // Блокируем если космодром не выбран
                        >
                            Отправить на расчет
                        </Button>
                        
                        <Button 
                            color="danger" 
                            className="fs-4" 
                            onClick={deletePayloadcalculation}
                        >
                            Удалить расчет
                        </Button>
                    </Col>
                    
                    {!selectedCosmodrome && (
                        <Col className="text-center mt-3">
                            <small className="text-danger">
                                * Для отправки на расчет необходимо выбрать космодром
                            </small>
                        </Col>
                    )}
                </Row>
            }
        </Form>
    );
};