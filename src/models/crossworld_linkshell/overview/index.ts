import {IPage} from "../../parsable";
import {xpath} from "../../../engine/xpath_attribute";

export class CrossworldLinkshellOverview implements IPage {
    @xpath("//h3[@class='heading__linkshell__name']/text()[1]")
    name!: string;

    @xpath("//h3[@class='heading__linkshell__name']/span[@class='heading__cwls__dcname']/text()")
    datacenter!: string;

    @xpath("//span[@class='heading__cwls__formed']/script/text()")
    _formedDateScript!: string;

    get formed(): Date | undefined {
        const matcher = this._formedDateScript.match(/ldst_strftime\((\d+), 'YMD'\)/);
        if (!matcher) { return undefined; }

        const timestamp = Number(matcher[1]);
        return timestamp ? new Date(timestamp * 1000) : undefined;
    }


    @xpath("//a[contains(@class, 'cf-member-link')]/@href", { default: null })
    communityFinderUrl!: string | null;
}

