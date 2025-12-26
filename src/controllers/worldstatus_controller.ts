import {preSerializeFilter} from "../engine/serializer";
import {buildInit, fsFetch} from "../utils/fetch";
import {loadObjectFromUrl} from "../engine";
import {FlarestoneRequest} from "../types/request";
import {WorldStatusPage} from "../models/worldstatus";
import {flattenWorldStatus} from "../transformers/worldstatus_flattener";

export default class WorldStatusController {
    async getWorldStatus(request: FlarestoneRequest): Promise<Response> {
        const url = `https://na.finalfantasyxiv.com/lodestone/worldstatus/`;
        const result = await loadObjectFromUrl(url, WorldStatusPage, buildInit(request));

        return new Response(JSON.stringify(preSerializeFilter(result)), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }

    async getWorldStatusFlat(request: FlarestoneRequest): Promise<Response> {
        const url = `https://na.finalfantasyxiv.com/lodestone/worldstatus/`;
        const status = await loadObjectFromUrl(url, WorldStatusPage, buildInit(request));

       let result = flattenWorldStatus(Object.values(status.regions));

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }
}