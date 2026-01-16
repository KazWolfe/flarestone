import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";

export class LinkshellRank implements IComponent {
    @xpath("./span/text()")
    name!: string;
}



