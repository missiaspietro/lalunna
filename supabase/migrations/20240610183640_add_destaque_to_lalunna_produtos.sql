-- Adiciona a coluna 'destaque' à tabela 'lalunna_produtos' se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'lalunna_produtos' AND column_name = 'destaque') THEN
        ALTER TABLE lalunna_produtos ADD COLUMN destaque BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna destaque adicionada à tabela lalunna_produtos';
    ELSE
        RAISE NOTICE 'A coluna destaque já existe na tabela lalunna_produtos';
    END IF;
END $$;
