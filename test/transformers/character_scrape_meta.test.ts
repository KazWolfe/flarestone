import {describe, it} from 'mocha';
import {
    loadCharacterPageWithMeta,
    CharacterScrapeResult,
    detectCharacterAvailability
} from '../../src/transformers/character_scrape_meta';
import {CharacterPage} from '../../src/models/character/overview';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {readFile} from 'fs/promises';
import {assert} from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Helper function to create a mock Response object
 */
function createMockResponse(body: string, statusCode: number): Response {
    return new Response(body, {
        status: statusCode,
        statusText: statusCode === 403 ? 'Forbidden' : statusCode === 404 ? 'Not Found' : 'OK',
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    });
}

describe('Character Scrape Meta', () => {
    describe('detectCharacterAvailability', () => {
        it('should detect 403 as CHARACTER_HIDDEN', () => {
            const meta = detectCharacterAvailability('<html></html>', 403);
            assert.equal(meta.resultCode, CharacterScrapeResult.CHARACTER_HIDDEN);
            assert.equal(meta.upstreamStatusCode, 403);
        });

        it('should detect 404 as NOT_FOUND', () => {
            const meta = detectCharacterAvailability('<html></html>', 404);
            assert.equal(meta.resultCode, CharacterScrapeResult.NOT_FOUND);
            assert.equal(meta.upstreamStatusCode, 404);
        });

        it('should detect private profile message as PROFILE_PRIVATE', () => {
            const html = '<html><body>This character\'s profile is private</body></html>';
            const meta = detectCharacterAvailability(html, 200);
            assert.equal(meta.resultCode, CharacterScrapeResult.PROFILE_PRIVATE);
            assert.equal(meta.upstreamStatusCode, 200);
        });

        it('should detect successful page as SUCCESS', () => {
            const meta = detectCharacterAvailability('<html></html>', 200);
            assert.equal(meta.resultCode, CharacterScrapeResult.SUCCESS);
            assert.equal(meta.upstreamStatusCode, 200);
        });
    });

    describe('loadCharacterPageWithMeta', () => {
        it('should handle 403 response with CHARACTER_HIDDEN result', async () => {
            const fixturePath = join(__dirname, '../fixtures/characters/private_profile.html');
            const html = await readFile(fixturePath, 'utf-8');

            const mockResponse = createMockResponse(html, 403);
            const result = await loadCharacterPageWithMeta(mockResponse, CharacterPage);

            assert.equal(result.responseStatusCode, 403, 'responseStatusCode should be 403');
            assert.equal(result.scrapeMeta.resultCode, CharacterScrapeResult.CHARACTER_HIDDEN, 'resultCode should be CHARACTER_HIDDEN');
            assert.equal(result.scrapeMeta.upstreamStatusCode, 403, 'upstreamStatusCode should be 403');
        });

        it('should handle 404 response with NOT_FOUND result', async () => {
            const html = '<html><body>404 Not Found</body></html>';
            const mockResponse = createMockResponse(html, 404);
            const result = await loadCharacterPageWithMeta(mockResponse, CharacterPage);

            assert.equal(result.responseStatusCode, 404);
            assert.equal(result.scrapeMeta.resultCode, CharacterScrapeResult.NOT_FOUND);
            assert.equal(result.scrapeMeta.upstreamStatusCode, 404);
        });

        it('should handle private profile with PROFILE_PRIVATE result', async () => {
            const fixturePath = join(__dirname, '../fixtures/characters/private_profile.html');
            const html = await readFile(fixturePath, 'utf-8');

            const mockResponse = createMockResponse(html, 200);
            const result = await loadCharacterPageWithMeta(mockResponse, CharacterPage);

            assert.equal(result.responseStatusCode, 200);
            assert.equal(result.scrapeMeta.resultCode, CharacterScrapeResult.PROFILE_PRIVATE);
            assert.equal(result.scrapeMeta.upstreamStatusCode, 200);

            // We still need to capture name and other data, so let's make sure that exists.
            assert.ok(result.data, 'data should be present');
            if (result.data) {
                assert.equal(result.data.name, 'Alaynabella Blossom');

                assert.equal(result.data.world, 'Zalera');
                assert.equal(result.data.datacenter, 'Crystal')

                assert.match(result.data.headshotUrl, /https:\/\/img2\.finalfantasyxiv\.com\/f\/[0-9a-f_]+fc0\.jpg/)
            }
        });

        it('should handle successful character page', async () => {
            const fixturePath = join(__dirname, '../fixtures/characters/43809410.html');
            const html = await readFile(fixturePath, 'utf-8');

            const mockResponse = createMockResponse(html, 200);
            const result = await loadCharacterPageWithMeta(mockResponse, CharacterPage);

            assert.equal(result.responseStatusCode, 200);
            assert.equal(result.scrapeMeta.resultCode, CharacterScrapeResult.SUCCESS);
            assert.ok(result.data, 'data should be present');

            if (result.data) {
                assert.equal(result.data.name, 'Abe Eon');
            }
        });
    });
});

