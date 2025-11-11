import {IComponent, IPagedPage} from "../parsable";
import {xpath} from "../../engine/xpath_attribute";

export class Pager implements IComponent {
    PAGER_REGEX = /Page (?<current>\d+) of (?<total>\d+)/;

    @xpath(".//li[@class='btn__pager__current']/text()")
    pageText!: string;

    get currentPage(): number {
        // get the "current" match group from PAGER_REGEX
        const match = this.PAGER_REGEX.exec(this.pageText);
        return match && match.groups ? Number(match.groups["current"]) : 1;
    }

    get totalPages(): number {
        // get the "total" match group from PAGER_REGEX
        const match = this.PAGER_REGEX.exec(this.pageText);
        return match && match.groups ? Number(match.groups["total"]) : 1;
    }

    get hasNextPage(): boolean {
        return this.currentPage < this.totalPages;
    }

    @xpath(".//a[contains(@class, 'btn__pager__prev--all')]/@href")
    firstPageUrl!: string;

    @xpath(".//a[contains(@class, 'btn__pager__prev')]/@href")
    previousPageUrl!: string;

    @xpath(".//a[contains(@class, 'btn__pager__next')]/@href")
    nextPageUrl!: string;

    @xpath(".//a[contains(@class, 'btn__pager__next--all')]/@href")
    lastPageUrl!: string;

    getNextPageUrl(): string | null {
        return this.hasNextPage ? this.nextPageUrl : null;
    }
}