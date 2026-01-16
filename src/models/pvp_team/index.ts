import {IPage} from "../parsable";
import {xpath} from "../../engine/xpath_attribute";
import {PVPTeamMemberEntry} from "./components/member_entry";
import {LightMemberEntry} from "../_common/light_member_entry";
import {CrestComponents} from "../_common/common";
import {serializerProperty} from "../../engine/serializer";

export class PVPTeamOverview implements IPage {
    @xpath("//h2[@class='entry__pvpteam__name--team']/text()")
    name!: string;

    @xpath("//p[@class='entry__pvpteam__name--dc']/text()")
    datacenter!: string;

    @xpath("//span[contains(preceding-sibling::text(), 'Formed:')]/following-sibling::script/text()")
    _formedDateScript!: string;

    @xpath("//div[@class='entry__pvpteam__crest__image']", { type: () => CrestComponents })
    crest!: CrestComponents;

    @xpath("//div[@class='pvpteam__member']/div[@class='entry']", { type: () => PVPTeamMemberEntry, many: true })
    members!: PVPTeamMemberEntry[];

    @serializerProperty({ emplaceAfter: "datacenter" })
    get formed(): Date | undefined {
        const matcher = this._formedDateScript.match(/ldst_strftime\((\d+), 'YMD'\)/);
        if (!matcher) { return undefined; }

        const timestamp = Number(matcher[1]);
        return timestamp ? new Date(timestamp * 1000) : undefined;
    }

    @serializerProperty({ emplaceAfter: "crest" })
    get owner(): LightMemberEntry | undefined {
        const leader = this.members.find(m => m.rank === 'LEADER');
        if (!leader) { return undefined; }

        return {
            id: leader.id,
            name: leader.name,
            lodestoneUrl: leader.lodestoneUrl
        };
    }
}

