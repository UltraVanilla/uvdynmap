export interface AuthToken {
    disallowAuth?: boolean;
    groups: string[];
    uuid: string;
}

export interface BulkAuthToken {
    players: AuthToken[];
}

export interface AccountInfo {
    roles: string[];
    name: string;
    uuid: string;
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
    return roles.some((role) => ["intern", "moderator", "admin", "ceo", "dev"].includes(role));
}
