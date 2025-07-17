import { RawBuilder, sql } from 'kysely';

/**
 * kysely에서 uuid 캐스팅 필요시 사용
 * @param uuid uuid 문자열
 * @returns 캐스팅된 kysely uuid
 */
export function toKyselyUuid(uuid: string): RawBuilder<string> {
    return sql`${uuid}::uuid`;
}
