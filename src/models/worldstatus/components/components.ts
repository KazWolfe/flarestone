import {IComponent} from "../../parsable";
import {xpath} from "../../../engine/xpath_attribute";
import * as xpath_lib from 'xpath';
import {transform} from "../../../engine";
import {serializerProperty} from "../../../engine/serializer";
import {MatchedElement} from "../../../engine/xpath_node";

export class PhysicalDataCenter implements IComponent {
    @xpath(".")
    _node!: MatchedElement;

    @xpath('./@data-region')
    id!: number;

    @serializerProperty({ emplaceAfter: "id" })
    get name(): string {
        const ns_xpath = "//ul[@class='world__tab js--tab-buttons']/li[@data-region='" + this.id + "']/a/span/text()";

        const match = xpath_lib.select(ns_xpath, this._node.ownerDocument);

        return match ? match.toString() : "Unknown";
    }

    @xpath(".//li[@class='world-dcgroup__item']", { type: () => LogicalDataCenter, many: true })
    dataCenters!: LogicalDataCenter[];
}

export class LogicalDataCenter implements IComponent {
    @xpath(".//h2[@class='world-dcgroup__header']/text()")
    name!: string;

    @xpath(".//li[contains(@class, 'item-list')]/div[@class='world-list__item']", { type: () => World, many: true })
    worlds!: World[];
}

export class World implements IComponent {
    @xpath("./div[@class='world-list__world_name']/p/text()")
    @transform({ trim: true })
    name!: string;

    @xpath("./div[@class='world-list__status_icon']/i/@data-tooltip")
    @transform({ trim: true })
    status!: string;

    @xpath("./div[@class='world-list__world_category']/p/text()")
    @transform({ trim: true, nullIf: "--" })
    category!: string | null;

    @xpath("./div[@class='world-list__create_character']/i/@class")
    @transform({ extractRegex: /world-ic__(available|unavailable)/, nullIf: "--" })
    _creationOpen!: string | null;

    get creationOpen(): boolean | null {
        if (this._creationOpen === null) {
            return null;
        }

        return this._creationOpen === "available";
    }
}