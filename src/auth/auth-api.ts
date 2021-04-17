export interface AuthToken {
    disallowAuth?: boolean;
    groups: string[];
    uuid: string;
}

export interface BulkAuthToken {
    players: AuthToken[];
}

export interface RedisUrlToken {
    getRedisLink: true;
}

export interface AccountInfo {
    roles: string[];
    name: string;
    uuid: string;
}

export interface CancelCoreprotectCommandResult {
    commandExists: boolean;
    command?: string;
    state?: string;
}

export interface WorldPing {
    currentCount: number;
    hasStorm: boolean;
    isThundering: boolean;
    confighash: number;
    servertime: number;
    timestamp: number;
    updates: WorldUpdate[];
    players: WorldPingPlayer[];
}

export interface WorldPingPlayer {
    world: string;
    armor: number;
    name: string;
    x: number;
    y: number;
    z: number;
    sort: number;
    health: number;
    type: string;
    account: string;
}

export interface WorldUpdate {
    type: "tile";
    name: string;
    timestamp: number;
}

export const authTokenSchema = {
    $id: "ultravanilla#authToken",
    type: "object",
    required: ["uuid", "groups"],
    properties: {
        uuid: {
            type: "string",
            format: "uuid",
        },
        groups: {
            type: "array",
            items: { type: "string" },
        },
        disallowAuth: {
            type: "boolean",
            optional: true,
        },
    },
};

export const bulkAuthTokenSchema = {
    $id: "ultravanilla#bulkAuthToken",
    type: "object",
    required: ["players"],
    properties: {
        players: {
            type: "array",
            items: { $ref: "ultravanilla#authToken" },
        },
    },
};

export function isStaff({ roles, uuid }: { roles?: string[]; uuid?: string }): boolean {
    if (roles == null || uuid == null) return false;
    return roles.some((role) =>
        ["intern", "moderator", "admin", "ceo", "dev", "excavator", "cultist", "devotee"].includes(role),
    );
}
