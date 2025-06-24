import { Map } from 'src/domain/types/map.types';
import { GetAllMapResponse } from 'src/presentation/dto/map/response/get-all-map.response';

export function toGetAllMapResponse(maps: Map[]): GetAllMapResponse {
    const mapItems = maps.map((map) => {
        return {
            id: map.id,
            key: map.key,
            name: map.name,
            description: map.description,
            image: map.image,
            createdAt: map.createdAt.toISOString(),
        };
    });

    return {
        maps: mapItems,
    };
}
