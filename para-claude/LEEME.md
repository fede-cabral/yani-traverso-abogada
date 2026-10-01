# Configuración de Claude para este proyecto

Los agentes de esta carpeta van en `.claude/agents/`. Están acá porque la
conexión remota de Claude no puede escribir en `.claude` — a propósito: es la
carpeta donde se define qué puede hacer Claude, y ninguna herramienta remota
debería poder tocarla sin que la persona dueña de la compu lo vea.

El script `INICIAR.ps1` los copia a su lugar. Si preferís hacerlo a mano:

```powershell
New-Item -ItemType Directory -Force .claude | Out-Null
Copy-Item para-claude\agents -Destination .claude -Recurse -Force
```

Una vez copiados, **`.claude/` pasa a ser la copia que vale** y esta carpeta
se puede borrar. Si cambiás un agente, cambialo en `.claude/`: tener dos
copias que se editan por separado es la forma segura de terminar con dos
versiones distintas.

> Los agentes vienen de la plantilla de catálogo y están escritos pensando en
> una tienda. Las reglas de seguridad que revisan son las mismas; donde
> hablan de "productos", en este sitio leé "turnos y consultas".
