/* Promove "Bruno Phelipe Gusmão da Nóbega Mulim" para MASTER.
 * Usa DATABASE_URL do backend. Se o usuário não existir, cria com dados básicos
 * usando variáveis de ambiente opcionais:
 *   MASTER_EMAIL, MASTER_PASSWORD, MASTER_CPF, MASTER_PHONE, MASTER_ADDRESS, MASTER_BIRTH
 */
const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const name = "Bruno Phelipe Gusmão da Nóbega Mulim";

  const email =
    process.env.MASTER_EMAIL || "bruno.mulim@jmfitnessstudio.local";
  const password = process.env.MASTER_PASSWORD || "TempMaster@123";
  const cpf = (process.env.MASTER_CPF || "00000000000").replace(/\D/g, "");
  const telephone = process.env.MASTER_PHONE || "+55 11 99999-9999";
  const address =
    process.env.MASTER_ADDRESS || "Endereço não informado (ajuste depois)";
  const bornDate = process.env.MASTER_BIRTH || "1990-01-01";

  console.log("-> promovendo/garantindo MASTER para:", name);

  const existing =
    await sql`select id from tb_users where lower(name) = lower(${name}) limit 1`;

  if (existing.length > 0) {
    const userId = existing[0].id;
    await sql`update tb_users set user_role = 'master', is_active = true where id = ${userId}`;
    console.log(`Usuário encontrado e promovido para MASTER (id=${userId}).`);
  } else {
    console.log("Usuário não encontrado, criando novo MASTER...");
    const hashedPassword = await bcrypt.hash(password, 12);

    const created = await sql`
      insert into tb_users (name, password, user_role, is_active)
      values (${name}, ${hashedPassword}, 'master', true)
      returning id
    `;

    const userId = created[0].id;

    await sql`
      insert into tb_personal_data (user_id, cpf, born_date, address, telephone, email)
      values (${userId}, ${cpf}, ${bornDate}, ${address}, ${telephone}, ${email})
    `;

    console.log(`MASTER criado com id=${userId}.`);
    console.log(`Email: ${email}`);
    console.log(`Senha temporária: ${password}`);
  }
}

main()
  .then(() => {
    console.log("Concluído.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Erro ao promover/criar MASTER:", err);
    process.exit(1);
  });
