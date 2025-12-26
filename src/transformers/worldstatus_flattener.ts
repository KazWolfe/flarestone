import {PhysicalDataCenter} from "../models/worldstatus/components/components";

export interface FlattenedWorldStatus {
    dataCenter: string;
    region: { id: number; name: string; };

    name: string;
    status: string;
    category: string | null;
    creationOpen: boolean | null;
}

export function flattenWorldStatus(dataCenters: PhysicalDataCenter[]): FlattenedWorldStatus[] {
    const flattened: FlattenedWorldStatus[] = [];

    for (const region of dataCenters) {
        for (const dc of region.dataCenters) {
            for (const world of dc.worlds) {
                flattened.push({
                    name: world.name,
                    dataCenter: dc.name,
                    region: {
                        id: region.id,
                        name: region.name
                    },
                    status: world.status,
                    category: world.category,
                    creationOpen: world.creationOpen
                });
            }
        }
    }

    return flattened;
}