# Guía de Integración y Despliegue Continuo (CI/CD) para Gritar

Esta guía documenta cómo se implementó exitosamente la integración continua (CI) y el despliegue continuo (CD) usando GitHub Actions y un servidor VPS. La arquitectura final utiliza el poder de los servidores de GitHub para compilar el código de React/Vite y transfiere únicamente los archivos de producción estáticos al VPS, lo que asegura un despliegue ultra-rápido, sin sobrecargar la memoria del servidor y sin lidiar con repositorios corruptos en el destino.

---

## 1. Paso a Paso de la Implementación

### A. Preparación del Servidor (VPS)
Primero, fue necesario establecer un método de autenticación seguro para que GitHub pudiera enviar archivos al servidor sin usar contraseñas.

1. **Crear una nueva llave SSH dedicada:**
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/github_key -N ""
   ```
2. **Autorizar la llave en el servidor:**
   ```bash
   cat ~/.ssh/github_key.pub >> ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```
3. **Identificar el usuario del servidor:**
   ```bash
   whoami
   ```
   *(Este dato se usó para el secreto `VPS_USERNAME`)*.
4. **Convertir la llave privada a Base64 (Truco clave):**
   Para evitar que el panel de GitHub corrompiera los saltos de línea de la llave SSH, se convirtió a una cadena Base64 ininterrumpida:
   ```bash
   cat ~/.ssh/github_key | base64 -w 0
   ```

### B. Configuración de GitHub Secrets
En el repositorio de GitHub (`Settings > Secrets and variables > Actions`), se agregaron 3 variables vitales:
- `VPS_HOST`: La dirección IP del servidor (ej. `198.51.100.0`).
- `VPS_USERNAME`: El resultado del comando `whoami` (ej. `root`).
- `SSH_PRIVATE_KEY`: La gigantesca cadena de texto en Base64 generada en el paso anterior.

### C. Archivo de Workflow de GitHub Actions
Se creó el archivo `.github/workflows/deploy.yml` con el siguiente flujo de trabajo:
1. `actions/checkout@v4`: Clona el código en los servidores de GitHub.
2. `actions/setup-node@v4`: Prepara un entorno con Node.js v20.
3. `npm install && npm run build`: Descarga las dependencias y construye la aplicación web generando la carpeta `dist`.
4. **Decodificación de Llave:** Transforma el secreto en Base64 de vuelta a un archivo SSH válido.
5. **Transferencia (SCP):** Ejecuta un comando SSH para asegurar que exista `/var/www/gritar/dist` y luego usa `scp` para copiar los archivos compilados directo al servidor.

---

## 2. Cómo recuperar la integración continua (Troubleshooting)

Si en el futuro haces un "Push" y notas que los cambios no se ven reflejados, no entres en pánico. Este es el diagrama de flujo para encontrar y solucionar el problema:

### Paso 1: Validar el estado en GitHub Actions
Entra a la pestaña **Actions** de tu repositorio. Revisa la ejecución más reciente.
- **Si está en Verde (Success):** El problema es la caché de tu navegador. Usa "Ventana de Incógnito" o `Ctrl + F5`.
- **Si está en Rojo (Failed):** Abre los logs y revisa el paso que falló.

### Paso 2: Identificar el error y aplicar la solución

| Error en Logs de GitHub | Causa Probable | Solución |
| :--- | :--- | :--- |
| `Load key... error in libcrypto` | El secreto `SSH_PRIVATE_KEY` perdió su formato o no está en Base64. | Vuelve a ejecutar el comando `base64` en el VPS y pega el nuevo código en GitHub Secrets. |
| `Permission denied (publickey)` | El servidor rechazó la conexión. La llave fue borrada o los permisos de la carpeta `.ssh` cambiaron. | Vuelve a ejecutar el Paso A.1 y A.2 de esta guía para autorizar la llave de nuevo. |
| `dial tcp: lookup ... server misbehaving` | Pusiste un dominio u `http://` en el secreto `VPS_HOST`. | Cambia `VPS_HOST` en GitHub para que contenga **únicamente** los números de tu IP. |
| `npm run build` falló | Hay un error en tu código de React o TypeScript que impide compilar. | Revisa el log rojo en GitHub, te dirá exactamente en qué archivo y qué línea está el error de tu código. Corrígelo localmente y vuelve a hacer push. |

---

## 3. Mensaje Final

¡**Muchísimas Felicidades**! 🎉
Has logrado dar el salto desde despliegues manuales propensos a fallos, hasta una arquitectura DevOps profesional de Integración y Despliegue Continuo (CI/CD). No es un camino fácil y las llaves SSH suelen frustrar a muchísimos desarrolladores en el proceso, pero tu perseverancia rindió frutos. De ahora en adelante, cada línea de código que escribas tomará vida de forma autónoma. ¡Disfruta la magia de automatizar!
