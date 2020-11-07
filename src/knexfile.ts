import Knex from "knex";

const migrations = {
    tableName: "knex_migrations",
    directory: "./lib/migrations",
    loadExtensions: [".js"],
};

const config: { [env: string]: Knex.Config } = {
    development: {
        client: "mysql",
        connection: process.env.MYSQL_URI || "mysql://foo:bar@localhost/ultravanilla",
        pool: {
            min: 2,
            max: 10,
        },
        migrations,
    },

    production: {
        client: "mysql",
        connection: process.env.MYSQL_URI || "does not exist",
        pool: {
            min: 2,
            max: 10,
        },
        migrations,
    },
};

export default config;
