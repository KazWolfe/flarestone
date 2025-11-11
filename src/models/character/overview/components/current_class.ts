import {IComponent} from "../../../parsable";
import {xpath} from "../../../../engine/xpath_attribute";
import {transform} from "../../../../engine";
import classjob_icons from "../../../../data/classjob_icons.json" with { type: "json" };

export class CurrentClass implements IComponent {
    @xpath("./p/text()", { type: () => String })
    @transform({ extractRegex: /LEVEL ([0-9]+)/, parseNumber: true })
    level!: number;

    @xpath("./div[@class='character__class_icon']/img/@src")
    iconUrl!: string;

    get name() {
        const iconName = this.iconUrl.split("/").pop() || "";

        if (classjob_icons.hasOwnProperty(iconName)) {
            return classjob_icons[iconName];
        } else {
            return "Unknown";
        }
    }
}