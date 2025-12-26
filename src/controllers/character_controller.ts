import {CharacterPage} from "../models/character/overview";
import {preSerializeFilter} from "../engine/serializer";
import {CharacterLevelsPage} from "../models/character/levels";
import {loadCharacterPageWithMeta} from "../transformers/character_scrape_meta";
import {buildInit, fsFetch} from "../utils/fetch";
import {CharacterSearchPage} from "../models/character/search";
import {loadObjectFromUrl} from "../engine";
import {FlarestoneRequest} from "../types/request";

export default class CharacterController {
    async getCharacter(request: FlarestoneRequest): Promise<Response> {
        const url = `https://na.finalfantasyxiv.com/lodestone/character/${request.params.id}`;
        const lodestoneResponse = await fsFetch(url, buildInit(request));
        const result = await loadCharacterPageWithMeta(lodestoneResponse, CharacterPage);

        const responseData = {
            ...preSerializeFilter(result.data),
            _meta: {
                ...result.scrapeMeta
            }
        };

        if (result.data?.name) {
            console.log(`Fetched information for ${result.data.name} @ ${result.data.world}.`);
        } else {
            console.warn(`Request for character ID ${request.params.id} returned result ${result.scrapeMeta.resultCode}.`, {
                lodestoneStatusCode: result.scrapeMeta.upstreamStatusCode
            });
        }

        return new Response(JSON.stringify(responseData), {
            status: result.responseStatusCode,
            headers: {'Content-Type': 'application/json'}
        });
    }

    async getCharacterLevels(request: FlarestoneRequest): Promise<Response> {
        const url = `https://na.finalfantasyxiv.com/lodestone/character/${request.params.id}/class_job/`;
        const lodestoneResponse = await fsFetch(url, buildInit(request));
        const result = await loadCharacterPageWithMeta(lodestoneResponse, CharacterLevelsPage);

        const responseData = {
            ...preSerializeFilter(result.data),
            _meta: {
                ...result.scrapeMeta
            }
        };

        return new Response(JSON.stringify(responseData), {
            status: result.responseStatusCode,
            headers: {'Content-Type': 'application/json'}
        });
    }

    async findCharacters(request: FlarestoneRequest): Promise<Response> {
        const searchParams = this.buildSearchParams(request.query);

        const url = `https://na.finalfantasyxiv.com/lodestone/character/?${searchParams}`;
        const requestInit = buildInit(request);
        const result = await loadObjectFromUrl(url, CharacterSearchPage, requestInit);

        // Filter out non-matches if using exact search
        if (request.query["exact"] === "true") {
            result.results = result.results
                .filter(r => r.name.toLowerCase() === (request.query["name"]?.toString().toLowerCase() || ""));
        }

        return new Response(JSON.stringify(preSerializeFilter(result)), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }

    private buildSearchParams(query: { [name: string]: string | string[] | undefined }): string {
        let searchParams: URLSearchParams = new URLSearchParams();

        let name = query["name"]?.toString() || "";
        if (query["exact"] === "true") {
            name = `"${name}"`;
        }

        searchParams.set("q", name);

        if (query["world"]) {
            searchParams.set("worldname", query["world"]?.toString() || "");
        } else if (query["datacenter"]) {
            searchParams.set("worldname", `_dc_${(query["datacenter"]?.toString() || "")}`);
        } else {
            searchParams.set("worldname", "");
        }

        return searchParams.toString();
    }
}