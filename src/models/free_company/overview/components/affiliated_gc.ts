import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {transform} from "../../../../engine";

export class AffiliatedGrandCompany implements IComponent {
    @xpath("./text()")
    _affiliatedGC!: string;

    @transform({ extractRegex: /(?<name>[A-Za-z ]+) <(?<rank>[A-Za-z]+)/, captureGroup: 'name', trim: true })
    @xpath("./text()")
    name!: string | undefined;

    @transform({ extractRegex: /(?<name>[A-Za-z ]+) <(?<rank>[A-Za-z]+)/, captureGroup: 'rank', trim: true })
    @xpath("./text()")
    rank!: string | undefined;
}