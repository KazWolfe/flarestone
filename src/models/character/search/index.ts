import {IComponent, IPagedPage} from "../../parsable";
import {xpath} from "../../../engine/xpath_attribute";
import {Pager} from "../../_common/pager";
import {SearchResult} from "./components/search_result";

export class CharacterSearchPage implements IPagedPage {
    @xpath("//div[@class='entry']", {type: () => SearchResult, many: true})
    results!: SearchResult[];

    /* Pagination API */
    @xpath("//ul[@class='btn__pager']")
    _pager!: Pager;

    getCurrentPage(): number {
        return this._pager.currentPage;
    }

    getNextPageUrl(): string | null {
        return this._pager.getNextPageUrl();
    }

    getTotalPages(): number {
        return this._pager.totalPages;
    }

    get pagination() {
        return {
            currentPage: this.getCurrentPage(),
            totalPages: this.getTotalPages(),
            nextPageUrl: this.getNextPageUrl()
        }
    }
}