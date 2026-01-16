import {describe, it} from 'mocha';
import {loadObjectFromFile} from '../../src/engine';
import {CrossworldLinkshellOverview} from '../../src/models/crossworld_linkshell/overview';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {assert} from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CrossworldLinkshellOverview', () => {
    describe('CWLS without Community Finder recruitment', () => {
        let cwls: CrossworldLinkshellOverview;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/crossworld_linkshells/cwls.html');
            cwls = await loadObjectFromFile(fixturePath, CrossworldLinkshellOverview);
        });

        it('should parse the CWLS name', () => {
            assert.ok(cwls.name, 'name should be present');
            assert.equal(cwls.name, 'Fae Hollow');
        });

        it('should parse the datacenter', () => {
            assert.ok(cwls.datacenter, 'datacenter should be present');
            assert.equal(cwls.datacenter, 'Crystal');
        });


        it('should parse the formed date', () => {
            assert.ok(cwls.formed, 'formed should be present');
            assert.instanceOf(cwls.formed, Date);
            // 1768498093 = December 14, 2026
            assert.equal(cwls.formed?.getUTCFullYear(), 2026);
        });

        it('should parse the owner (Master)', () => {
            assert.ok(cwls.owner, 'owner should be present');
            assert.ok(cwls.owner!.id, 'owner id should be present');
            assert.ok(cwls.owner!.name, 'owner name should be present');
            assert.ok(cwls.owner!.lodestoneUrl, 'owner lodestoneUrl should be present');
            assert.match(cwls.owner!.lodestoneUrl, /\/lodestone\/character\/\d+\//);
        });

        it('should indicate no Community Finder recruitment', () => {
            assert.isNull(cwls.communityFinderUrl);
        });
    });

    describe('CWLS with Community Finder recruitment', () => {
        let cwls: CrossworldLinkshellOverview;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/crossworld_linkshells/cwls_recruiting.html');
            cwls = await loadObjectFromFile(fixturePath, CrossworldLinkshellOverview);
        });

        it('should parse the CWLS name', () => {
            assert.ok(cwls.name, 'name should be present');
        });

        it('should have a Community Finder URL', () => {
            assert.isNotNull(cwls.communityFinderUrl);
            assert.match(cwls.communityFinderUrl!, /\/lodestone\/community_finder\//);
        });
    });

    describe('CWLS last page (no owner)', () => {
        // Note: this will never be hit in normal usage, since we aren't ever fetching anything but the first page for
        // overview. This is just to test the parsing behavior.

        let cwls: CrossworldLinkshellOverview;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/crossworld_linkshells/cwls_paged_last.html');
            cwls = await loadObjectFromFile(fixturePath, CrossworldLinkshellOverview);
        });

        it('should parse the CWLS name', () => {
            assert.ok(cwls.name, 'name should be present');
        });

        it('should return undefined for owner when no Master rank exists', () => {
            assert.isUndefined(cwls.owner);
        });
    });
});

