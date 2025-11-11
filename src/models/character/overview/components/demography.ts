import {IComponent} from "../../../parsable";
import {MatchedElement} from "../../../../engine/xpath_node";
import {xpath} from "../../../../engine/xpath_attribute";
import {getInnerHTML} from "../../../../engine/injector";

export class RaceClanGenderInfo implements IComponent {
    @xpath(".//p[@class='character-block__name']")
    _rcgParse!: MatchedElement;

    get race(): string {
        return getInnerHTML(this._rcgParse).split("<br>")[0].trim()
    }

    get _clanGender(): string {
        return getInnerHTML(this._rcgParse).split("<br>")[1].trim()
    }

    get clan(): string {
        return this._clanGender.split("/")[0].trim()
    }

    get gender(): string {
        return this._clanGender.split("/")[1].trim() == "♂" ? "male" : "female"
    }
}

export class CityStateInfo implements IComponent {
    @xpath(".//p[@class='character-block__name']")
    name!: string;

    @xpath(".//img/@src")
    iconUrl!: string;
}

export class GuardianInfo implements IComponent {
    @xpath(".//p[@class='character-block__name']")
    name!: string;

    @xpath(".//img/@src")
    iconUrl!: string;
}
