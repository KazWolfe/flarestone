import {describe, it} from 'mocha';
import {loadObjectFromFile} from '../../src/engine';
import {WorldStatusPage} from '../../src/models/worldstatus';
import {flattenWorldStatus, FlattenedWorldStatus} from '../../src/transformers/worldstatus_flattener';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {assert} from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('WorldStatus Flattener', () => {
    let worldStatusPage: WorldStatusPage;
    let flattenedData: FlattenedWorldStatus[];

    before(async () => {
        const fixturePath = join(__dirname, '../fixtures/worldstatus/worldstatus.html');
        worldStatusPage = await loadObjectFromFile(fixturePath, WorldStatusPage);
        flattenedData = flattenWorldStatus(worldStatusPage.regions);
    });

    describe('Basic flattening', () => {
        it('should flatten the nested structure into an array', () => {
            assert.ok(flattenedData, 'flattened data should exist');
            assert.isArray(flattenedData, 'flattened data should be an array');
        });

        it('should have one entry per world', () => {
            // Count total worlds from nested structure
            let totalWorlds = 0;
            worldStatusPage.regions.forEach(region => {
                region.dataCenters.forEach(dc => {
                    totalWorlds += dc.worlds.length;
                });
            });

            assert.equal(flattenedData.length, totalWorlds, 'should have one entry per world');
        });

        it('should preserve all world properties', () => {
            const entry = flattenedData[0];
            assert.ok(entry.name, 'should have world name');
            assert.ok(entry.status, 'should have world status');
            assert.ok(entry.dataCenter, 'should have data center name');
            assert.ok(entry.region, 'should have region info');
            assert.typeOf(entry.creationOpen, 'boolean', 'should have creationOpen as boolean');
        });

        it('should have valid region info in each entry', () => {
            flattenedData.forEach(entry => {
                assert.typeOf(entry.region.id, 'number', 'region id should be a number');
                assert.typeOf(entry.region.name, 'string', 'region name should be a string');
                assert.isAtLeast(entry.region.id, 1, 'region id should be >= 1');
            });
        });
    });
});

