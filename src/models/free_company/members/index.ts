import {IPagedPage} from "../../parsable";
import {Pager} from "../../_common/pager";
import {xpath} from "../../../engine/xpath_attribute";
import {MemberEntry} from "./components/member_entry";

export class FreeCompanyMembers implements IPagedPage {
    @xpath("//div[@class='ldst__window']/ul[not(@class)]/li[@class='entry']", {type: () => MemberEntry, many: true})
    members!: MemberEntry[];

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