import {Link} from "react-router-dom";
import {Badge, Button} from "reactstrap";

type Props = {
    isActive: boolean,
    draft_mission_id: string,
    samples_count: number
}

export const Bin = ({isActive, draft_mission_id, samples_count}:Props) => {

    if (!isActive) {
        return <Button color={"secondary"} className="bin-wrapper" disabled>Корзина</Button>
    }

    return (
        <Link to={`/missions/${draft_mission_id}/`} className="bin-wrapper">
            <Button color={"primary"} className="w-100 bin">
                Корзина
                <Badge>
                    {samples_count}
                </Badge>
            </Button>
        </Link>
    )
}