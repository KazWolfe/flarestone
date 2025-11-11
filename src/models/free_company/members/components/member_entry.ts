import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {transform} from "../../../../engine";
import {IGrandCompanyInfo} from "../../../_common/interfaces";
import {MiniClassJobInfo, MiniGrandCompanyInfo} from "../../../_common/common";

export class RankInfo implements IComponent {
    @xpath("./span/text()")
    name!: string;

    @xpath("./img/@src")
    iconUrl!: string;
}

export class MemberEntry implements IComponent {
    @xpath(".//p[@class='entry__name']/text()")
    name!: string;

    @xpath(".//p[@class='entry__world']/text()")
    _worldInfo!: string;

    @xpath(".//a[@class='entry__bg']/@href")
    lodestoneUrl!: string;

    @xpath(".//div[@class='entry__chara__face']/img/@src")
    avatarUrl!: string;

    @xpath(".//ul[@class='entry__freecompany__info']/li[1]")
    rank!: RankInfo;

    @xpath(".//ul[@class='entry__freecompany__info']/li[2]")
    classJob!: MiniClassJobInfo;

    @xpath(".//ul[@class='entry__freecompany__info']/li[3]", { default: null, type: () => MiniGrandCompanyInfo })
    grandCompany!: MiniGrandCompanyInfo | null;
}