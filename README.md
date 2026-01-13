# Clínica OnLine

Aplicación web que simula la gestión integral de una clínica médica online, desarrollada como proyecto final de la materia **Laboratorio IV**.  
El sistema permite administrar usuarios con distintos roles, turnos médicos, historiales clínicos y métricas del sistema, aplicando reglas de negocio reales y utilizando servicios en la nube.

El proyecto fue desarrollado con **Angular** y una arquitectura completamente orientada a **Firebase**, integrando autenticación, base de datos NoSQL y hosting.

## Overview del Proyecto

Clínica OnLine está diseñada para representar el funcionamiento real de una clínica médica, contemplando distintos tipos de usuarios y flujos de trabajo.

El sistema implementa:

- Gestión de turnos con validaciones temporales
- Control de acceso según roles
- Registro de historial clínico
- Evaluaciones post atención
- Panel administrativo con métricas y exportación de datos

El foco del proyecto estuvo en la correcta aplicación de lógica de negocio, escalabilidad y organización del código.

## Tecnologías Utilizadas

- **Angular** — Framework principal para el desarrollo frontend
- **TypeScript** — Tipado estático y mejor mantenibilidad
- **Firebase Authentication** — Gestión de usuarios y roles
- **Firebase Firestore** — Base de datos NoSQL en tiempo real
- **Firebase Hosting** — Despliegue de la aplicación
- **Tailwind CSS** — Estilos y diseño responsive

## Tipos de Usuarios

La aplicación contempla tres roles principales, cada uno con funcionalidades específicas:

### 🧑‍⚕️ Pacientes

- Solicitud y cancelación de turnos
- Visualización de historial clínico
- Descarga de documentación médica
- Reseñas sobre la atención recibida

### 👨‍⚕️ Especialistas

- Gestión de turnos asignados
- Carga de reseñas médicas
- Definición de horarios laborales
- Visualización de pacientes atendidos

### 🛡️ Administradores

- Gestión completa de usuarios
- Administración de turnos
- Visualización de logs del sistema
- Exportación de datos (PDF / CSV)
- Métricas y gráficos del sistema
- Opciones sobre los usuarios

## Reglas de Negocio Implementadas

- No se pueden solicitar turnos en fechas pasadas
- No se permiten turnos con más de 15 días de anticipación
- Los turnos pasan por distintos estados (pendiente, aceptado, rechazado, cancelado)
- Solo especialistas habilitados pueden recibir turnos
- Los pacientes solo pueden ver su propia información
- Los administradores tienen acceso total al sistema

## Aprendizajes Clave

- Desarrollo de aplicaciones Angular a mediana escala
- Trabajo con bases de datos NoSQL y modelado de datos en Firestore
- Implementación de autenticación y control de acceso por roles
- Aplicación de reglas de negocio complejas
- Organización del proyecto en módulos, componentes y servicios
- Uso de pipes y directivas personalizadas para reutilización de lógica
- Internacionalización (ES / EN / PT)
- Exportación de datos y generación de reportes

## Accesos Rápidos

- [Funcionalidades Generales](#pagina-principal)
- [Funcionalidades para Pacientes](#opciones-del-menu-desplegable-para-pacientes)
- [Funcionalidades para Especialistas](#opciones-del-menu-desplegable-para-especialistas)
- [Funcionalidades para Administradores](#opciones-del-menu-desplegable-para-administradores)
- [Cambios Específicos del Proyecto](#cambios-específicos-del-proyecto)

---

## Página principal

![App Screenshot](https://i.gyazo.com/b2a026cc3b709206739f97cc86237b9b.png)

Primera vista del usuario al ingresar a la página.

## Sección de login

![App Screenshot](https://i.gyazo.com/ab12472c627fd42adb0ed9c0aeb63cb9.png)

Sección de login (botón superior de iniciar sesión). Dentro podremos ingresar nuestros datos para iniciar sesión como cualquier usuario o elegir la opción de registrarse.

## Sección de Elección de Registro

![App Screenshot](https://i.gyazo.com/ad122ec87f6a3284a7199924b2ccd308.png)

Sección de selección de registro. En esta sección podemos seleccionar como qué tipo de usuario queremos registrarnos (Paciente o Especialista).

## Sección de Registro Pacientes

![App Screenshot](https://i.gyazo.com/3eb3c8def434f60d0ea3776438018169.png)

Sección de registro de pacientes. En esta sección debemos ingresar los datos solicitados como paciente para poder crear una cuenta de este tipo.

## Sección de Registro Especialistas

![App Screenshot](https://i.gyazo.com/97f2cfb2b8f78361bcca88ff6bda4794.png)

Sección de registro de especialistas. En esta sección debemos ingresar los datos solicitados como especialista para poder crear una cuenta de este tipo.

---

## Opciones del menu desplegable para pacientes

![App Screenshot](https://i.gyazo.com/181fde8b9345ebf4472b7812a27c40fb.png)

Una vez iniciado sesión como paciente, contaremos con distintas opciones al hacer clic en la foto que seleccionamos como foto de perfil al crear nuestra cuenta en la barra de navegación superior.

## Mi perfil (Pacientes)

![App Screenshot](https://i.gyazo.com/960685e94427df2758803503e76bf328.png)

En Mi Perfil, el usuario paciente puede visualizar las fotos que eligió al momento de crear su cuenta. Una vez logueado, puede acceder a muchas otras funcionalidades desde esta pantalla.

## Mis Turnos (Pacientes - Ver Turnos)

![App Screenshot](https://i.gyazo.com/c5222f89bcbe0d1833cdeb9bd49e8c56.png)

Aquí podremos ver distintas opciones relacionadas con nuestros turnos, tales como consultar las fechas, qué profesional elegimos y hasta cancelar el turno en caso de que aún no esté asignado.

## Mis Turnos (Pacientes - Ver Turnos - Ver historia)

![App Screenshot](https://i.gyazo.com/e487690fb56d72bbaef0a8fb67fed202.png)

Dentro de la sección ver turnos podemos además visualizar en la lista de turnos ciertas opciones como "Ver Historia", la cual nos permite ver qué datos ingresó el especialista luego de la atención.

## Mis Turnos (Pacientes - Ver Turnos - Ver reseña)

![App Screenshot](https://i.gyazo.com/9d493edd115ae84a3cd743b87e7daee3.png)

Dentro de la sección ver turnos podemos además visualizar en la lista de turnos ciertas opciones como "Ver reseña", la cual nos permite ver qué comentario nos dejó el especialista respecto a nuestra atención.

## Mis Turnos (Pacientes - Ver Turnos - Dejar reseña)

![App Screenshot](https://i.gyazo.com/da33d8b3e6d892cf1e41745db96e5e72.png)

Dentro de la sección ver turnos podemos además visualizar en la lista de turnos ciertas opciones como "Dejar reseña", la cual nos permite dejar una reseña sobre la atención del especialista.

## Mis Turnos (Pacientes - Pedir Turno)

![App Screenshot](https://i.gyazo.com/32c8ba3a48d65cd7073a673e1eda1f14.png)

Aquí podremos pedir turnos paso a paso seleccionando la especialidad, uno de los profesionales que trabajen en esa especialidad, el día y el horario disponible de ese profesional.

## Historial Clinico (Pacientes - Historial Clinico)

![App Screenshot](https://i.gyazo.com/d4659c0effdd3df867d3d21fef74b89c.png)

Aquí podremos ver y descargar nuestra historia clínica ordenada por fecha y con posibilidad de buscar con el buscador por especialidad o especialista.

---

## Opciones del menu desplegable para especialistas

![App Screenshot](https://gyazo.com/38a4873be476786708c9a64d3b5ebdc2.png)

Una vez iniciado sesión como especialista, contaremos con distintas opciones al hacer clic en la foto que seleccionamos como foto de perfil al crear nuestra cuenta en la barra de navegación superior.

## Mi perfil (Especialistas)

![App Screenshot](https://gyazo.com/0289ac81eee327b183bc65baf75e94f5.png)

En Mi Perfil, el usuario especialista puede visualizar la foto que eligió al momento de crear su cuenta. Una vez logueado, puede acceder a muchas otras funcionalidades como selección de horarios de trabajo y visualizador de sus distintas especialidades, entre otros.

## Mis Turnos (Especialistas)

![App Screenshot](https://gyazo.com/4baae8eb2f669d914f150a398b0ddb04.png)

En esta sección los especialistas pueden visualizar sus turnos asignados en todos los estados posibles. Además, pueden rechazar, aceptar o cancelar turnos.

## Mis Turnos (Especialistas - Cargar reseña)

![App Screenshot](https://gyazo.com/e020dcd43e2e2599de26bb7322b16e69.png)

Dentro de la sección ver turnos podemos además visualizar en la lista de turnos ciertas opciones como "Cargar reseña", la cual nos permite dejar registrado en la historia clínica los datos de la atención médica junto con un comentario sobre qué debe hacer el paciente.

## Mis Turnos (Especialistas - Ver historia)

![App Screenshot](https://gyazo.com/c2d905d708a90bdfd51cbc851af141a6.png)

Dentro de la sección ver turnos podemos además visualizar en la lista de turnos ciertas opciones como "Ver Historia", la cual nos permite ver los datos que ingresamos como especialistas.

## Mis Turnos (Especialistas - Ver reseña)

![App Screenshot](https://i.gyazo.com/9d493edd115ae84a3cd743b87e7daee3.png)

Dentro de la sección ver turnos podemos además visualizar en la lista de turnos ciertas opciones como "Ver reseña", la cual nos permite ver qué comentario nos dejó el paciente respecto a nuestra atención.

## Mis Pacientes (Especialistas)

![App Screenshot](https://gyazo.com/7f04c04efd26e2515736c977af7a9c79.png)

En esta sección los especialistas pueden ver los pacientes que atendieron al menos una vez y sus respectivas historias clínicas.

## Configuracion (Especialistas y Pacientes)

![App Screenshot](https://gyazo.com/f747cc75b308c5132710f0aa07592c15.png)

En esta sección los especialistas y los pacientes tienen acceso a la configuración sobre el captcha de seguridad antes del envío de datos, pudiendo activarlo o desactivarlo.

---

## Opciones del menu desplegable para administradores

![App Screenshot](https://gyazo.com/eba8922fb810f426ae5dc78ace3450a9.png)

Una vez iniciado sesión como administrador, contaremos con distintas opciones al hacer clic en la foto que seleccionamos como foto de perfil al crear nuestra cuenta en la barra de navegación superior.

## Panel de control (Administradores)

![App Screenshot](https://gyazo.com/8ebc8501cfbc961d59b1eb74d65325b9.png)

En Panel de control, el usuario administrador puede visualizar la foto que eligió al momento de crear su cuenta. Una vez logueado, puede acceder a muchas otras funcionalidades como gestión de usuarios, visualizar logs del sistema y añadir otros usuarios tipo administrador, entre otros.

## Turnos (Administradores)

![App Screenshot](https://gyazo.com/13009a8619967791097c1f9cc4f7a36b.png)

En esta sección los administradores pueden visualizar todos los turnos del sistema en todos los estados posibles. Además, pueden rechazar, aceptar o cancelar turnos, y cuenta con las mismas funciones de visualizar reseñas y datos registrados por el especialista.

## Solicitar turno (Administradores)

![App Screenshot](https://gyazo.com/57d9b28dd9feeab19f8a810b1024a961.png)

En esta sección los administradores pueden crear un nuevo turno seleccionando el paciente, especialista, fecha, etc.

## Gestion de usuarios (Administradores)

![App Screenshot](https://gyazo.com/a12f026e4145b271e852fe972005fbb8.png)

En esta sección los administradores tienen acceso a la gestión de usuarios, pudiendo exportar los datos de estos, habilitar o deshabilitar cuentas de especialistas y buscarlos por nombre, apellido, etc.

## Añadir administrador (Administradores)

![App Screenshot](https://gyazo.com/5cfdf76838d92737e32fb4cb40e9ec21.png)

En esta sección los administradores pueden crear nuevos usuarios de tipo administrador para el sistema.

## Logs del sistema (Administradores)

![App Screenshot](https://gyazo.com/dce33e4d03c876da8e34cd0d1085cc78.png)

En esta sección los administradores pueden ver todo tipo de dato sobre el sistema en distintos gráficos, además de poder exportar estos datos en PDF o CSV.

---

## Cambios Específicos del Proyecto

### 🔄 Cambios del Segundo Sprint

**Sacar un turno:**

- Comienza mostrando las **ESPECIALIDADES** en botones con la imagen de la especialidad. En caso de no tener imagen, muestra una imagen por defecto (logo de la clínica). Los botones son redondos sin el nombre de la especialidad visible inicialmente.
- Una vez seleccionada la especialidad, se muestran los **PROFESIONALES** en botones con la imagen de perfil de cada profesional y su nombre debajo. Estos botones son redondos.
- Una vez seleccionado el profesional, aparecen los **DÍAS** con turnos disponibles para ese profesional. Estos botones son rectangulares con formato (DD/MM).
- Seleccionado el día, se muestran los **HORARIOS** disponibles. Estos botones son rectangulares con formato HH:MMam/pm.

### 🔄 Cambios del Tercer Sprint

**Sección Mis Pacientes (Para especialistas):**

- Solo muestra los usuarios que el especialista haya atendido al menos 1 vez.
- Los usuarios se muestran con **CARDS** que incluyen un detalle de cuándo fueron los **ÚLTIMOS 3 TURNOS** que tuvo ese paciente.
- Al seleccionar un paciente, se muestra su **historia clínica** completa.

---

## 🔧 Pipes y Directivas Personalizadas

### Pipes

**1. CalculateAgePipe**

- **Propósito:** Calcula la edad a partir de una fecha de nacimiento.
- **Uso:** `{{ birthDate | calculateAge }}`
- **Ejemplo:** Transforma '1990-05-15' a '34 años'

**2. DayToSpanishPipe**

- **Propósito:** Convierte nombres de días en inglés a español.
- **Uso:** `{{ 'Monday' | dayToSpanish }}`
- **Ejemplo:** Transforma 'Monday' a 'Lunes'

**3. FormatDniPipe**

- **Propósito:** Formatea números de DNI con separadores de miles.
- **Uso:** `{{ dni | formatDni }}`
- **Ejemplo:** Transforma '12345678' a '12.345.678'

### Directivas

**1. CaptchaDirective**

- **Propósito:** Implementa un captcha visual antes de enviar formularios.
- **Uso:** `<button appCaptcha (captchaSuccess)="onSubmit()">`
- **Funcionalidad:** Muestra texto distorsionado mediante canvas y el usuario debe ingresar exactamente lo que ve para poder continuar.

**2. SortSelectDirective**

- **Propósito:** Permite ordenar listas de elementos por diferentes criterios.
- **Uso:** `<select appSortSelect [items]="appointments" (sorted)="onSorted($event)">`
- **Funcionalidad:** Ordena por fecha (reciente/antiguo), estado o nombre.

**3. TimeFilterDirective**

- **Propósito:** Filtra elementos por rangos de tiempo.
- **Uso:** `<select appTimeFilter [items]="appointments" (filtered)="onFiltered($event)">`
- **Funcionalidad:** Filtra elementos por "hoy", "esta semana", "este mes" o "todo".
