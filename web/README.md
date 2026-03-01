

# 🛡️ QualityStore - Fullstack & QA Excellence

[![QualityStore CI](https://github.com/Calabacyn/QualityStore/actions/workflows/main.yml/badge.svg)](https://github.com/Calabacyn/QualityStore/actions/workflows/main.yml)

### 🚀 Pipeline de Integración Continua (CI)
Este proyecto cuenta con un flujo automatizado en **GitHub Actions** que garantiza la calidad del código en cada cambio:
1. **Backend Unit Testing:** Ejecución de tests con Jest para validar la lógica de la API.
2. **E2E Testing:** Suite completa de Playwright para validar flujos de usuario reales (Auth, CRUD, Cart).
3. **Artifact Generation:** Generación y guardado de reportes HTML, videos y trazas de error por 30 días.

Este proyecto implementa una suite de pruebas **End-to-End (E2E)** utilizando **Playwright**, cubriendo flujos críticos de negocio.

### Cobertura de Pruebas:
* **RBAC (Role-Based Access Control):** Verificación de redirecciones y permisos entre Admin y Cliente.
* **CRUD de Productos:** Validación de persistencia en tiempo real desde el panel administrativo hacia la tienda.
* **E2E Shopping Flow:** Flujo completo desde búsqueda, adición al carrito con validación matemática de totales, hasta el checkout.

### Diagnóstico y Reportes:
El proyecto está configurado para generar reportes interactivos detallados. En caso de fallo, se capturan:
* 🎥 **Video** de la sesión del navegador.
* 📸 **Screenshots** del estado exacto del error.
* 🔍 **Traces:** Un historial completo de acciones para debugging post-mortem.

Para ejecutar los tests localmente y ver el reporte:
```bash
npx playwright test
npx playwright show-report