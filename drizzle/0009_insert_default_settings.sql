-- Inserir registro inicial de configurações se não existir
INSERT INTO tb_studio_settings (
  id,
  studio_name,
  email,
  phone,
  address,
  city,
  state,
  zip_code,
  waitlist_enabled,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  'JM Fitness Studio',
  'contato@jmfitness.com',
  '(21) 98099-5749',
  'Rua das Flores, 123',
  'Rio de Janeiro',
  'RJ',
  '20000-000',
  false,
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM tb_studio_settings LIMIT 1);
