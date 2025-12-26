import {describe, it} from 'mocha';
import {loadObjectFromFile} from '../../src/engine';
import {WorldStatusPage} from '../../src/models/worldstatus';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {assert} from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('WorldStatusPage', () => {
    let worldStatusPage: WorldStatusPage;

    before(async () => {
        const fixturePath = join(__dirname, '../fixtures/worldstatus/worldstatus.html');
        worldStatusPage = await loadObjectFromFile(fixturePath, WorldStatusPage);
    });

    it('should parse all physical data centers', () => {
        assert.ok(worldStatusPage.regions, 'regions should be present');
        assert.isArray(worldStatusPage.regions, 'regions should be an array');
        assert.equal(worldStatusPage.regions.length, 4, 'should have 4 regions');
    });

    describe('Physical Data Centers / Regions', () => {
        it('should extract a region', () => {
            const region = worldStatusPage.regions[0];

            assert.ok(region, 'PDC/Region should exist.');
            assert.equal(region.id, 2);
            assert.equal(region.name, 'North America');
        });
    });

    describe('Logical Data Centers', () => {
        it('should extract datacenters from a region', () => {
            const northAmerica = worldStatusPage.regions.find(r => r.id === 2);
            assert.ok(northAmerica, 'North America region should be present');
            assert.ok(northAmerica.dataCenters, 'dataCenters should be present');
            assert.isArray(northAmerica.dataCenters, 'dataCenters should be an array');
            assert.equal(northAmerica.dataCenters.length, 4, 'North America should have 4 data centers');

            const dcNames = northAmerica.dataCenters.map(dc => dc.name);
            assert.includeMembers(dcNames, ['Aether', 'Crystal', 'Dynamis', 'Primal']);
        });
    });

    describe('Worlds', () => {
        it('should extract worlds from a DC', () => {
            const northAmerica = worldStatusPage.regions.find(r => r.id === 2);
            const aether = northAmerica?.dataCenters.find(dc => dc.name === 'Aether');

            assert.ok(aether, 'Aether data center should be present');
            assert.ok(aether.worlds, 'worlds should be present');
            assert.isArray(aether.worlds, 'worlds should be an array');
            assert.equal(aether.worlds.length, 8, 'Aether should have 8 worlds');

            const worldNames = aether.worlds.map(w => w.name);
            assert.includeMembers(worldNames, ['Adamantoise', 'Cactuar', 'Faerie', 'Gilgamesh']);
        });

        it('should get world data', () => {
            const northAmerica = worldStatusPage.regions.find(r => r.id === 2);
            const aether = northAmerica?.dataCenters.find(dc => dc.name === 'Aether');
            const adamantoise = aether?.worlds.find(w => w.name === 'Adamantoise');

            assert.ok(adamantoise, 'Adamantoise world should be present');
            assert.equal(adamantoise.status, 'Online');
            assert.equal(adamantoise.category, 'Congested');
            assert.isFalse(adamantoise.creationOpen, 'Adamantoise should not allow character creation');
        });

        it("should parse worlds that don't support creation", () => {
            const northAmerica = worldStatusPage.regions.find(r => r.id === 2);
            const primal = northAmerica?.dataCenters.find(dc => dc.name === 'Primal');
            const ultros = primal?.worlds.find(w => w.name === 'Ultros');

            assert.ok(ultros, 'Ultros world should be present');
            assert.equal(ultros?.creationOpen, true, 'Ultros should allow character creation');
        });
    });

    describe('Data structure', () => {
        it('should have proper nesting of regions -> data centers -> worlds', () => {
            const northAmerica = worldStatusPage.regions.find(r => r.id === 2);
            assert.ok(northAmerica, 'North America should exist');
            assert.ok(northAmerica.dataCenters, 'North America should have data centers');
            assert.isAtLeast(northAmerica.dataCenters.length, 1, 'North America should have at least one data center');

            const firstDC = northAmerica.dataCenters[0];
            assert.ok(firstDC.name, 'Data center should have a name');
            assert.ok(firstDC.worlds, 'Data center should have worlds');
            assert.isAtLeast(firstDC.worlds.length, 1, 'Data center should have at least one world');

            const firstWorld = firstDC.worlds[0];
            assert.ok(firstWorld.name, 'World should have a name');
            assert.ok(firstWorld.status, 'World should have a status');
        });

        it('should have all worlds with valid properties', () => {
            worldStatusPage.regions.forEach(region => {
                region.dataCenters.forEach(dc => {
                    dc.worlds.forEach(world => {
                        assert.ok(world.name, `World should have a name in ${dc.name}`);
                        assert.ok(world.status, `World ${world.name} should have a status`);
                        assert.typeOf(world.creationOpen, 'boolean', `World ${world.name} should have boolean creationOpen or null`);
                    });
                });
            });
        });
    });
});

