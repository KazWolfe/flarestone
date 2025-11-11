import {IComponent} from "../../../parsable";
import {MatchedElement} from "../../../../engine/xpath_node";
import {xpath} from "../../../../engine/xpath_attribute";

export class GlamourInfo {
    @xpath("./p/text()")
    name!: string;

    @xpath("./p/a/@href")
    eorzeaDbUrl!: string;

    @xpath(".//img[@class='ic_reflection']/@src")
    iconUrl!: string;
}

export class CreatorInfo implements IComponent {
    @xpath("./text()")
    name!: string;

    @xpath("./@href")
    lodestoneUrl!: string;
}

export class Materia implements IComponent {
    @xpath(".")
    _materiaDiv!: MatchedElement;

    @xpath("./div[contains(@class, 'socket')]")
    _socketDiv!: MatchedElement;

    @xpath("./div[@class='db-tooltip__materia__txt']/text()")
    name!: string;

    get grade(): number {
        const classAttr = this._socketDiv.getAttribute('class') ?? '';

        // FIXME: Fragile.
        const materiaClass = classAttr.split(" ")[1];

        return this.resolveMateriaClass(materiaClass);
    }

    get isAdvancedSlot(): boolean | undefined {
        const classAttr = this._materiaDiv.getAttribute('class') ?? '';
        return classAttr.includes('db-tooltip__materia__forbidden') || undefined;
    }

    private resolveMateriaClass(attribute: string) {
        const matcher = attribute.match(/materia(\d{1,2})/);
        if (matcher) {
            return Number(matcher[1]);
        } else {
            switch (attribute) {
                case 'materia': return 1;
                case 'materira': return 2;
                case 'materida': return 3;
                case 'materiga': return 4;
                case 'materija': return 5;
                case 'highmaterija': return 6;
                default: return NaN;
            }
        }
    }
}

export class EquippedItem implements IComponent {
    @xpath(".//h2[contains(@class, 'db-tooltip__item__name')]/text()")
    name!: string;

    @xpath(".//h2[contains(@class, 'db-tooltip__item__name')]/span/text()")
    _hqIndicator!: string | undefined;

    get highQuality(): boolean | undefined {
        return this._hqIndicator !== undefined || undefined;
    }

    @xpath(".//div[@class='db-tooltip__bt_item_detail']/a/@href")
    eorzeaDbUrl!: string;

    @xpath(".//div[contains(@class, 'db-tooltip__item__mirage') and ./p]", {type: () => GlamourInfo, default: null})
    glamour!: GlamourInfo[] | null;

    @xpath(".//ul[@class='db-tooltip__materia']/li[contains(@class, 'db-tooltip__materia__')]", {type: () => Materia, many: true })
    _materia: Materia[] | undefined;

    get materia(): (Materia | null)[] | undefined {
        if (!this._materia || this._materia.length === 0) {
            return undefined;
        }

        return this._materia.map((m) => {return m.name ? m : null});
    }

    @xpath(".//div[@class='db-tooltip__info_text']/a[contains(@href, '/lodestone/components')]", {type: () => CreatorInfo})
    creator: CreatorInfo | undefined;

    @xpath(".//img[@class='character__item_icon__img']/@src")
    iconUrl!: string;
}

export class Inventory implements IComponent {
    @xpath(".//div[contains(@class, 'icon-c--0')]")
    mainHand!: EquippedItem;

    @xpath(".//div[contains(@class, 'icon-c--1 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    offHand!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--2 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    head!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--3 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    body!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--4 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    hands!: EquippedItem | null;

    // icon-c--5 doesnt exist. Belts.

    @xpath(".//div[contains(@class, 'icon-c--6 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    legs!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--7 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    feet!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--8 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    earrings!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--9 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    necklace!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--10 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    bracelets!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--11 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    ring1!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--12 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    ring2!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--13 ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    soulstone!: EquippedItem | null;

    @xpath(".//div[contains(@class, 'icon-c--glasses ')]", { default: null, defaultIfEmpty: true, type: () => EquippedItem })
    glasses!: EquippedItem | null;
}