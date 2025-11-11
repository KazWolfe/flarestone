import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {MiniClassJobInfo, MiniFreeCompanyInfo, MiniGrandCompanyInfo, WorldInfo} from "../../../_common/common";
import {serializerProperty} from "../../../../engine/serializer";
import {transform} from "../../../../engine";

export class SearchResult implements IComponent {
    @xpath(".//p[@class='entry__name']/text()")
    name!: string;

    @xpath(".//p[@class='entry__world']")
    _worldInfo!: WorldInfo;

    @serializerProperty({ emplaceAfter: "name" })
    get world() : string { return this._worldInfo.world }

    @serializerProperty({ emplaceAfter: "world" })
    get datacenter() : string { return this._worldInfo.datacenter }

    @xpath("./a[@class='entry__link']/@href")
    @transform({ extractRegex: /\/character\/(\d+)\// })
    id!: string;

    @xpath("./a[@class='entry__link']/@href")
    lodestoneUrl!: string;

    @xpath(".//ul[@class='entry__chara_info']/li[./i[@class='list__ic__class']]")
    classJob!: MiniClassJobInfo;

    @xpath(".//ul[@class='entry__chara_info']/li[@class='js__tooltip']",
        { default: null, type: () => MiniGrandCompanyInfo })
    grandCompany!: MiniGrandCompanyInfo | null;

    @xpath("./a[@class='entry__freecompany__link']", { default: null, type: () => MiniFreeCompanyInfo })
    freeCompany!: MiniFreeCompanyInfo | null;

    @xpath(".//div[@class='entry__chara__face']/img/@src")
    avatarUrl!: string;

    @xpath(".//div[@class='entry__chara__lang']/text()")
    @transform({ function: value => value.split("/") })
    languages!: string[];
}