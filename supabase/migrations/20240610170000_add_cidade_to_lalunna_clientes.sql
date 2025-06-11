-- Adiciona a coluna 'cidade' à tabela 'lalunna_clientes' se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'lalunna_clientes' AND column_name = 'cidade') THEN
        ALTER TABLE lalunna_clientes ADD COLUMN cidade TEXT;
        RAISE NOTICE 'Coluna cidade adicionada à tabela lalunna_clientes';
    ELSE
        RAISE NOTICE 'A coluna cidade já existe na tabela lalunna_clientes';
    END IF;
END $$;
