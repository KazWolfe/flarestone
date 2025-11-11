import {IComponent} from "../../../../parsable";
import {xpath} from "../../../../../engine/xpath_attribute";
import {transform} from "../../../../../engine";
import {FieldOperationLevel} from "./content_level";
import {serializerProperty, toKeyString} from "../../../../../engine/serializer";

export class PhantomJobLevel implements IComponent {
    @xpath("./p[@class='character__support_job__name']/text()")
    name!: string;

    @xpath("./p[@class='character__support_job__level']/text()")
    @transform({extractRegex: /Lv. (\d+)/, parseNumber: true, nullIf: ""})
    level!: string;

    @xpath("./p[@class='character__support_job__exp']/text()")
    _exp!: string | undefined;

    @xpath("./p[@class='character__support_job__exp']/text()")
    @transform({extractRegex: /^([\d,]+) \/ [\d,]+$/, parseNumber: true, nullIf: "--"})
    currentExp!: number | null;

    @xpath("./p[@class='character__support_job__exp']/text()")
    @transform({extractRegex: /^[\d,]+ \/ ([\d,]+)$/, parseNumber: true, nullIf: "--"})
    requiredExp!: number | null;

    @xpath("./p[@class='character__support_job__master']/text()", {default: false})
    mastered!: boolean;

    @xpath("./i[@class='character__support_job__icon']/img/@src")
    iconUrl!: string;

    @xpath("./div[@class='character__support_job__art']/img/@src")
    artUrl!: string;

    @serializerProperty({ internal: true })
    get _key(): string {
        return toKeyString(this.name.replace("Phantom ", ""));
    }
}

export class OccultCrescentLevel extends FieldOperationLevel {
    @xpath("./following-sibling::div[@class='character__support_job' and position()=1]//div[contains(@class, 'character__support_job__status')]",
        {type: () => PhantomJobLevel, many: true})
    _phantomJobs!: PhantomJobLevel[];

    get phantomJobs(): { [key: string]: PhantomJobLevel } {
        return this._phantomJobs
            .reduce((map: { [key: string]: PhantomJobLevel }, job: PhantomJobLevel) => {
                map[job._key] = job;
                return map;
            }, {});
    }
}