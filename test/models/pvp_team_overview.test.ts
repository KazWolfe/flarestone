import {describe, it} from 'mocha';
import {loadObjectFromFile} from '../../src/engine';
import {PVPTeamOverview} from '../../src/models/pvp_team';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {assert} from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('PVPTeamOverview', () => {
    let pvpTeam: PVPTeamOverview;

    before(async () => {
        const fixturePath = join(__dirname, '../fixtures/pvp_teams/pvp_team.html');
        pvpTeam = await loadObjectFromFile(fixturePath, PVPTeamOverview);
    });

    it('should parse the PVP team name', () => {
        assert.ok(pvpTeam.name, 'name should be present');
        assert.equal(pvpTeam.name, 'lizard.');
    });

    it('should parse the datacenter', () => {
        assert.ok(pvpTeam.datacenter, 'datacenter should be present');
        assert.equal(pvpTeam.datacenter, 'Crystal');
    });

    it('should parse the formed date', () => {
        assert.ok(pvpTeam.formed, 'formed should be present');
        assert.instanceOf(pvpTeam.formed, Date);
    });

    it('should parse crest information', () => {
        assert.ok(pvpTeam.crest, 'crest should be present');
        assert.ok(pvpTeam.crest.background, 'crest background should be present');
        assert.ok(pvpTeam.crest.frame, 'crest frame should be present');
        assert.ok(pvpTeam.crest.symbol, 'crest symbol should be present');
        assert.match(pvpTeam.crest.background, /\.png/);
        assert.match(pvpTeam.crest.frame, /\.png/);
        assert.match(pvpTeam.crest.symbol, /\.png/);
    });

    it('should parse members list', () => {
        assert.ok(pvpTeam.members, 'members should be present');
        assert.isArray(pvpTeam.members);
        assert.isAbove(pvpTeam.members.length, 0);
    });

    it('should have all members with name and id', () => {
        pvpTeam.members.forEach(member => {
            assert.ok(member.name, `member should have name: ${member.name}`);
            assert.ok(member.id, `member should have id`);
            assert.ok(member.lodestoneUrl, `member should have lodestoneUrl`);
        });
    });

    it('should have matches field for members', () => {
        pvpTeam.members.forEach(member => {
            assert.ok(member.matches !== undefined, `member ${member.name} should have matches`);
            assert.isNumber(member.matches, `matches should be numeric for ${member.name}`);
        });
    });

    it('should extract rank from members', () => {
        pvpTeam.members.forEach(member => {
            assert.oneOf(member.rank, ['LEADER', 'SUBLEADER', 'MEMBER']);
        });
    });

    it('should have classJob info for members', () => {
        pvpTeam.members.forEach(member => {
            assert.ok(member.classJob, `member ${member.name} should have classJob`);
            assert.isNumber(member.classJob.level, `classJob level should be numeric`);
            assert.ok(member.classJob.iconUrl, `classJob iconUrl should be present`);
        });
    });

    it('should have grandCompany info for members', () => {
        pvpTeam.members.forEach(member => {
            assert.ok(member.grandCompany, `member ${member.name} should have grandCompany`);
            assert.ok(member.grandCompany.name, `GC name should be present`);
            assert.ok(member.grandCompany.iconUrl, `GC iconUrl should be present`);
        });
    });

    it('should have at least one leader', () => {
        const leaders = pvpTeam.members.filter(m => m.rank === 'LEADER');
        assert.isAbove(leaders.length, 0, 'should have at least one leader');
    });

    it('should parse owner (Leader)', () => {
        assert.ok(pvpTeam.owner, 'owner should be present');
        assert.ok(pvpTeam.owner!.id, 'owner should have id');
        assert.ok(pvpTeam.owner!.name, 'owner should have name');
        assert.ok(pvpTeam.owner!.lodestoneUrl, 'owner should have lodestoneUrl');
    });
});
