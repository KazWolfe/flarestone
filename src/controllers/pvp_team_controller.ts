import {loadObjectFromUrl} from "../engine";
import {PVPTeamOverview} from "../models/pvp_team";
import {preSerializeFilter} from "../engine/serializer";
import {buildInit} from "../utils/fetch";
import {FlarestoneRequest} from "../types/request";

export default class PVPTeamController {
    async getPVPTeam(request: FlarestoneRequest): Promise<Response> {
        const requestOpts = buildInit(request);
        const pvpTeam = await loadObjectFromUrl(
            `https://na.finalfantasyxiv.com/lodestone/pvpteam/${request.params.id}`,
            PVPTeamOverview,
            requestOpts
        );

        return new Response(JSON.stringify(preSerializeFilter(pvpTeam)), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }
}

