import {IComponent} from "../../../parsable";
import {IGrandCompanyInfo} from "../../../_common/interfaces";
import {xpath} from "../../../../engine/xpath_attribute";
import {transform} from "../../../../engine";

export class GrandCompanyInfo implements IComponent, IGrandCompanyInfo {
    @xpath(".//p[@class='character-block__name']")
    _gcParse!: string;

    @transform({ function: (val) => val.split("/")[0].trim() })
    @xpath(".//p[@class='character-block__name']")
    name!: string;

    @transform({ function: (val) => val.split("/")[1].trim() })
    @xpath(".//p[@class='character-block__name']")
    rank!: string;

    @xpath("./img/@src")
    iconUrl!: string;
}