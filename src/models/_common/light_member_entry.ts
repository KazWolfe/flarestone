import {IComponent} from "../parsable";
import {xpath} from "../../engine/xpath_attribute";
import {transform} from "../../engine";

export class LightMemberEntry implements IComponent {
    @xpath(".//a[@class='entry__link']/@href")
    lodestoneUrl!: string;

    @xpath(".//a[@class='entry__link']/@href")
    @transform({ extractRegex: /\/character\/(\d+)/i })
    id!: string;

    @xpath(".//p[@class='entry__name']/text()")
    name!: string;
}

