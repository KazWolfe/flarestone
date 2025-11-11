import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {transform} from "../../../../engine";

export class EstateAddress implements IComponent {
    private static _ADDRESS_REGEX = /Plot (?<plot>\d+), (?<ward>\d+) Ward, (?<zone>[0-9a-zA-Z ]+) \((?<size>[0-9a-zA-Z]+)\)/
    private static _ADDRESS_XPATH = "//p[@class='freecompany__estate__title' and text()='Address']/following-sibling::p[@class='freecompany__estate__text']/text()";

    @xpath(EstateAddress._ADDRESS_XPATH)
    @transform({ extractRegex: EstateAddress._ADDRESS_REGEX, captureGroup: 'plot', parseNumber: true })
    plot!: number;

    @xpath(EstateAddress._ADDRESS_XPATH)
    @transform({ extractRegex: EstateAddress._ADDRESS_REGEX, captureGroup: 'ward', parseNumber: true })
    ward!: number;

    @xpath(EstateAddress._ADDRESS_XPATH)
    @transform({ extractRegex: EstateAddress._ADDRESS_REGEX, captureGroup: 'zone' })
    zone!: string;

    @xpath(EstateAddress._ADDRESS_XPATH)
    @transform({ extractRegex: EstateAddress._ADDRESS_REGEX, captureGroup: 'size' })
    _size!: string;
}

export class EstateInfo implements IComponent {
    // note: everything here is global-scope, since SE doesn't wrap estate info in a container

    @xpath("//p[@class='freecompany__estate__name']/text()")
    name!: string;

    @xpath("//p[@class='freecompany__estate__greeting']/text()")
    greeting!: string;

    @xpath(".")
    address!: EstateAddress;

    get size(): string {
        return this.address._size;
    }
}