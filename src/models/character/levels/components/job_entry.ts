import {xpath} from "../../../../engine/xpath_attribute";
import {transform} from "../../../../engine";
import {MatchedElement} from "../../../../engine/xpath_node";
import {IComponent} from "../../../parsable";
import {toKeyString, serializerProperty} from "../../../../engine/serializer";

export class JobEntry implements IComponent {
    @xpath("./div[contains(@class, 'character__job__name')]")
    _jobMeta!: MatchedElement;

    @xpath("./div[contains(@class, 'character__job__name')]/text()")
    name!: string;

    @xpath("./div[@class='character__job__level']/text()")
    @transform({ undefinedIf: "-", parseNumber: true })
    level!: number | undefined;

    @xpath("./i[@class='character__job__icon']/img/@src")
    iconUrl!: string;

    @xpath("./div[@class='character__job__exp']/text()")
    @transform({ extractRegex: /^([\d,]+) \/ [\d,]+$/, parseNumber: true, nullIf: "" })
    currentExp!: number | null;

    @xpath("./div[@class='character__job__exp']/text()")
    @transform({ extractRegex: /^[\d,]+ \/ ([\d,]+)$/ })
    @transform({ parseNumber: true, nullIf: "" })
    requiredExp!: number | null;

    @xpath("./../preceding-sibling::h4[@class='heading--lead']/text()")
    role!: string;

    @serializerProperty({ emplaceAfter: "role" })
    get baseClass(): string | undefined {
        const tooltip = this._jobMeta.getAttribute("data-tooltip");
        if (!tooltip) {
            return undefined;
        }

        const matcher = tooltip.match(/ \/ ([A-Za-z ]+)$/);
        return matcher ? matcher[1] : undefined;
    }

    @serializerProperty({ internal: true })
    get _key(): string {
        return toKeyString(this.name);
    }
}

export class CombatJobEntry extends JobEntry {
    get isLimitedJob(): boolean | undefined {
        const tooltip = this._jobMeta.getAttribute("data-tooltip");
        if (!tooltip) {
            return undefined;
        }

        const matcher = tooltip.match(/\(Limited Job\)/);
        return matcher ? true : undefined;
    }
}

export class NonCombatJobEntry extends JobEntry {
    get hasMastery(): boolean | undefined {
        const classList = this._jobMeta.getAttribute("class");

        if (!classList) {
            return undefined;
        }

        return classList.includes("character__job__name--meister") ? true : undefined;
    }
}