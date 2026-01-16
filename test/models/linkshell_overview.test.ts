import {describe, it} from 'mocha';
import {loadObjectFromFile} from '../../src/engine';
import {LinkshellOverview} from '../../src/models/linkshell/overview';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {assert} from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('LinkshellOverview', () => {
    describe('Linkshell without Community Finder recruitment', () => {
        let linkshell: LinkshellOverview;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/linkshells/linkshell.html');
            linkshell = await loadObjectFromFile(fixturePath, LinkshellOverview);
        });

        it('should parse the linkshell name', () => {
            assert.ok(linkshell.name, 'name should be present');
            assert.equal(linkshell.name, 'Astral Nightstriders');
        });

        it('should parse the icon URL', () => {
            assert.ok(linkshell.iconUrl, 'iconUrl should be present');
            assert.match(linkshell.iconUrl, /https:\/\/lds-img\.finalfantasyxiv\.com\/.*\.png/);
        });

        it('should parse world from first member', () => {
            assert.ok(linkshell.world, 'world should be present');
            assert.equal(linkshell.world, 'Golem');
        });

        it('should parse datacenter from first member', () => {
            assert.ok(linkshell.datacenter, 'datacenter should be present');
            assert.equal(linkshell.datacenter, 'Dynamis');
        });

        it('should indicate no Community Finder recruitment', () => {
            assert.isNull(linkshell.communityFinderUrl);
        });
    });

    describe('Linkshell with Community Finder recruitment', () => {
        let linkshell: LinkshellOverview;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/linkshells/linkshell_recruiting.html');
            linkshell = await loadObjectFromFile(fixturePath, LinkshellOverview);
        });

        it('should parse the linkshell name', () => {
            assert.ok(linkshell.name, 'name should be present');
            assert.equal(linkshell.name, 'Nice Neighbor Nexus');
        });

        it('should parse world from first member', () => {
            assert.ok(linkshell.world, 'world should be present');
            assert.equal(linkshell.world, 'Ultima');
        });

        it('should parse datacenter from first member', () => {
            assert.ok(linkshell.datacenter, 'datacenter should be present');
            assert.equal(linkshell.datacenter, 'Gaia');
        });

        it('should have a Community Finder URL', () => {
            assert.isNotNull(linkshell.communityFinderUrl);
            assert.match(linkshell.communityFinderUrl!, /\/lodestone\/community_finder\//);
        });
    });
});

