import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {T_Rocket} from "modules/types.ts";

interface Props {
    selectedRocket: T_Rocket | null
}

const Breadcrumbs = ({ selectedRocket }: Props) => {

    const location = useLocation()

    return (
        <Breadcrumb className="fs-5">
			{location.pathname == "/" &&
				<BreadcrumbItem>
					<Link to="/">
						Главная
					</Link>
				</BreadcrumbItem>
			}
			{location.pathname.includes("/launchvehicle") &&
                <BreadcrumbItem active>
                    <Link to="/launchvehicle">
						Ракеты
                    </Link>
                </BreadcrumbItem>
			}
            {selectedRocket &&
                <BreadcrumbItem active>
                    <Link to={location.pathname}>
                        { selectedRocket.name }
                    </Link>
                </BreadcrumbItem>
            }
			<BreadcrumbItem />
        </Breadcrumb>
    );
};

export default Breadcrumbs