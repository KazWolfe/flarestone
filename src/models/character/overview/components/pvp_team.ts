import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {transform} from "../../../../engine";
import {CrestComponents} from "../../../_common/common";

export class PVPTeamInfo implements IComponent {
    @xpath(".//div[@class='character__pvpteam__name']//a/text()")
    name!: string;

    @xpath(".//div[@class='character__pvpteam__name']//a/@href")
    lodestoneUrl!: string;

    @xpath(".//div[@class='character__pvpteam__name']//a/@href")
    @transform({extractRegex: /\/pvpteam\/([0-9a-f]+)\//i})
    id!: string

    @xpath(".//div[@class='character__pvpteam__crest__image']")
    crest!: CrestComponents;
}
