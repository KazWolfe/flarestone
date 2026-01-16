import {IPagedPage} from "../../parsable";
import {Pager} from "../../_common/pager";
import {xpath} from "../../../engine/xpath_attribute";
import {LinkshellMemberEntry} from "./components/member_entry";

export class LinkshellMembers implements IPagedPage {
    @xpath("//div[@class='ls__member']/div[@class='entry']", {type: () => LinkshellMemberEntry, many: true})
    members!: LinkshellMemberEntry[];

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

