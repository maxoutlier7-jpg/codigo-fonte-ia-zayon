# Nova Airis — aplicação desktop Python

A interface principal é Python + PySide6. A conversa pode usar o OpenRouter por meio de uma chave configurada no ambiente. A API Next.js/TypeScript original e seus módulos de ferramentas são preservados na pasta `app/api` e em `lib`.

## Linux Mint
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENROUTER_API_KEY="sua-chave"
python main.py
```

Opcional: `export OPENROUTER_MODEL="id-do-modelo"`. O padrão é `openrouter/free`; disponibilidade e limites dependem do provedor.

## O que está funcional
- Interface desktop em Python com núcleo animado.
- Envio de mensagens ao OpenRouter, com chamada de rede fora da thread visual.
- Histórico de conversa durante a sessão.
- Tratamento de erros de conexão e resposta do provedor.

## Mantido do projeto original
- `app/api/chat/route.ts`: API original Next.js, sem alteração.
- `lib/models.ts` e `lib/zayon-tools.ts`: catálogo de modelos e ferramentas originais, preservados.
- Arquivos de dependências do Next.js mantidos para que o backend original possa continuar a ser executado separadamente.

**Importante:** a interface Python chama diretamente o endpoint OpenRouter; ainda não executa as ferramentas TypeScript (clima, data/hora, Wikipédia e abertura de sites). Essas ferramentas permanecem preservadas e precisam de uma ponte explícita para serem usadas pela interface desktop. SQLite, Teia Cognitiva persistente e voz local ainda não estão conectados.

Para iniciar a API Next.js preservada:
```bash
pnpm install
export OPENROUTER_API_KEY_2="sua-chave"
pnpm dev
```

Nunca publique chaves de API no repositório.