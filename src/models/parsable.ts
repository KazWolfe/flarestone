import {MatchedElement} from "../engine/xpath_node";

/**
 * A marker interface for classes that are a top level page.
 */
export interface IPage {

}

export interface IPagedPage extends IPage {
    getNextPageUrl(): string | null;
    getCurrentPage(): number;
    getTotalPages(): number;
}

/**
 * A marker interface for classes that represent an element (or component) within a page.
 */
export interface IComponent {

}