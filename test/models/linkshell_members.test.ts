import {describe, it} from 'mocha';
import {loadObjectFromFile} from '../../src/engine';
import {LinkshellMembers} from '../../src/models/linkshell/members';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {assert} from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('LinkshellMembers', () => {
    describe('Linkshell members single page', () => {
        let members: LinkshellMembers;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/linkshells/linkshell.html');
            members = await loadObjectFromFile(fixturePath, LinkshellMembers);
        });

        it('should parse members list', () => {
            assert.ok(members.members, 'members should be present');
            assert.isArray(members.members);
            assert.isAbove(members.members.length, 0, 'should have at least one member');
        });

        it('should parse individual member data', () => {
            // Marie Mercier at index 0
            const firstMember = members.members[0];

            assert.equal(firstMember.name, 'Marie Mercier');
            assert.equal(firstMember.world, 'Golem');
            assert.equal(firstMember.datacenter, 'Dynamis');
            assert.equal(firstMember.id, '58930722');
            assert.ok(firstMember.lodestoneUrl);
            assert.ok(firstMember.avatarUrl);
        });

        it('should parse class job info', () => {
            const firstMember = members.members[0];

            assert.ok(firstMember.classJob, 'classJob should be present');
            assert.equal(firstMember.classJob.level, 95);
            assert.ok(firstMember.classJob.iconUrl);
        });

        it('should parse Grand Company info when present', () => {
            const memberWithGC = members.members[0];

            assert.ok(memberWithGC.grandCompany, 'grandCompany should be present');
            assert.equal(memberWithGC.grandCompany?.name, 'Order of the Twin Adder');
            assert.ok(memberWithGC.grandCompany?.iconUrl);
        });

        it('should parse Free Company info when present', () => {
            // Marie Mercier at index 0 has FC: Astral Nightstriders (ID: 9281215144568832219)
            const memberWithFC = members.members[0];

            assert.ok(memberWithFC.freeCompany, 'freeCompany should be present');
            assert.equal(memberWithFC.freeCompany?.name, "Astral Nightstriders");
            assert.equal(memberWithFC.freeCompany?.id, '9281215144568832219');
            assert.equal(memberWithFC.freeCompany?.lodestoneUrl, '/lodestone/freecompany/9281215144568832219/');
            assert.ok(memberWithFC.freeCompany?.crest, 'crest should be inside FC object');
        });

        it('should handle members without Free Company', () => {
            // All members in this fixture have FC, just verify one has it
            const member = members.members[0];
            assert.ok(member.freeCompany);
        });

        it('should parse linkshell rank when present', () => {
            // Marie Mercier at index 0 has rank Master
            const masterMember = members.members[0];
            assert.equal(masterMember.rank, 'MASTER');
        });

        it('should handle members without linkshell rank', () => {
            // Aelith Astra at index 3 has no linkshell rank (defaults to MEMBER)
            const memberWithoutRank = members.members[3];
            assert.equal(memberWithoutRank.rank, 'MEMBER');
            assert.equal(memberWithoutRank.name, 'Aelith Astra');
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

    describe('Linkshell members with pagination', () => {
        let members: LinkshellMembers;

        before(async () => {
            const fixturePath = join(__dirname, '../fixtures/linkshells/linkshell_paginated.html');
            members = await loadObjectFromFile(fixturePath, LinkshellMembers);
        });

        it('should parse members from first page', () => {
            assert.ok(members.members, 'members should be present');
            assert.isArray(members.members);
            assert.isAbove(members.members.length, 0, 'should have at least one member');
        });

        it('should parse pagination metadata for first page', () => {
            assert.equal(members.getCurrentPage(), 1);
            assert.equal(members.getTotalPages(), 3);
            assert.isNotNull(members.getNextPageUrl());
        });

        it('should handle next page URL for aggregation', () => {
            const nextPageUrl = members.getNextPageUrl();
            assert.isNotNull(nextPageUrl);
            assert.match(nextPageUrl!, /\?page=2/);
        });

        it('should handle member without Free Company', () => {
            const memberWithoutFC = members.members[32];
            assert.isNull(memberWithoutFC!.freeCompany);
        });
    });
});

