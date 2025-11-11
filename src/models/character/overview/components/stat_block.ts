import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";

interface IStatEntry {
    name: string
    value: number
}

export class StatEntry implements IStatEntry, IComponent {
    @xpath(".//th/span/text()")
    name!: string;

    @xpath(".//td/text()")
    value!: number;
}

export class StatBlock implements IComponent {
    @xpath(".//table[@class='character__param__list']//tr", {type: () => StatEntry, many: true})
    attributes!: StatEntry[];

    @xpath("(//div[@class='character__param']//p[contains(@class, 'character__param__text')])[1]/text()")
    _primaryConsumableName!: string;

    @xpath("(//div[@class='character__param']//p[contains(@class, 'character__param__text')])[1]//following-sibling::span/text()")
    _primaryConsumableValue!: number;

    @xpath("(//div[@class='character__param']//p[contains(@class, 'character__param__text')])[2]/text()")
    _secondaryConsumableName!: string;

    @xpath("(//div[@class='character__param']//p[contains(@class, 'character__param__text')])[2]//following-sibling::span/text()")
    _secondaryConsumableValue!: number;

    get consumables(): IStatEntry[] {
        return [
            { name: this._primaryConsumableName, value:this._primaryConsumableValue },
            { name: this._secondaryConsumableName, value:this._secondaryConsumableValue }
        ];
    }
}