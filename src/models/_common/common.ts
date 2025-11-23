import {IComponent} from "../parsable";
import {xpath} from "../../engine/xpath_attribute";
import {IGrandCompanyInfo, IWorldInfo} from "./interfaces";
import {transform} from "../../engine";

import classjob_icons from "../../data/classjob_icons.json" with { type: "json" };
import {serializerProperty} from "../../engine/serializer";

export class WorldInfo implements IComponent, IWorldInfo {
    @xpath("./text()[last()]")
    @transform({ extractRegex: /([A-Za-z]+) \[[A-Za-z]+]/ })
    world!: string

    @xpath("./text()[last()]")
    @transform({ extractRegex: /[A-Za-z]+ \[([A-Za-z]+)]/ })
    datacenter!: string
}

export class MiniGrandCompanyInfo implements IComponent, IGrandCompanyInfo {
    @xpath("./@data-tooltip")
    _gcParse!: string;

    @xpath("./@data-tooltip")
    @transform({ function: (val) => val.split("/")[0].trim() })
    name!: string;

    @xpath("./@data-tooltip")
    @transform({ function: (val) => val.split("/")[1].trim() })
    rank!: string;

    @xpath("./img/@src")
    iconUrl!: string;
}

export class MiniClassJobInfo implements IComponent {
    @xpath("./span/text()")
    level!: number;

    @xpath("./i[@class='list__ic__class']/img/@src")
    iconUrl!: string;

    @serializerProperty({ emplaceAfter: "level" })
    get name(): string {
        const iconName = this.iconUrl.split("/").pop() || "";

        if (classjob_icons.hasOwnProperty(iconName)) {
            return classjob_icons[iconName];
        } else {
            return "Unknown";
        }
    }
}

export class MiniFreeCompanyInfo implements IComponent {
    @xpath('./@href')
    lodestoneUrl!: string;

    @xpath('./span/text()')
    name!: string;
}

export class CrestComponents implements IComponent {
    @xpath(".//img[1]/@src")
    background!: string;

    @xpath(".//img[2]/@src")
    frame!: string;

    @xpath(".//img[3]/@src")
    symbol!: string;
}