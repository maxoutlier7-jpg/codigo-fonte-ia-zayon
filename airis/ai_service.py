"""Cliente OpenRouter para a interface desktop Nova Airis."""
import json
import os
import urllib.error
import urllib.request

SYSTEM_PROMPT = """Você é Nova Airis, uma assistente de IA competente, clara e colaborativa.
Responda sempre em português do Brasil. Seja objetiva, mas explique em detalhes quando pedirem.
Não afirme que tem acesso a arquivos, memória ou ferramentas que não foram fornecidos.
"""

def chat(messages):
    api_key = os.getenv("OPENROUTER_API_KEY_2") or os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("Chave não configurada. Defina OPENROUTER_API_KEY no terminal antes de iniciar.")
    model = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    payload = {"model": model, "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages, "temperature": 0.7}
    request = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json",
                 "HTTP-Referer": "https://github.com/maxoutlier7-jpg/codigo-fonte-ia-zayon", "X-Title": "Nova Airis"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"Erro do provedor ({exc.code}): {detail}") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise RuntimeError(f"Não foi possível conectar ao provedor: {exc}") from exc
    choices = data.get("choices", [])
    if not choices:
        raise RuntimeError("O provedor não devolveu uma resposta. Tente outro modelo.")
    return choices[0].get("message", {}).get("content") or "Recebi uma resposta vazia do modelo."
