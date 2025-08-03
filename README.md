# UpiiChat

Este proyecto está inspirado en el proyecto de [CHATBOT-UPIICSA](https://github.com/EduDN/CHATBOT-UPIICSA)
de [Eduardo](https://github.com/EduDN), este proyecto igual busca ayudar a la
comunidad de UPIICSA a resolver sus dudas de una manera rápida y eficiente con
technologías web.

## **Ruta Completa del Proyecto**

### **Funcionalidad Principal y Rendimiento**

- [x] Optimizar la carga de estrategias para evitar la reinicialización de una estrategia ya cargada.
- [x] Implementar un _Web Worker_ para gestionar la carga en segundo plano de estrategias secundarias (como Pyodide) sin congelar la interfaz de usuario.
- [x] Crear un script de pre-cómputo para generar los _embeddings_ sin conexión.
- [ ] Configurar un _Service Worker_ para almacenar en caché activos grandes (modelos de IA, Pyodide).
- [ ] Usar `IndexedDB` para almacenar los _embeddings_ pre-calculados para cargas instantáneas en visitas recurrentes.

### **Mejoras de UI/UX**

- [ ] Implementar un estado de carga global para deshabilitar la entrada de chat mientras se inicializan las estrategias.
- [x] Sanitizar las respuestas del asistente para convertir automáticamente las URLs en enlaces clicables.
- [x] Añadir un botón "Copiar Mensaje" a las respuestas del asistente.
- [ ] Implementar un historial de chat persistente usando `localStorage`.
- [ ] Crear un componente tooltip para sugerencias de UI.
- [ ] Crear un componente de modal para mostrar información adicional o
      configuraciones. (Por ejemplo, "Texto copiado").

### **Arquitectura y Despliegue**

- [ ] Implementar importación dinámica (`import()`) o _code-splitting_ para cargar de forma diferida (_lazy-load_) las librerías de IA después de que la interfaz de usuario principal se haya renderizado.
- [ ] Introducir un enrutador (_router_) para manejar múltiples vistas (ej. una página de configuración).
- [ ] Convertir la aplicación en una _Progressive Web App_ (PWA) completa.

### **Futuras Funcionalidades y Características Avanzadas**

- [ ] Integrar WebLLM con RAG (_Retrieval-Augmented Generation_ o Generación Aumentada por Recuperación) para dispositivos potentes, permitiendo respuestas generativas en el propio dispositivo.

## Tecnologías utilizadas

- TypeScript
- Web assembly (con python)
- PWA (Progressive Web App)
- Transformers.js
- Web components

## Instalación del proyecto

```bash
$ pnpm install
$ yarn install
$ npm install
$ deno install
$ bun install
```

## Contribuir

Si desea contribuir a este proyecto, no dude en ponerse en contacto.
