import { IsUUID } from 'class-validator';

export class CanJoinIslandRequest {
    @IsUUID()
    readonly islandId: string;
}
