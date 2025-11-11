import {IRequest, Router} from 'itty-router';
import CharacterController from "./controllers/character_controller";
import {CloudflareParams} from "./cloudflare/env_vars";
import {checkApiKey} from "./middleware/authentication";
import FreeCompanyController from "./controllers/free_company_controller";
import {fsFetch} from "./utils/fetch";
import * as url from "node:url";

const characterController = new CharacterController();
const freeCompanyController = new FreeCompanyController();

const router = Router<IRequest, CloudflareParams>();

router.get("/", async () => {
    return Response.redirect("https://xivauth.net/flarestone", 302);
});

router.all('*', (request: IRequest, env) => checkApiKey(request, env));

router.get('/character/search', async (request: IRequest) => characterController.findCharacters(request));
router.get('/character/:id', (request: IRequest) => characterController.getCharacter(request));
router.get('/character/:id/levels', (request: IRequest) => characterController.getCharacterLevels(request));

router.get('/free_company/:id', (request: IRequest) => freeCompanyController.getFreeCompany(request));
router.get('/free_company/:id/member', (request: IRequest) => freeCompanyController.getFreeCompanyMembers(request));
router.get('/free_company/:id/ranks', (request: IRequest) => freeCompanyController.getFreeCompanyRanks(request));

// 404 fallback
router.all('*', () => new Response('Not Found', {status: 404}));

export default {...router};
