import {CityStateInfo, GuardianInfo, RaceClanGenderInfo} from "./components/demography";
import {SlimLevel} from "./components/slim_level";
import {Inventory} from "./components/items";
import {StatBlock} from "./components/stat_block";
import {GrandCompanyInfo} from "./components/grand_company";
import {FreeCompanyInfo} from "./components/free_company";
import {IPage} from "../../parsable";
import {WorldInfo} from "../../_common/common";
import {xpath} from "../../../engine/xpath_attribute";
import {EMPTY, transform} from "../../../engine";
import {CurrentClass} from "./components/current_class";

export class CharacterPage implements IPage {
    @xpath("//p[@class='frame__chara__name']/text()")
    name!: string;

    @xpath("//p[@class='frame__chara__title']/text()")
    title!: string;

    @xpath("//p[@class='frame__chara__world']")
    _worldInfo!: WorldInfo;

    get world() : string { return this._worldInfo.world }
    get datacenter() : string { return this._worldInfo.datacenter }

    @xpath("//div[@class='frame__chara__face']/img/@src")
    headshotUrl!: string;

    @xpath("//div[@class='character__detail__image']/a/@href")
    portraitUrl!: string;

    @xpath("//div[@class='character__class__data']")
    currentClass!: CurrentClass;

    @xpath("//p[@class='character-block__title' and text()='Grand Company']//ancestor::div[@class='character-block']")
    grandCompany!: GrandCompanyInfo;

    @xpath("//div[@class='character__freecompany__crest']//ancestor::div[@class='character-block']")
    freeCompany!: FreeCompanyInfo;

    @xpath("//p[@class='components-block__title' and text()='Race/Clan/Gender']//ancestor::div[@class='character-block']")
    _rcg_info!: RaceClanGenderInfo;

    get race(): string {
        return this._rcg_info.race;
    }

    get clan(): string {
        return this._rcg_info.clan;
    }

    get gender(): string {
        return this._rcg_info.gender;
    }

    // Includes (escaped) HTML for clients to handle.
    @xpath("//div[@class='character__selfintroduction']")
    bio!: string;

    @xpath("//div[@class='character__level__list']/ul/li", {type: () => SlimLevel, many: true})
    @transform({ undefinedIf: EMPTY })
    _levels!: SlimLevel[] | undefined;

    get levels(): { [k: string]: SlimLevel } | undefined {
        return this._levels?.reduce((obj, entry) => {
            obj[entry._key] = entry;
            return obj;
        }, {});
    }

    @xpath("//p[@class='character-block__title' and text()='City-state']//ancestor::div[@class='character-block']")
    homeCity!: CityStateInfo;

    @xpath("//p[@class='character-block__title' and text()='Nameday']//following-sibling::p[@class='character-block__birth']/text()")
    nameday!: string;

    @xpath("//p[@class='character-block__title' and text()='Guardian']//ancestor::div[@class='character-block']")
    guardian!: GuardianInfo;

    @xpath("//div[@class='character__profile__detail']")
    equippedInventory!: Inventory;

    @xpath("//div[contains(@class, 'js__character_toggle') and .//table[@class='character__param__list']]", {type: () => StatBlock})
    statBlock!: StatBlock;
}