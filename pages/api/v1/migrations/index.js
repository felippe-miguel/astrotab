import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: {
        message: `Method ${request.method} not allowed. Use one of: ${allowedMethods.join(", ")}`,
      },
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      dir: join("infra", "migrations"),
      direction: "up",
      migrationsTable: "pgmigrations",
      dryRun: true,
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);

      await dbClient.end();

      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      await dbClient.end();

      const statusCode = migratedMigrations.length > 0 ? 201 : 200;

      return response.status(statusCode).json(migratedMigrations);
    }
  } catch (error) {
    console.error("Migration error:", error);

    if (dbClient) {
      await dbClient.end();
    }

    return response.status(500).json({
      error: {
        message: "An error occurred while processing migrations.",
        details: error.message,
      },
    });
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}
