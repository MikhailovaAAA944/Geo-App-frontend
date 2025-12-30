import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {T_Rocket} from "modules/types.ts";

type Props = {
    selectedSample: T_Rocket | null
}

const Breadcrumbs = ({selectedSample}:Props) => {

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
			{location.pathname.includes("/samples") &&
                <BreadcrumbItem active>
                    <Link to="/samples">
						Образцы
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