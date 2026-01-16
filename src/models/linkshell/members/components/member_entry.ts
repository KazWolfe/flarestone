import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {MiniClassJobInfo, MiniGrandCompanyInfo, CrestComponents} from "../../../_common/common";
import {transform} from "../../../../engine";
import {LinkshellRankType, parseLinkshellRank} from "../../../crossworld_linkshell/linkshell_rank";

export class LinkshellMemberFreeCompany implements IComponent {
    @xpath("./@href")
    lodestoneUrl!: string;

    @xpath("./@href")
    @transform({ extractRegex: /\/freecompany\/(\d+)/i })
    id!: string;

    @xpath("./span/text()")
    name!: string;

    @xpath("./i[@class='list__ic__crest']", { default: null, type: () => CrestComponents })
    crest!: CrestComponents | null;
}

export class LinkshellMemberEntry implements IComponent {
    @xpath(".//p[@class='entry__name']/text()")
    name!: string;

    @xpath(".//p[@class='entry__world']/text()")
    _worldInfo!: string;

    get world(): string {
        // Extract world name from "World [DataCenter]" format
        const match = this._worldInfo.match(/([A-Za-z\s]+)\s\[/);
        return match ? match[1].trim() : this._worldInfo;
    }

    get datacenter(): string {
        // Extract datacenter from "World [DataCenter]" format
        const match = this._worldInfo.match(/\[([A-Za-z]+)\]/);
        return match ? match[1] : '';
    }

    @xpath(".//a[@class='entry__link']/@href")
    lodestoneUrl!: string;

    @xpath(".//a[@class='entry__link']/@href")
    @transform({ extractRegex: /\/character\/(\d+)/i })
    id!: string;

    @xpath(".//div[@class='entry__chara__face']/img/@src")
    avatarUrl!: string;

    @xpath(".//ul[@class='entry__chara_info']/li[1]")
    classJob!: MiniClassJobInfo;

    @xpath(".//ul[@class='entry__chara_info']/li[2]", { default: null, type: () => MiniGrandCompanyInfo })
    grandCompany!: MiniGrandCompanyInfo | null;

    @xpath(".//div[@class='entry__chara_info__linkshell']/span/text()", { default: null })
    _rankName!: string | null;

    get rank(): LinkshellRankType {
        return parseLinkshellRank(this._rankName);
    }

    @xpath(".//a[@class='entry__freecompany__link']", { default: null, type: () => LinkshellMemberFreeCompany })
    freeCompany!: LinkshellMemberFreeCompany | null;
}

