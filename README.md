# Nomada

This is the backend for the nomada riders app. This provides all the endpoints for the frontend part of the application.

## Installation

Clone the app to a folder and carry out the following instructions.

```bash
npm run build
```
The dist folder will be created in the root and then run docker
```bash
docker-compose up
```

## Usage

If changes are made to the app and it is not reflecting, run these commands:

```bash
docker-compose down
```
```bash
docker system prune -af
```

```bash
docker-compose up
```

## Database Migrations

### Generating Migration Files

To generate a new migration file:

```bash
# Inside Docker container
docker compose exec app npm run migrate:generate <migration-name> [template-type]
```

Available template types:
- `default` - Basic migration template (default if not specified)
- `add-column` - Template for adding a column to a table
- `rename-column` - Template for renaming a column in a table
- `create-table` - Template for creating a new table

Examples:
```bash
# Generate migration to add a column
docker compose exec app npm run migrate:generate add-priority-column add-column

# Generate migration to rename a column
docker compose exec app npm run migrate:generate rename-isRead-to-read rename-column

# Generate migration to create a table
docker compose exec app npm run migrate:generate create-events-table create-table
```

### Running Migrations

To run all pending migrations:

```bash
docker compose exec app npm run migrate
```

This will automatically detect and run any new migration files that haven't been applied yet.

### Legacy Migration Commands

If you need to use the old Sequelize CLI:

```bash
# Generate migration with Sequelize CLI
npx sequelize-cli migration:generate --name add-column

# Run migrations with Sequelize CLI
docker compose exec app npx sequelize db:migrate --config src/config/config.js
```

## Seeding Data

If you want to seed data, run the app and then run this command in another terminal:

```bash
docker-compose exec app npm run seed
```

You can modify the seed files on a test branch before running the command to add more relevant data.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

