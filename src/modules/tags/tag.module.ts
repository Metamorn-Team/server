import { Module } from '@nestjs/common';
import { TagComponentModule } from 'src/modules/tags/tag-component.module';
import { TagController } from 'src/presentation/controller/tags/tag.controller';

@Module({
    imports: [TagComponentModule],
    controllers: [TagController],
})
export class TagModule {}
