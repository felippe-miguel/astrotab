test("GET to api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");

  expect(response.status).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.updated_at).toBeDefined();
  expect(responseBody.dependencies).toBeDefined();
  expect(responseBody.dependencies.database).toBeDefined();

  const database = responseBody.dependencies.database;

  expect(database.max_connections).toBeDefined();
  expect(database.opened_connections).toBeDefined();
  expect(database.version).toBeDefined();

  expect(typeof database.max_connections).toBe("number");
  expect(typeof database.opened_connections).toBe("number");
  expect(typeof database.version).toBe("string");

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(parsedUpdatedAt).toBe(responseBody.updated_at);
});
