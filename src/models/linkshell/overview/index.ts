import {IPage} from "../../parsable";
import {xpath} from "../../../engine/xpath_attribute";

export class LinkshellOverview implements IPage {
    @xpath("//h3[@class='heading__linkshell__name']/text()")
    name!: string;


    @xpath("//a[contains(@class, 'cf-member-link')]/@href", { default: null })
    communityFinderUrl!: string | null;

    @xpath("//div[@class='ls__member']/div[@class='entry'][1]//p[@class='entry__world']/text()")
    _worldInfo!: string;

    get world(): string {
        // Extract world name from "World [DataCenter]" format of first member
        const match = this._worldInfo.match(/([A-Za-z\s]+)\s\[/);
        return match ? match[1].trim() : this._worldInfo;
    }

    get datacenter(): string {
        // Extract datacenter from "World [DataCenter]" format of first member
        const match = this._worldInfo.match(/\[([A-Za-z]+)\]/);
        return match ? match[1] : '';
    }
}

