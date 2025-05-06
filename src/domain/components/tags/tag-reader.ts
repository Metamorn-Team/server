import { Inject, Injectable } from '@nestjs/common';
import { TagRepository } from 'src/domain/interface/tag.repository';

@Injectable()
export class TagReader {
    constructor(
        @Inject(TagRepository)
        private readonly tagRepository: TagRepository,
    ) {}

    readByNames(names: string[]) {
        return this.tagRepository.findByNames(names);
    }

    readAll() {
        return this.tagRepository.findAll();
    }
}
