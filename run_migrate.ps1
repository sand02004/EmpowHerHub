$env:DATABASE_URL="postgresql://postgres:admin123@localhost:5432/EmpowHerHub?schema=public"
echo "Generating Prisma Client..."
npx prisma generate
echo "Running Migrations..."
npx prisma migrate dev --name sync_schema_final
echo "Building Backend..."
npx nest build
