import { Module } from '@nestjs/common';
import { PrivateIslandPasswordChecker } from 'src/domain/components/islands/private-storage/private-island-password-checker';
import { PrivateIslandComponentModule } from 'src/modules/islands/private-island-component.module';

@Module({
    imports: [PrivateIslandComponentModule],
    providers: [PrivateIslandPasswordChecker],
    exports: [PrivateIslandPasswordChecker],
})
export class PrivateIslandPasswordCheckerModule {}
