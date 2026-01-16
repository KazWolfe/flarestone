import {IComponent} from "../../parsable";
import {xpath} from "../../../engine/xpath_attribute";
import {transform} from "../../../engine";
import {MiniGrandCompanyInfo, MiniClassJobInfo} from "../../_common/common";

export class PVPTeamMemberEntry implements IComponent {
    @xpath(".//a[@class='entry__bg']/@href")
    lodestoneUrl!: string;

    @xpath(".//a[@class='entry__bg']/@href")
    @transform({ extractRegex: /\/character\/(\d+)\// })
    id!: string;

    @xpath(".//p[@class='entry__name']/text()")
    name!: string;

    @xpath(".//p[@class='entry__world']/text()")
    _worldInfo!: string;

    @xpath(".//ul[@class='entry__freecompany__info']/li[i[@class='list__ic__class']]", { type: () => MiniClassJobInfo })
    classJob!: MiniClassJobInfo;

    @xpath(".//ul[@class='entry__freecompany__info']/li[@class='js__tooltip'][@data-tooltip]", { type: () => MiniGrandCompanyInfo })
    grandCompany!: MiniGrandCompanyInfo;

    @xpath(".//span[contains(preceding-sibling::img/@class, 'entry__pvpteam__battle__icon')]/text()")
    matches!: number;

    @xpath(".//li/span[text()='Leader' or text()='Subleader']/text()", { default: null })
    _roleText!: string | null;

    get world(): string {
        const match = this._worldInfo.match(/([A-Za-z\s]+)\s\[/);
        return match ? match[1].trim() : this._worldInfo;
    }

    get datacenter(): string {
        const match = this._worldInfo.match(/\[([A-Za-z]+)\]/);
        return match ? match[1] : '';
    }

    get rank(): 'LEADER' | 'SUBLEADER' | 'MEMBER' {
        if (this._roleText === 'Leader') return 'LEADER';
        if (this._roleText === 'Subleader') return 'SUBLEADER';
        return 'MEMBER';
    }
}

