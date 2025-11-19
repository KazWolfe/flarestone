import {describe, it} from 'mocha';
import {loadObjectFromFile} from '../../src/engine';
import {CharacterPage} from '../../src/models/character/overview';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {assert} from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CharacterPage', () => {
    describe('A fully-formed character', () => {
        let characterPage: CharacterPage;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/characters/43809410.html');
            characterPage = await loadObjectFromFile(fixturePath, CharacterPage);
        });

        it('should parse the character name', () => {
            assert.ok(characterPage.name, 'name should be present');
            assert.equal(characterPage.name, 'Abe Eon');
        });

        it('should parse the character title', () => {
            assert.ok(characterPage.title, 'title should be present');
            assert.equal(characterPage.title, 'King Bean');
        });

        it('should parse the world info', () => {
            assert.equal(characterPage.world, 'Lamia');
            assert.equal(characterPage.datacenter, 'Primal');
        });

        it('should parse the headshot URL', () => {
            assert.ok(characterPage.headshotUrl, 'headshotUrl should be present');
            assert.match(characterPage.headshotUrl, /https:\/\/img2\.finalfantasyxiv\.com\/f\/[0-9a-f_]+fc0\.jpg/);
        });

        it('should parse the portrait URL', () => {
            assert.ok(characterPage.portraitUrl, 'portraitUrl should be present');
            assert.match(characterPage.portraitUrl, /https:\/\/img2\.finalfantasyxiv\.com\/f\/[0-9a-f_]+fl0\.jpg/);
        });

        it('should parse Grand Company information', () => {
            assert.ok(characterPage.grandCompany, 'grandCompany should be present');

            assert.equal(characterPage.grandCompany?.name, 'Immortal Flames');
            assert.equal(characterPage.grandCompany?.rank, 'Flame Captain');
            assert.match(characterPage.grandCompany?.iconUrl, /https:\/\/lds-img\.finalfantasyxiv\.com\/.*\.png/);
        });

        it('should parse Free Company information', () => {
            assert.ok(characterPage.freeCompany, 'freeCompany should be present');

            assert.equal(characterPage.freeCompany?.name, 'Friendly Fire');
            assert.equal(characterPage.freeCompany?.id, '9231112598714485863');
        });

        it('should extract level information', () => {
            assert.ok(characterPage.levels, 'levels should be present');
            assert.typeOf(characterPage.levels, 'object');

            Object.entries(characterPage.levels).forEach(([key, value]) => {
                assert.typeOf(key, 'string');
                assert.typeOf(value.level, 'number');
            })
        });

        it('should not include zero-level classes in levels', () => {
            // data capture has AST and SGE at 0.
            assert.doesNotHaveAnyKeys(characterPage.levels, ["ASTROLOGIAN", "SAGE"]);
            assert.containsAllKeys(characterPage.levels, ["WHITE_MAGE", "SCHOLAR"]);
        });
    });

    describe('A character with a private profile', () => {
        let characterPage: CharacterPage;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/characters/private_profile.html');
            characterPage = await loadObjectFromFile(fixturePath, CharacterPage);
        });

        it('should parse the character name', () => {
            assert.ok(characterPage.name, 'name should be present');
            assert.equal(characterPage.name, 'Alaynabella Blossom');
        });

        it('should parse the world info', () => {
            assert.equal(characterPage.world, 'Zalera');
            assert.equal(characterPage.datacenter, 'Crystal');
        });

        it('should parse the headshot URL', () => {
            assert.ok(characterPage.headshotUrl, 'headshotUrl should be present');
            assert.match(characterPage.headshotUrl, /https:\/\/img2\.finalfantasyxiv\.com\/f\/[0-9a-f_]+fc0\.jpg/);
        });

        it('should not have a bio', () => {
            assert.equal(characterPage.bio, undefined);
        });
    })
});

