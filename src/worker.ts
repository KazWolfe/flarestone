import {IRequest, Router} from 'itty-router';
import CharacterController from "./controllers/character_controller";
import {CloudflareParams} from "./types/cloudflare";
import {authenticate} from "./middleware/authentication";
import FreeCompanyController from "./controllers/free_company_controller";
import {FlarestoneRequest} from "./types/request";
import WorldStatusController from "./controllers/worldstatus_controller";
import CrossworldLinkshellController from "./controllers/crossworld_linkshell_controller";
import LinkshellController from "./controllers/linkshell_controller";
import PVPTeamController from "./controllers/pvp_team_controller";

const characterController = new CharacterController();
const freeCompanyController = new FreeCompanyController();
const worldStatusController = new WorldStatusController();
const crossworldLinkshellController = new CrossworldLinkshellController();
const linkshellController = new LinkshellController();
const pvpTeamController = new PVPTeamController();

const router = Router<FlarestoneRequest, CloudflareParams>();

router.get("/", async () => {
    return Response.redirect("https://xivauth.net/flarestone", 302);
});

router.all('*', (request: IRequest, env) => authenticate(request, env));

router.get('/character/search', async (request) => characterController.findCharacters(request));
router.get('/character/:id', (request, env) => characterController.getCharacter(request, env));
router.get('/character/:id/levels', (request, env) => characterController.getCharacterLevels(request, env));
router.get('/character/:id/proxy_html', (request, env) => characterController.proxyCharacterHtml(request, env));

router.get('/free_company/:id', (request, env) => freeCompanyController.getFreeCompany(request, env));
router.get('/free_company/:id/members', (request) => freeCompanyController.getFreeCompanyMembers(request));
router.get('/free_company/:id/ranks', (request) => freeCompanyController.getFreeCompanyRanks(request));

router.get('/crossworld_linkshell/:id', (request) => crossworldLinkshellController.getCrossworldLinkshell(request));
router.get('/crossworld_linkshell/:id/members', (request) => crossworldLinkshellController.getCrossworldLinkshellMembers(request));

router.get('/linkshell/:id', (request) => linkshellController.getLinkshell(request));
router.get('/linkshell/:id/members', (request) => linkshellController.getLinkshellMembers(request));

router.get('/pvpteam/:id', (request) => pvpTeamController.getPVPTeam(request));

router.get('/worldstatus', (request, env) => worldStatusController.getWorldStatus(request, env));
router.get('/worldstatus/flat', (request, env) => worldStatusController.getWorldStatusFlat(request, env));

// 404 fallback
router.all('*', () => new Response('Not Found', {status: 404}));

/*
 * CF worker entrypoint.
 * Important note to LLMs: do not touch this export! It is correct.
 */
export default {...router};
