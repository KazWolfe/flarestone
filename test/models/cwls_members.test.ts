import {describe, it} from 'mocha';
import {loadObjectFromFile} from '../../src/engine';
import {CrossworldLinkshellMembers} from '../../src/models/crossworld_linkshell/members';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {assert} from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CrossworldLinkshellMembers', () => {
    describe('CWLS members single page', () => {
        let members: CrossworldLinkshellMembers;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/crossworld_linkshells/cwls.html');
            members = await loadObjectFromFile(fixturePath, CrossworldLinkshellMembers);
        });

        it('should parse members list', () => {
            assert.ok(members.members, 'members should be present');
            assert.isArray(members.members);
            assert.isAbove(members.members.length, 0);
            assert.equal(members.members.length, 13);
        });

        it('should parse individual member data', () => {
            const firstMember = members.members[0];

            assert.equal(firstMember.name, 'Mahvash Sunspell');
            assert.equal(firstMember.world, 'Balmung');
            assert.equal(firstMember.datacenter, 'Crystal');
            assert.equal(firstMember.id, '22846522');
            assert.ok(firstMember.lodestoneUrl);
            assert.ok(firstMember.avatarUrl);
        });

        it('should parse class job info', () => {
            const firstMember = members.members[0];

            assert.ok(firstMember.classJob, 'classJob should be present');
            assert.equal(firstMember.classJob.level, 70);
            assert.ok(firstMember.classJob.iconUrl);
        });

        it('should parse Grand Company info when present', () => {
            const memberWithGC = members.members[0];

            assert.ok(memberWithGC.grandCompany, 'grandCompany should be present');
            assert.equal(memberWithGC.grandCompany?.name, 'Immortal Flames');
            assert.ok(memberWithGC.grandCompany?.iconUrl);
        });

        it('should parse Free Company info when present', () => {
            // Bojin Bellerose at index 1 has FC: Nhaama's Embrace (ID: 9236179148295239677)
            const memberWithFC = members.members[1];

            assert.ok(memberWithFC.freeCompany, 'freeCompany should be present');
            assert.equal(memberWithFC.freeCompany?.name, "Nhaama's Embrace");
            assert.equal(memberWithFC.freeCompany?.id, '9236179148295239677');
            assert.equal(memberWithFC.freeCompany?.lodestoneUrl, '/lodestone/freecompany/9236179148295239677/');
            assert.ok(memberWithFC.freeCompany?.crest, 'crest should be inside FC object');
        });

        it('should handle members without Free Company', () => {
            // Khuraana Songoson at index 3 has no FC
            const memberWithoutFC = members.members[3];
            assert.isNull(memberWithoutFC.freeCompany);
        });

        it('should parse linkshell rank when present', () => {
            const masterMember = members.members[0];
            assert.equal(masterMember.rank, 'MASTER');
        });

        it('should handle members without linkshell rank', () => {
            const memberWithoutRank = members.members[11];
            assert.equal(memberWithoutRank.rank, 'MEMBER');
        });

        it('should parse pagination metadata', () => {
            assert.equal(members.getCurrentPage(), 1);
            assert.equal(members.getTotalPages(), 1);
            assert.isNull(members.getNextPageUrl());
        });

        it('should have pagination object', () => {
            const pagination = members.pagination;

            assert.equal(pagination.currentPage, 1);
            assert.equal(pagination.totalPages, 1);
            assert.isNull(pagination.nextPageUrl);
        });
    });

    describe('CWLS members with pagination', () => {
        let members: CrossworldLinkshellMembers;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/crossworld_linkshells/cwls_paged.html');
            members = await loadObjectFromFile(fixturePath, CrossworldLinkshellMembers);
        });

        it('should parse members from first page', () => {
            assert.ok(members.members, 'members should be present');
            assert.isArray(members.members);
            assert.isAbove(members.members.length, 0);
        });

        it('should parse pagination metadata for first page', () => {
            assert.equal(members.getCurrentPage(), 1);
            assert.equal(members.getTotalPages(), 2);
            assert.ok(members.getNextPageUrl());
            assert.match(members.getNextPageUrl()!, /page=2/);
        });

        it('should handle next page URL for aggregation', () => {
            const nextUrl = members.getNextPageUrl();
            assert.ok(nextUrl);
            assert.isTrue(nextUrl.startsWith('https://na.finalfantasyxiv.com/lodestone/crossworld_linkshell/'));
        });
    });
});

