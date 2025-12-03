import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {T_Sample} from "modules/types.ts";

interface Props {
    selectedSample: T_Sample | null
}

const Breadcrumbs = ({ selectedSample }: Props) => {

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
            {selectedSample &&
                <BreadcrumbItem active>
                    <Link to={location.pathname}>
                        { selectedSample.name }
                    </Link>
                </BreadcrumbItem>
            }
			<BreadcrumbItem />
        </Breadcrumb>
    );
};

export default Breadcrumbs