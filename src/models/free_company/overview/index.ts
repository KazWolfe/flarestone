import {IPage} from "../../parsable";
import {xpath} from "../../../engine/xpath_attribute";
import {EstateInfo} from "./components/estate";
import {WorldInfo} from "../../_common/common";
import {Standing} from "./components/standing";
import {RecruitmentInfo} from "./components/recruitment_info";
import {Reputation} from "./components/reputation";
import {AffiliatedGrandCompany} from "./components/affiliated_gc";

export class FreeCompany implements IPage {
    @xpath("//p[@class='entry__freecompany__name']/text()")
    name!: string;

    @xpath("//p[contains(@class, 'freecompany__text__tag')]/text()")
    _tag!: string;

    get tag(): string {
        return this._tag.replace(/[«»]/g, '');
    }

    // Raw HTML for consumers to parse.
    @xpath("//p[contains(@class, 'freecompany__text__message')]")
    slogan!: string;

    @xpath("//p[@class='entry__freecompany__gc' and ./i[contains(@class, 'xiv-lds-home-world')]]")
    _worldInfo!: WorldInfo;

    get world(): string {
        return this._worldInfo.world;
    }

    get datacenter(): string {
        return this._worldInfo.datacenter;
    }

    @xpath("//div[@class='entry__freecompany__box']/p[@class='entry__freecompany__gc'][1]")
    affiliatedGrandCompany!: AffiliatedGrandCompany;

    @xpath("//h3[text()='Formed']/following-sibling::p[@class='freecompany__text']/span[contains(@id, 'datetime-')]/following-sibling::script/text()")
    _createdDateScript!: string;

    get formed(): Date | undefined {
        const matcher = this._createdDateScript.match(/ldst_strftime\((\d+), 'YMD'\)/);
        if (!matcher) { return undefined; }

        const timestamp = Number(matcher[1]);
        return timestamp ? new Date(timestamp * 1000) : undefined;
    }

    @xpath("//h3[text()='Active Members']/following-sibling::p[@class='freecompany__text']/text()")
    activeMemberCount!: number;

    @xpath("//h3[text()='Rank']/following-sibling::p[@class='freecompany__text']/text()")
    fcRank!: number;

    @xpath("//div[@class='ldst__window']/div[contains(@class, 'freecompany__reputation')]", {type: () => Reputation, many: true})
    reputations!: Reputation[];

    @xpath("//table[contains(@class, 'character__ranking__data')]")
    standings!: Standing;

    @xpath("//div[@class='ldst__window' and ./h2[@id='anchor__focus']]")
    recruitmentInfo!: RecruitmentInfo;

    @xpath("//a[contains(@class, 'cf-member-link')]/@href")
    communityFinderUrl!: string;

    /* estate */
    @xpath("//p[@class='freecompany__estate__none']")
    _noEstateIndicator!: boolean;

    @xpath("//p[@class='freecompany__estate__name']")
    _estateInfo!: EstateInfo;

    get estate() {
        if (this._noEstateIndicator) {
            return null;
        }

        return this._estateInfo;
    }
}