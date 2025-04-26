import { PurchaseEntity } from 'src/domain/entities/purchase/purchase.entity';

export interface PurchaseRepository {
    save(data: PurchaseEntity): Promise<void>;
    saveMany(data: PurchaseEntity[]): Promise<void>;
}

export const PurchaseRepository = Symbol('PurchaseRepository');
