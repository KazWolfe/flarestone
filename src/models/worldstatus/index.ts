import {IPage} from "../parsable";
import {xpath} from "../../engine/xpath_attribute";
import {PhysicalDataCenter} from "./components/components";

export class WorldStatusPage implements IPage {
    @xpath("//div[contains(@class, 'js--tab-content') and @data-region]", {type: () => PhysicalDataCenter, many: true})
    regions!: PhysicalDataCenter[];
}
