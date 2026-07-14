# Plan de Readiness para Producción — Guru Soluciones Dashboard

> Revisión senior-dev del backend/frontend antes de salir a producción real.  
> Enfoque: WhatsApp Bot, generación de documentos legales, asignación de clientes a digitadores, casos/reclamaciones, pagos y control de versiones de documentos.

---

## 1. Resumen ejecutivo

El sistema ya tiene **buena base de seguridad** (Helmet, CORS restringido, rate-limiting global, bcrypt, JWT con cookie HttpOnly, Sentry). Sin embargo, varios flujos de negocio críticos **aún no están completos o tienen brechas importantes** que deben cerrarse antes de producción, especialmente:

- Asignación de chats/casos a digitadores y visibilidad restringida.
- Workflow de cierre de casos cuando un cliente paga.
- Confirmación de pago por parte del admin.
- Control de versiones de documentos generados/modificados.
- Almacenamiento organizado de expedientes por cliente.
- Notificaciones y auditoría de reclamaciones.

**Recomendación:** no activar el bot de WhatsApp con clientes reales hasta cerrar los items marcados como **BLOCKER** en este plan.

---

## 2. Seguridad y autenticación

### 2.1. Lo que ya está bien

| Item | Estado | Detalle |
|------|--------|---------|
| Helmet headers | ✅ | CSP configurado, x-powered-by oculto |
| CORS | ✅ | Orígenes restringidos, credentials true |
| Rate limiting global | ✅ | 200 req/15 min |
| Login/register rate limit | ✅ | 5 intentos / IP o usuario |
| Bcrypt | ✅ | 10 rounds |
| JWT en HttpOnly cookie | ✅ | Cross-origin, secure en prod |
| Sentry | ✅ | Captura errores |
| Validación de path en descargas | ✅ | `path.resolve().startsWith(...)` en docGen e invoices |

### 2.2. Riesgos y acciones requeridas

#### BLOCKER: roles de usuario inconsistentes

- El modelo `users.role` solo permite `'admin'` o `'employee'` en la BD (`CHECK (role IN ('admin', 'employee'))`).
- Pero el middleware `requireRole` acepta cualquier string y el frontend crea usuarios con roles como `'digitador'`, `'auxiliar_i'`, `'auxiliar_ii'`.
- **Impacto:** un usuario creado como `digitador` no podrá autenticarse o tendrá comportamiento indefinido.

**Acción:**
1. Decidir el modelo de roles final (ej: `admin`, `digitador`, `auxiliar_i`, `auxiliar_ii` o `admin`, `employee` con `data_column`).
2. Actualizar el `CHECK` de la tabla `users`.
3. Migrar usuarios existentes.
4. Asegurar que todas las rutas usen `requireRole` consistentemente.

#### HIGH: `requireRole` no se usa en muchos endpoints críticos

- `/api/cases`, `/api/clients`, `/api/messages`, `/api/invoices`, `/api/docgen` usan `authenticate` pero no siempre `requireRole('admin')`.
- Un digitador puede, por ejemplo, listar todos los casos o todos los clientes si el frontend le da la URL.

**Acción:** auditar cada ruta y aplicar el principio de mínimo privilegio.

#### MEDIUM: JWT token también se devuelve en body

- `auth.js` responde con `token` en JSON además de la cookie HttpOnly.
- Esto debilita el propósito de la cookie HttpOnly (aunque el frontend actualmente la lee de `localStorage`).

**Acción:** deprecar el token en body; que el frontend confíe solo en la cookie.

#### MEDIUM: secretos de AI en variables de entorno sin rotación programada

- `GEMINI_API_KEY` y `MINIMAX_API_KEY` se usan directamente.
- No hay rate-limit específico ni cuota por usuario.

**Acción:** agregar rate-limit por endpoint de AI y monitorear uso/costo.

---

## 3. WhatsApp Bot

### 3.1. Arquitectura actual

- Baileys maneja la conexión.
- `whatsapp/handler.js` recibe mensajes, hace buffering de imágenes/audio/documentos.
- `conversation/router.js` decide la respuesta ( probablemente con LLM ).
- Estado del bot se guarda en archivo JSON (`whatsapp/botSettings.js`).
- Mensajes se guardan en `messages`.
- Clientes se crean automáticamente (`Client.updateOrCreatePushName`).

### 3.2. Flujo deseado vs. estado actual

| Requerimiento | Estado | Brecha |
|---------------|--------|--------|
| Todos los chats llegan al admin | ✅ Parcial | Sí, pero **sin filtro de asignación** en backend |
| Admin asigna chat/caso a un digitador | ✅ Parcial | Existe `clients.assigned_to` y `cases.user_id`, pero **no hay endpoint/UI clara para asignar un chat de WhatsApp** |
| Digitador solo ve chats asignados | ✅ Parcial | `messages.getConversations` filtra por `assigned_to`, pero **no filtra mensajes por `case_id` ni conversaciones no registradas** |
| Cerrar caso cuando el cliente pagó | ❌ | No hay workflow de cierre de caso vinculado a pago |
| Caso cerrado vuelve al admin | ❌ | No hay lógica de "reapertura/reasignación al admin" |
| Confirmación de pago solo por admin | ❌ | `invoices` tiene `approved` y `sent`, pero **no hay estado `paid` ni confirmación explícita** |

### 3.3. Acciones requeridas

#### BLOCKER: Definir modelo de asignación

Hay dos conceptos que se mezclan:

1. **Cliente asignado** (`clients.assigned_to`) — fijo.
2. **Caso asignado** (`cases.user_id`) — por trámite.

Para un chat de WhatsApp, lo lógico es:

- Si no hay caso abierto: el chat es solo del admin hasta que se crea/ asigna un caso.
- Si hay caso abierto asignado a un digitador: el digitador ve el chat relacionado a ese caso.
- Cuando el caso se cierra (pagado), el chat vuelve a ser admin o se archiva.

**Acción:**
1. Crear tabla `case_assignments` o extender `cases.user_id` con historial.
2. Agregar endpoint `POST /api/messages/assign-chat` que asigne un cliente/caso a un digitador.
3. Filtrar `messages.getConversations` correctamente: admin ve todo, digitador solo clientes/casos asignados.
4. Agregar endpoint `POST /api/cases/:id/close` con motivo (`paid`, `cancelled`, `resolved`).

#### BLOCKER: Estados del caso

Actualmente `cases.status` es un `VARCHAR(50)` sin `CHECK`. Valores usados: `'open'`, `'resolved'`, `'reopened'`.

**Acción:**
1. Definir estados formales: `open`, `in_progress`, `pending_payment`, `paid`, `closed`, `cancelled`, `escalated`.
2. Agregar `CHECK` en BD.
3. Reglas de transición en backend (ej: solo admin puede `paid`).

#### HIGH: Persistencia del estado del bot

El bot guarda `enabledPhones`, `manualPhones`, `botActive`, `botMode` en un **archivo JSON local** (`whatsapp/botSettings.js`). En Railway, el filesystem es efímero.

**Acción:** mover estado del bot a la base de datos (tabla `wa_bot_state` o similar) para que sobreviva reinicios y escalado.

#### HIGH: Reconexión y manejo de sesión de WhatsApp

- Baileys guarda credenciales en `./wa_sessions` (filesystem local).
- En Railway, esto se pierde en cada redeploy.

**Acción:**
1. Mover credenciales de Baileys a PostgreSQL (tabla `wa_credentials`) o a un volumen persistente.
2. Implementar health-check del bot y alerta si se desconecta.

#### MEDIUM: No hay logs de auditoría de quién respondió

- Los mensajes outbound no guardan `user_id` del agente.

**Acción:** agregar `sent_by_user_id` a `messages` para saber quién (bot, admin o digitador) envió cada mensaje.

---

## 4. Casos y reclamaciones

### 4.1. Estado actual

- `cases.js` detecta reclamaciones por palabras clave (`detectComplaint`).
- Crea un caso con `case_type = 'reclamaciones'` y `user_id = null`.
- Tags se guardan en `case_tags`.
- Hay `POST /api/cases/:id/assign` para asignar a un usuario.

### 4.2. Brechas

#### BLOCKER: Reclamaciones no notifican a admin + digitador asignado

- Cuando se detecta una reclamación, solo se crea el caso. **No hay notificación**.
- Si el caso ya está asignado a un digitador, la reclamación debería llegar al admin **y** al digitador.

**Acción:**
1. Agregar campo `notify_to` o usar una tabla `notifications`.
2. Al crear una reclamación, generar notificación para admin y para `cases.user_id` si existe.
3. Exponer endpoint `GET /api/notifications` y mostrar badge en el frontend.

#### BLOCKER: No hay historial de asignaciones

- `cases.user_id` solo guarda el usuario actual. Si reasignan, se pierde el rastro.

**Acción:** crear tabla `case_assignment_history` (`case_id`, `from_user_id`, `to_user_id`, `assigned_at`, `assigned_by`).

#### HIGH: `cases-api.js` no filtra por permisos

- Cualquier usuario autenticado puede listar todos los casos.

**Acción:** aplicar filtro por rol en `cases-api.js` y `cases.js`.

#### MEDIUM: Detección de reclamaciones es solo por palabras clave

- Puede dar falsos positivos y no entender sarcasmo o contexto.

**Acción:** mantener reglas + opcionalmente usar LLM ligero para confirmar cuando la confianza es baja.

---

## 5. Pagos y cotizaciones

### 5.1. Estado actual

- `invoices` tiene `type` (`COTIZACIÓN` / `FACTURA`), `status` (`draft`, `approved`, `sent`).
- `POST /api/invoices/:id/approve` solo admin.
- `POST /api/invoices/:id/send` genera PDF y marca como `sent`.
- No hay estado `paid`.

### 5.2. Flujo deseado

1. Digitador/admin crea cotización.
2. Admin aprueba la cotización.
3. Se envía al cliente (WhatsApp o manual).
4. Cliente paga.
5. **Admin confirma el pago**.
6. Cotización pasa a factura pagada / caso se cierra.

### 5.3. Acciones requeridas

#### BLOCKER: Agregar estado `paid` y confirmación de pago

**Acción:**
1. Extender `invoices.status` con: `draft`, `approved`, `sent`, `paid`, `cancelled`.
2. Crear endpoint `POST /api/invoices/:id/confirm-payment` (solo admin).
3. Guardar metadata: `paid_at`, `paid_by_user_id`, `payment_method`, `payment_reference`.
4. Al confirmar pago, opcionalmente cerrar el caso relacionado (`case_id`).

#### HIGH: Vincular factura con caso

Actualmente `invoices.case_id` existe en el schema pero no se usa al crear.

**Acción:** al crear cotización desde un caso, guardar `case_id`. Al pagar, cerrar el caso.

#### MEDIUM: Evitar edición después de aprobado/enviado

- Un digitador puede editar una cotización en `draft`.
- Una vez `approved` o `sent`, solo admin debería poder editar/cancelar.

**Acción:** reforzar validaciones en `PUT /api/invoices/:id`.

---

## 6. Generación de documentos (Mother Brain)

### 6.1. Estado actual

- Plantillas en `doc_templates`, variables en `doc_variables`.
- Sesiones en `doc_generation_sessions`.
- Generación vía script Python (`motherbrainGenerator.py`).
- Archivos se guardan en disco (`templates/output/`).
- Endpoint de descarga verifica que el path esté dentro de `outputDir`.

### 6.2. Brechas críticas

#### BLOCKER: No hay control de versiones

- Cada generación sobreescribe/crea un archivo nuevo, pero no hay relación entre versiones.
- No hay forma de saber "este documento es la versión 3 del caso X".

**Acción:**
1. Crear tabla `client_documents`:
   ```sql
   id, client_id, case_id, doc_generation_session_id, template_id,
   version_number, file_path, file_name, generated_by_user_id,
   status (generated, revised, approved, obsolete), notes,
   parent_document_id, created_at
   ```
2. Al generar un documento, insertar registro con `version_number` secuencial por `(client_id, template_id, case_id)`.
3. Endpoint `POST /api/documents/:id/revise` para subir una modificación (nueva versión).

#### BLOCKER: Documentos no están vinculados a clientes de forma visible

- `doc_generation_sessions.client_id` existe, pero no hay UI/API de "expediente del cliente".

**Acción:**
1. Crear endpoint `GET /api/clients/:id/documents` que liste todo el historial de documentos.
2. En la UI de cliente mostrar pestaña "Expediente" con versiones descargables.

#### HIGH: Almacenamiento en disco es efímero en Railway

- Archivos generados en `templates/output/` se pierden en redeploys.

**Acción:**
1. Opción A: usar S3 / R2 / Supabase Storage para archivos.
2. Opción B: guardar archivos en BD como `bytea` (no recomendado para DOCX grandes).
3. **Recomendación:** S3/R2 con presigned URLs.

#### HIGH: Cualquier usuario autenticado puede generar documentos

- `docGen.js` usa `authenticate` pero no `requireRole('admin')`.

**Acción:** restringir generación de documentos legales a admin/digitadores autorizados.

#### MEDIUM: No hay rollback de versiones

- Si una versión nueva tiene error, no hay forma de marcarla como `obsolete` y restaurar la anterior.

**Acción:** agregar endpoints `POST /api/documents/:id/mark-obsolete` y descarga de versión específica.

---

## 7. Asignación de clientes a digitadores

### 7.1. Estado actual

- `clients.assigned_to` existe.
- `Client.findByAssignedTo(userId)` filtra.
- `clients.js` ya restringe GET `/clients/:id` si el usuario es digitador y no está asignado.

### 7.2. Brechas

#### BLOCKER: No hay endpoint para que el admin asigne cliente a digitador

- El frontend no tiene forma de cambiar `assigned_to`.

**Acción:**
1. Agregar `PUT /api/clients/:id/assign` (solo admin) que reciba `assigned_to`.
2. Agregar UI en panel de clientes/casos para asignar.

#### HIGH: Un cliente puede quedar huérfano

- Si se borra un usuario, `assigned_to` queda en `NULL` (`ON DELETE SET NULL`).
- Eso es correcto, pero debería notificar al admin.

**Acción:** agregar alerta de clientes sin asignar.

#### MEDIUM: No hay límite de casos por digitador

- Un admin podría asignar todos los casos a un solo digitador.

**Acción:** opcionalmente mostrar carga de trabajo por digitador en el dashboard.

---

## 8. Frontend

### 8.1. Estado actual

- Dashboard en React + Tailwind + componentes neo-brutalistas.
- Rutas protegidas con `ProtectedRoute`.
- Sidebar oculta funciones de admin a digitadores.

### 8.2. Brechas

#### HIGH: Permisos solo visuales

- El frontend oculta menús, pero la seguridad real debe estar en backend.
- Un digitador podría llamar endpoints de admin si conoce la URL.

**Acción:** asegurar que **toda** ruta admin tenga `requireRole('admin')`.

#### MEDIUM: `isAdmin` en frontend se basa en `user.role === 'admin'`

- Si los roles cambian a `digitador`, `auxiliar_i`, etc., esto fallará.

**Acción:** normalizar roles y crear helper `hasRole(user, ...roles)`.

---

## 9. Lista de acciones priorizadas

### BLOCKER (hacer antes de producción)

1. **Normalizar roles de usuario:** actualizar `users.role` CHECK, frontend y middleware.
2. **Auditar permisos en backend:** aplicar `requireRole` en todos los endpoints críticos.
3. **Definir workflow de asignación de casos/chats:** crear endpoints, filtrar mensajes por asignación.
4. **Implementar cierre de caso con pago:** `POST /api/cases/:id/close`, `POST /api/invoices/:id/confirm-payment`.
5. **Control de versiones de documentos:** tabla `client_documents`, versionado, revisión y aprobación.
6. **Mover credenciales de WhatsApp y estado del bot a BD:** evitar pérdida en redeploys.
7. **Mover archivos generados a almacenamiento persistente (S3/R2).**
8. **Notificaciones de reclamaciones:** crear tabla `notifications` y badge en frontend.

### HIGH (hacer en las primeras 2 semanas de producción)

9. **Historial de asignaciones:** `case_assignment_history`.
10. **Auditoría de mensajes:** `sent_by_user_id` en `messages`.
11. **Vincular cotización con caso:** `invoices.case_id`.
12. **Endpoint de asignación de cliente:** `PUT /api/clients/:id/assign`.
13. **Deprecar JWT en body de login:** confiar solo en cookie HttpOnly.
14. **Rate-limit específico para endpoints de AI.**

### MEDIUM (mejoras continuas)

15. Dashboard de carga por digitador.
16. Mejorar detección de reclamaciones con LLM de confirmación.
17. Health-checks y alertas de desconexión de WhatsApp.
18. Backups automatizados de BD y documentos.

---

## 10. Checklist de "go/no-go" a producción

- [ ] Roles normalizados y permisos en backend verificados.
- [ ] Admin puede asignar caso/chat a digitador.
- [ ] Digitador solo ve clientes/casos asignados.
- [ ] Admin confirma pago y caso se cierra.
- [ ] Documentos generados se guardan con versión y expediente por cliente.
- [ ] Archivos de WhatsApp y documentos no dependen del filesystem local.
- [ ] Reclamaciones notifican a admin y digitador asignado.
- [ ] Sesión de WhatsApp persiste en BD.
- [ ] Backups configurados.
- [ ] Plan de respaldo si el bot se desconecta (número de soporte manual).

---

## 11. Recomendación final

**No recomiendo activar el bot de WhatsApp con clientes reales hasta que los 8 BLOCKERS estén resueltos.** El riesgo principal es que un chat de un cliente pagado o una reclamación termine perdido, sin asignación clara o sin historial de documentos, lo cual puede generar problemas legales y operativos graves.

Si quieres salir a producción **pronto**, la ruta más segura es:

1. Habilitar el dashboard solo para admin y unos pocos digitadores de confianza.
2. Procesar clientes de forma manual mientras se cierran los blockers.
3. Activar el bot de WhatsApp en modo "selected" y solo para números de prueba controlados.

---

*Documento generado el 2026-07-14. Revisar y actualizar antes de cada deploy mayor.*
