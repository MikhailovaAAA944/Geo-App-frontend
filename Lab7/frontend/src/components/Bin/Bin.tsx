import {Link} from "react-router-dom";
import {Badge, Button} from "reactstrap";

type Props = {
    isActive: boolean,
    draft_payloadcalculation_id: string,
    rockets_count: number
}

export const Bin = ({isActive, draft_payloadcalculation_id, rockets_count}:Props) => {

    if (!isActive) {
        return <Button color={"secondary"} className="bin-wrapper" disabled>Корзина</Button>
    }

    return (
        <Link to={`/payloadcalculation/${draft_payloadcalculation_id}/`} className="bin-wrapper">
            <Button color={"primary"} className="w-100 bin">
                Корзина
                <Badge>
                    {rockets_count}
                </Badge>
            </Button>
        </Link>
    )
}