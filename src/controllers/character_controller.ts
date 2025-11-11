import {IRequest} from "itty-router";
import {CharacterPage} from "../models/character/overview";
import {preSerializeFilter} from "../engine/serializer";
import {CharacterLevelsPage} from "../models/character/levels";
import {loadCharacterPageWithMeta} from "../transformers/character_scrape_meta";
import {fsFetch} from "../utils/fetch";
import {CharacterSearchPage} from "../models/character/search";
import {loadObjectFromUrl} from "../engine";

export default class CharacterController {
    async getCharacter(request: IRequest): Promise<Response> {
        const url = `https://na.finalfantasyxiv.com/lodestone/character/${request.params.id}`;
        const lodestoneResponse = await fsFetch(url);
        const result = await loadCharacterPageWithMeta(lodestoneResponse, CharacterPage);

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

    async getCharacterLevels(request: IRequest): Promise<Response> {
        const url = `https://na.finalfantasyxiv.com/lodestone/character/${request.params.id}/class_job/`;
        const lodestoneResponse = await fsFetch(url);
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

    async findCharacters(request: IRequest): Promise<Response> {
        const searchParams = this.buildSearchParams(request.query);

        const url = `https://na.finalfantasyxiv.com/lodestone/character/?${searchParams}`;
        const result = await loadObjectFromUrl(url, CharacterSearchPage);

        return new Response(JSON.stringify(preSerializeFilter(result)), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }

    private buildSearchParams(query: {[name: string]: string | string[] | undefined}): string {
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