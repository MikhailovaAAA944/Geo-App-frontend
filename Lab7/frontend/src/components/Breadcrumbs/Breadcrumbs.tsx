import * as React from 'react';
import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {useAppSelector} from "store/store.ts";

export const Breadcrumbs = () => {

    const location = useLocation()

    const selectedRocket = useAppSelector((state) => state.rockets.selectedRocket)

    const payloadcalculation = useAppSelector((state) => state.payloadcalculations.payloadcalculation)

    const crumbs = () => {

        if (location.pathname == '/') {
            return (
                <>
                    <BreadcrumbItem>
                        <Link to="/">
                            Главная
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem></BreadcrumbItem>
                </>
            )
        }

        if (location.pathname == '/launchvehicle/') {
            return (
                <>
                    <BreadcrumbItem>
                        <Link to="/launchvehicle/">
                            Ракеты
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem></BreadcrumbItem>
                </>
            )
        }

        if (selectedRocket) {
            return (
                <>
                    <BreadcrumbItem>
                        <Link to="/launchvehicle/">
                            Ракеты
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        <Link to={location.pathname}>
                            {selectedRocket?.name}
                        </Link>
                    </BreadcrumbItem>
                </>
            )
        }

        if (payloadcalculation) {
            return (
                <>
                    <BreadcrumbItem active>
                        <Link to="/payloadcalculations/">
                            Расчеты
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        <Link to={location.pathname}>
                            Расчет №{payloadcalculation?.id}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem></BreadcrumbItem>
                </>
            )
        }

        if (location.pathname == '/payloadcalculations/') {
            return (
                <>
                    <BreadcrumbItem active>
                        <Link to={location.pathname}>
                            Расчеты
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem></BreadcrumbItem>
                </>
            )
        }

        if (location.pathname == '/login/') {
            return (
                <>
                    <BreadcrumbItem active>
                        <Link to={location.pathname}>
                            Вход
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem></BreadcrumbItem>
                </>
            )
        }

        if (location.pathname == '/register/') {
            return (
                <>
                    <BreadcrumbItem active>
                        <Link to={location.pathname}>
                            Регистрация
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem></BreadcrumbItem>
                </>
            )
        }
    };

    return (
        <Breadcrumb className="fs-5">
            {crumbs()}
        </Breadcrumb>
    );
};