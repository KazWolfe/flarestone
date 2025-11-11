import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {transform} from "../../../../engine";

export class CrestComponents implements IComponent {
    @xpath(".//img[1]/@src")
    background!: string;

    @xpath(".//img[2]/@src")
    frame!: string;

    @xpath(".//img[3]/@src")
    symbol!: string;
}

export class FreeCompanyInfo implements IComponent {
    @xpath(".//div[@class='character__freecompany__name']//a/text()")
    name!: string;

    @xpath(".//div[@class='character__freecompany__name']//a/@href")
    lodestoneUrl!: string;

    @xpath(".//div[@class='character__freecompany__name']//a/@href")
    @transform({ extractRegex: /\/freecompany\/(\d+)/i })
    id!: string

    @xpath(".//div[@class='character__freecompany__crest__image']")
    crest!: CrestComponents;
}

