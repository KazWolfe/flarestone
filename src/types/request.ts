import {IRequestStrict} from "itty-router";
import {ApiUser} from "./auth";

export type FlarestoneRequest = IRequestStrict & {
    user?: ApiUser;
}