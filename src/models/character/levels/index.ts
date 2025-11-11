import {IPage} from "../../parsable";
import {xpath} from "../../../engine/xpath_attribute";
import {CombatJobEntry, JobEntry, NonCombatJobEntry} from "./components/job_entry";
import {ContentGroup} from "./components/content_group";
import {EMPTY, transform} from "../../../engine";

type JobMap<T extends JobEntry> = { [key: string]: T };

export class CharacterLevelsPage implements IPage {
    @xpath("//div[@class='clearfix' and preceding-sibling::h3[text()='DoW/DoM'] and following-sibling::h3[text()='DoH/DoL']]/div[@class='character__job__role']/ul[contains(@class, 'character__job')]/li",
        {type: () => CombatJobEntry, many: true})
    _combatJobs!: CombatJobEntry[];

    @xpath("//div[@class='clearfix' and preceding-sibling::h3[text()='DoH/DoL']]/div[@class='character__job__role']/ul[contains(@class, 'character__job')]/li",
        {type: () => NonCombatJobEntry, many: true})
    _nonCombatJobs!: NonCombatJobEntry[];

    get combatJobs(): JobMap<CombatJobEntry> {
        return this._combatJobs
            .filter(job => job.level !== undefined)
            .reduce((map: JobMap<CombatJobEntry>, job: CombatJobEntry) => {
                map[job._key] = job;
                return map;
            }, {});
    }

    get nonCombatJobs(): JobMap<NonCombatJobEntry> {
        return this._nonCombatJobs
            .filter(job => job.level !== undefined)
            .reduce((map: JobMap<NonCombatJobEntry>, job: NonCombatJobEntry) => {
                map[job._key] = job;
                return map;
            }, {});
    }

    @xpath(".")
    @transform({ undefinedIf: EMPTY })
    contentLevels!: ContentGroup;
}