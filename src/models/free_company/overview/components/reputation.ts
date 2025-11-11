import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {MatchedElement} from "../../../../engine/xpath_node";
import {getTextContent} from "../../../../engine/injector";

export class Reputation implements IComponent {
    @xpath(".//p[@class='freecompany__reputation__gcname']/text()")
    grandCompanyName!: string;

    @xpath(".//p[contains(@class, 'freecompany__reputation__rank')]")
    _rankElement!: MatchedElement;

    @xpath(".//div[@class='freecompany__reputation__data']/div[@class='character__bar']/div")
    _reputationBarElement!: MatchedElement;

    get rank(): number {
        const classAttr = this._rankElement.getAttribute('class') ?? '';

        // FIXME: Fragile.
        const rankId = classAttr.split(" ")[1].replace("color_", "");

        return Number(rankId);
    }

    get rankName(): string {
        return getTextContent(this._rankElement).trim();
    }

    get rankProgress(): number | undefined {
        const styleAttr = this._reputationBarElement.getAttribute('style') ?? '';
        const matcher = styleAttr.match(/width:\s*(\d+)%/);

        return matcher ? Number(matcher[1]) : undefined;
    }
}