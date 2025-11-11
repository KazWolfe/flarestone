import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {transform} from "../../../../engine";
import {toKeyString} from "../../../../engine/serializer";

export class SlimLevel implements IComponent {
    @xpath(".//img/@data-tooltip")
    @transform({ extractRegex: /([A-Za-z ]+)( \/ [A-Za-z ]+)?/, trim: true })
    name!: string;

    @xpath("./text()")
    level!: number;

    @xpath(".//img/@src")
    iconUrl!: string;

    get _key(): string {
        return toKeyString(this.name);
    }
}