import {IComponent} from "../../../../parsable";
import {xpath} from "../../../../../engine/xpath_attribute";
import {transform} from "../../../../../engine";

export class FieldOperationLevel implements IComponent {
    static _EXP_REGEX = /(?<current>[0-9,]+|--) \/.* (?<required>[0-9,]+|--)$/

    @xpath("./preceding-sibling::h3[@class='heading--md'][1]/text()")
    contentName!: string;

    @xpath("./div[@class='character__job__name']/text()")
    levelName!: string;

    @xpath("./div[@class='character__job__level']/text()")
    level!: number;

    @xpath("./div[@class='character__job__exp']/text()")
    @transform({ extractRegex: FieldOperationLevel._EXP_REGEX, captureGroup: 'current', parseNumber: true, nullIf: "--" })
    currentExp!: string;

    @xpath("./div[@class='character__job__exp']/text()")
    @transform({ extractRegex: FieldOperationLevel._EXP_REGEX, captureGroup: 'required', parseNumber: true, nullIf: "--" })
    requiredExp!: string;
}