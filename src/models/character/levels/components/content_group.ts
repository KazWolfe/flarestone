import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {FieldOperationLevel} from "./field_operations/content_level";
import {OccultCrescentLevel} from "./field_operations/occult_crescent";
import {serializerProperty} from "../../../../engine/serializer";


export class ContentGroup implements IComponent {
    @serializerProperty({ key: "EUREKA" })
    @xpath("//div[@class='character__job__list' and preceding-sibling::h3[text()='The Forbidden Land, Eureka']]")
    eureka!: FieldOperationLevel;

    @serializerProperty({ key: "BOZJA" })
    @xpath("//div[@class='character__job__list' and preceding-sibling::h3[text()='Bozjan Southern Front']]")
    bozja!: FieldOperationLevel;

    @serializerProperty({ key: "OCCULT_CRESCENT" })
    @xpath("//div[@class='character__job__list' and preceding-sibling::h3[text()='Occult Crescent']]")
    occultCrescent!: OccultCrescentLevel;
}