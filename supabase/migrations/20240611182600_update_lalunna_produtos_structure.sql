-- Atualiza a estrutura da tabela lalunna_produtos
DO $$
BEGIN
    -- Verifica se a tabela existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lalunna_produtos') THEN
        -- Adiciona as colunas se não existirem
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'lalunna_produtos' AND column_name = 'tamanho') THEN
            ALTER TABLE lalunna_produtos ADD COLUMN tamanho text;
            RAISE NOTICE 'Coluna tamanho adicionada à tabela lalunna_produtos';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'lalunna_produtos' AND column_name = 'tipo_tamanho') THEN
            ALTER TABLE lalunna_produtos ADD COLUMN tipo_tamanho text;
            RAISE NOTICE 'Coluna tipo_tamanho adicionada à tabela lalunna_produtos';
        END IF;
        
        -- Atualiza a estrutura da tabela para garantir que esteja conforme o solicitado
        -- Esta parte garante que as colunas tenham os tipos corretos e constraints
        ALTER TABLE lalunna_produtos 
            ALTER COLUMN created_at SET DEFAULT now(),
            ALTER COLUMN status SET DEFAULT 'ATIVADO';
            
        RAISE NOTICE 'Estrutura da tabela lalunna_produtos atualizada com sucesso';
    ELSE
        -- Se a tabela não existir, cria com a estrutura solicitada
        CREATE TABLE public.lalunna_produtos (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            titulo text NULL,
            descricao text NULL,
            valor text NULL,
            url_foto text NULL,
            status text NULL DEFAULT 'ATIVADO'::text,
            empresa text NULL,
            tamanho text NULL,
            tipo_tamanho text NULL,
            destaque boolean NULL DEFAULT false,
            CONSTRAINT lalunna_pkey PRIMARY KEY (id)
        );
        RAISE NOTICE 'Tabela lalunna_produtos criada com a nova estrutura';
    END IF;
END $$;
