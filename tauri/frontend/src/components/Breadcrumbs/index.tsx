import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {T_Rocket} from "modules/types.ts";

type Props = {
    selectedRocket: T_Rocket | null
}

const Breadcrumbs = ({selectedRocket}:Props) => {

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
			{location.pathname.includes("/rockets") &&
                <BreadcrumbItem active>
                    <Link to="/rockets">
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