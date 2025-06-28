import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DomainExceptionType } from 'src/domain/exceptions/enum/domain-exception-type';
import { DomainException } from 'src/domain/exceptions/exceptions';
import { MAP_NOT_FOUND_MESSAG } from 'src/domain/exceptions/message';
import { MapRepository } from 'src/domain/interface/map.repository';
import { Map } from 'src/domain/types/map.types';

@Injectable()
export class MapReader {
    constructor(
        @Inject(MapRepository)
        private readonly mapRepository: MapRepository,
    ) {}

    async readAll(): Promise<Map[]> {
        return await this.mapRepository.findAll();
    }

    async getMapKeyMap(): Promise<{ [key: string]: string }> {
        const maps = await this.readAll();
        const mapKeyMap: { [key: string]: string } = {};
        maps.forEach((map) => {
            mapKeyMap[map.key] = map.id;
        });

        return mapKeyMap;
    }

    async readByKey(key: string): Promise<Map> {
        const map = await this.mapRepository.findByKey(key);
        if (!map) {
            throw new DomainException(
                DomainExceptionType.MAP_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                MAP_NOT_FOUND_MESSAG,
            );
        }
        return map;
    }
}
