# Flujo de Firma Digital - SPJT

## Resumen

El sistema soporta tres modos de firma para documentos judiciales:

- **Firma Demo**: flujo de desarrollo que genera un sello hash/base64 y marca el documento como firmado.
- **Firma con Token**: flujo en dos pasos que prepara la firma para un dispositivo físico y permite completar la operación.
- **Firma HSM**: firmado server-side utilizando un módulo HSM (actualmente simulado).

Todos los eventos se registran en la tabla `auditorias` a través del middleware `auditTrail`.

## Datos de ejemplo
## Gestión de usuarios

- Solo el rol `ADMIN` puede listar y crear usuarios desde la pantalla de administración.
- El frontend consume `GET /usuarios` y `POST /usuarios`, y muestra institución y permisos del usuario.
- Los permisos presentados surgen del mapeo `ROLE_PERMISSIONS` definido en los tipos del frontend.


El seed `server/prisma/seeds/002_sample_documents.js` genera tres documentos PDF de prueba en la tabla `documentos` y crea los archivos correspondientes dentro de `server/uploads`. Cada documento se vincula a un expediente existente y queda en estado `pendiente_firma`, listo para probar la pantalla de firma.

## Endpoints Backend

| Endpoint | Método | Descripción |
| --- | --- | --- |
| `/api/v1/documentos/:id/firma` | POST | Inicializa un registro de firma genérico (uso interno). |
| `/api/v1/documentos/:id/firma/demo` | POST | Firma el documento en modo demo. |
| `/api/v1/documentos/:id/firma/token/preparar` | POST | Genera la solicitud de firma con token (hash, nonce). |
| `/api/v1/documentos/:id/firma/token/completar` | POST | Registra la firma completada con token. |
| `/api/v1/documentos/:id/firma/hsm` | POST | Firma el documento mediante HSM (simulado). |
| `/api/v1/documentos/:id/firma/status` | GET | Devuelve el estado e historial de firmas. |
| `/api/v1/documentos/:id/firma/verificar` | POST | Verifica integridad y firmas activas. |

### Campos relevantes en `firmas`

- `estado`: `PENDIENTE`, `FIRMADO`, `RECHAZADA`.
- `firma_base64`: firma o sello almacenado.
- `hash_documento`: hash SHA-256 del documento al momento de la firma.
- `metadatos`: JSON con información adicional (nonce, origen, agente, etc.).
- `referencia_externa`: identificador cruzado con sistemas externos.

## Flujo Frontend

`FirmarDocumentoScreen` decide el flujo según el modo seleccionado:

1. **Demo**: envía `comentario` a `/firma/demo` y muestra feedback.
2. **Token**:
   - Prepara la firma (`/firma/token/preparar`) y recibe `solicitudId` y `hash`.
   - Para el prototipo, genera una firma simulada y la envía a `/firma/token/completar`.
3. **HSM**: invoca `/firma/hsm`; el backend genera la firma simulada.

La pantalla muestra estados de éxito/error y utiliza `documentosApi` para comunicar con el backend.

## Integración con Token Físico (próxima etapa)

1. **Driver/Middleware**: instalar en el equipo del usuario el software PKCS#11/CSP del fabricante del token.
2. **Aplicación puente**:
   - Extensión de navegador, app de escritorio o servicio de la Autoridad Certificadora (AC) que acceda al token.
   - Expone un canal local (WebSocket/HTTP local) para recibir el hash y devolver la firma.
3. **Flujo**:
   - Front llama a `/firma/token/preparar` → obtiene `hash` y `nonce`.
   - El navegador envía el hash al bridge (junto con PIN).
   - El bridge firma con el token y devuelve el resultado al frontend.
   - El frontend envía la firma a `/firma/token/completar` con `solicitudId`.

## Requisitos de Plataforma

| Plataforma | Requisitos |
| --- | --- |
| **Web** | Token conectado vía USB, middleware PKCS#11 instalado, navegador con bridge (extensión/app) para firmar. |
| **Móvil (Expo)** | Actualmente utiliza Firma Demo. Para producción, se recomienda delegar la firma real al backend (HSM) o utilizar una app nativa con soporte para tokens OTG. |
| **Backend** | Librerías de firma (OpenSSL, bibliotecas PKCS#11) para el modo real; configuración de certificados y acceso a HSM/token remoto. |

## Próximos pasos sugeridos

- Integrar un bridge real para firmas con token en web (extensión o app).
- Sustituir la simulación HSM por conexión con el módulo/servicio definitivo.
- Agregar validaciones de certificados (OCSP/CRL) y sellado de tiempo oficial.
- Extender auditorías con resultados de validación y datos del certificado.


