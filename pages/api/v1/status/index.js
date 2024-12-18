import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersion = databaseVersionResult.rows[0].server_version;

  const resultMaxConnections = await database.query("SHOW max_connections;");
  const maxConnections = resultMaxConnections.rows[0].max_connections;

  const openedConnectionsResult = await database.query(
    "SELECT COUNT(*)::int AS open_connections FROM pg_stat_activity",
  );
  const openedConnections = openedConnectionsResult.rows[0].open_connections;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        max_connections: Number(maxConnections),
        opened_connections: openedConnections,
        version: databaseVersion,
      },
    },
  });
}

export default status;
