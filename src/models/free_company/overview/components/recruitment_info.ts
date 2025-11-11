import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";

export class Focus implements IComponent {
    @xpath(".//p")
    name!: string;

    @xpath(".//img/@src")
    iconUrl!: string;
}

export class SoughtRole implements IComponent {
    @xpath(".//p")
    name!: string;

    @xpath(".//img/@src")
    iconUrl!: string;
}

export class RecruitmentInfo implements IComponent {

    @xpath(".//h3[text()='Active']/following-sibling::p[@class='freecompany__text']/text()")
    _activeTimes!: string;

    @xpath(".//h3[text()='Recruitment']/following-sibling::p[contains(@class, 'freecompany__text')]/text()")
    _status!: string;

    @xpath(".//h3[text()='Focus']/following-sibling::ul[contains(@class, 'freecompany__focus_icon')]/li[not(@class='freecompany__focus_icon--off')]", {type: () => Focus, many: true})
    foci!: Focus[];

    @xpath(".//ul[contains(@class, 'freecompany__focus_icon--role')]/li[not(@class='freecompany__focus_icon--off')]", {type: () => SoughtRole, many: true})
    _seeking!: SoughtRole[];

    get activeTimes(): string | null {
        if (this._activeTimes == "Not specified") {
            return null;
        }

        return this._activeTimes;
    }

    get status(): string | null {
        if (this._status == "Not specified") {
            return null;
        }

        return this._status;
    }

    get seeking(): SoughtRole[] | null {
        return this._seeking.length > 0 ? this._seeking : null;
    }
}