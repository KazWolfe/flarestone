import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {transform} from "../../../../engine";

export class Standing implements IComponent {
    @transform({ extractRegex: /Rank:([0-9\-]+)/, nullIf: "--", parseNumber: true })
    @xpath("//th[contains(text(), 'Weekly Rank')]/text()")
    weekly!: number | null | undefined;

    @transform({ extractRegex: /Rank:([0-9\-]+)/, nullIf: "--", parseNumber: true })
    @xpath("//th[contains(text(), 'Monthly Rank')]/text()")
    monthly!: number | null | undefined;
}