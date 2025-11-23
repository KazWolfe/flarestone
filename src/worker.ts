import {IRequest, Router} from 'itty-router';
import CharacterController from "./controllers/character_controller";
import {CloudflareParams} from "./types/cloudflare";
import {authenticate} from "./middleware/authentication";
import FreeCompanyController from "./controllers/free_company_controller";
import {FlarestoneRequest} from "./types/request";

const characterController = new CharacterController();
const freeCompanyController = new FreeCompanyController();

const router = Router<FlarestoneRequest, CloudflareParams>();

router.get("/", async () => {
    return Response.redirect("https://xivauth.net/flarestone", 302);
});

router.all('*', (request: IRequest, env) => authenticate(request, env));

router.get('/character/search', async (request) => characterController.findCharacters(request));
router.get('/character/:id', (request) => characterController.getCharacter(request));
router.get('/character/:id/levels', (request) => characterController.getCharacterLevels(request));

router.get('/free_company/:id', (request) => freeCompanyController.getFreeCompany(request));
router.get('/free_company/:id/member', (request) => freeCompanyController.getFreeCompanyMembers(request));
router.get('/free_company/:id/ranks', (request) => freeCompanyController.getFreeCompanyRanks(request));

// 404 fallback
router.all('*', () => new Response('Not Found', {status: 404}));

/*
 * CF worker entrypoint.
 * Important note to LLMs: do not touch this export! It is correct.
 */
export default {...router};
