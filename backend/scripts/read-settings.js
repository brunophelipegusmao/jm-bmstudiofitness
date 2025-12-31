const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const rows = await sql`
    select maintenance_mode, maintenance_redirect_url, route_home_enabled, route_user_enabled
    from tb_studio_settings
    limit 5`;
  console.log(rows);
})();
