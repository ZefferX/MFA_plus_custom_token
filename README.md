# Pasos para usar este repositorio

## 1) Clonar las lambdas del repositorio, comprimirlas en un zip y subirlas a AWS Lambda.

- **Clonar el repositorio:**
  - Ejecuta en tu terminal:

    ```bash
    git clone https://github.com/ZefferX/MFA_plus_custom_token
    ```

- **Comprimir las lambdas:**
  - Navega a la carpeta de cada función Lambda y crea un archivo ZIP.
  - Para la primera lambda (`MFA-mailsender`):

    ```bash
    cd ../POC-MFA/Lambda de envio de mails y auth MFA
    zip -r function.zip .
    ```

  - Para la segunda lambda (`addPermissionsToJWT`):

    ```bash
    cd ../POC-MFA/Lambda agregar permissions al token
    zip -r function.zip .
    ```

- **Subir las lambdas a AWS Lambda:**
  - En la consola de **AWS Lambda**, crea una nueva función para cada lambda.
  - Para cada función:
    - Asigna un nombre descriptivo (por ejemplo, `MFA-mailsender` y `addPermissionsToJWT`).
    - Selecciona el runtime adecuado (por ejemplo, **Node.js 18.x**).
    - En **Permissions**, selecciona o crea un rol con permisos adecuados.
    - Sube el archivo ZIP correspondiente en la sección de código.

---

## 2) Crear una User Pool de Cognito con un atributo personalizado "permissions" y la autenticación MFA vía email.

- **Crear una User Pool:**
  - En la consola de **Amazon Cognito**, selecciona **"Manage User Pools"** y haz clic en **"Create a user pool"**.
  - Asigna un nombre a tu User Pool.

- **Configurar el atributo personalizado:**
  - En la sección de **"Attributes"**, añade un atributo personalizado:
    - **Nombre**: `permissions`
    - **Tipo**: String

- **Configurar la autenticación MFA vía email:**
  - En la configuración de **MFA and verifications**:
    - Habilita **MFA** y selecciona **Email** como método. *(Debe ser hecho luego de crear la User Pool y no al momento de creación ya que no aparecerá como opción).*
    - Asegúrate de que la verificación de correo electrónico está habilitada.

- **Crear el User Pool:**
  - Revisa la configuración y completa la creación del User Pool.

---

## 3) Configurar la lambda de envío de mails y auth MFA en los 3 triggers correspondientes y la lambda para agregar permisos al token como un trigger de pre token generation.

- **Asignar la lambda `MFA-mailsender` a los triggers:**
  - En tu User Pool de Cognito, ve a la pestaña **"Triggers"**.
  - Asigna la lambda `MFA-mailsender` a los siguientes triggers:
    - **Define Auth Challenge**
    - **Create Auth Challenge**
    - **Verify Auth Challenge Response**

- **Asignar la lambda `addPermissionsToJWT` al trigger:**
  - En la misma sección de **"Triggers"**, asigna la lambda `addPermissionsToJWT` al trigger:
    - **Pre Token Generation**

- **Guardar los cambios:**
  - Asegúrate de guardar la configuración para aplicar los cambios.

---

## 4) Crear y verificar un usuario de Cognito con el correo electrónico como obligatorio.

- **Crear un usuario:**
  - En la consola de Cognito, ve a **"Users and groups"** y haz clic en **"Create user"**.
  - Proporciona un nombre de usuario y establece el correo electrónico como atributo obligatorio.
  - Establece una contraseña temporal si es necesario.

- **Verificar el correo electrónico del usuario:**
  - Cognito puede enviar un correo de verificación al usuario.
  - Sigue las instrucciones en el correo para verificar la dirección de correo electrónico.

---

## 5) Verificar 2 correos electrónicos en Amazon SES: uno será usado como remitente y el segundo será del usuario de prueba creado.

- **Verificar el correo electrónico del remitente en Amazon SES:**
  - Accede a la consola de **Amazon SES**.
  - Ve a **"Identities"** y haz clic en **"Create identity"**.
  - Selecciona **"Email address"** e ingresa la dirección de correo que usarás para enviar los correos (remitente).
  - Sigue las instrucciones para completar la verificación (recibirás un correo con un enlace de confirmación).

- **Verificar el correo electrónico del destinatario (usuario de prueba):**
  - Repite el proceso anterior para la dirección de correo electrónico del usuario de prueba.

- **Nota:**
  - En el modo sandbox de SES, necesitas verificar tanto el correo del remitente como el del destinatario. Si se sale del modo sandbox, se podrá enviar mails a cualquier destinatario.

---

## 6) Comprobar que todo funciona correctamente.

- **Iniciar sesión con el usuario de prueba:**
  - Utiliza **AWS CLI**, **Postman** o tu aplicación para iniciar el flujo de autenticación con el usuario creado.
  - Ejemplo:

    ```bash
    aws cognito-idp initiate-auth --auth-flow CUSTOM_AUTH --client-id 1ri09hpfqmvghg2qbitnpunnk6 --auth-parameters "USERNAME=julio,PASSWORD=Contraseña02@"
    ```

- **Completar el desafío MFA:**
  - Deberías recibir un correo electrónico en la dirección del usuario con un código MFA.
  - Responder al desafío con el siguiente código de ejemplo:

    ```bash
    aws cognito-idp respond-to-auth-challenge --challenge-name CUSTOM_CHALLENGE --client-id 1ri09hpfqmvghg2qbitnpunnk6 --session "AYABeMNdHLLG66bX6Eyy7lQUzY8AHQABAAdTZXJ2aWNlABBDb2duaXRvVXNlclBvb2xzAAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3NDU2MjM0Njc1NTU6a2V5L2IxNTVhZmNhLWJmMjktNGVlZC1hZmQ4LWE5ZTA5MzY1M2RiZQC4AQIBAHjHL4WD3WpekpFe85nxP9Nwg99u3bPN6BTSaB-uHZcTLAGbyQ2t3mu4UDUpIH54fBM0AAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMcIx73QKrBos9vzFmAgEQgDv2wv32l1eP-smWta027XG2zPuFmMpj8BiS7mL4_ooNSGpswaUYFJDit4UbDtHByxrq1pH0aTFxkgVFIwIAAAAADAAAEAAAAAAAAAAAAAAAAAAEfOYU_M1BtC_bqSk1ojts_____wAAAAEAAAAAAAAAAAAAAAEAAADRHjBKy9WDRa9k-MhWGaL3xdw0yCMJ5UBytHP3TKvagZsdJDxutiD4CkEGBzrr2ckpIRsYLhAY0RveurPW1GpGkIDBQ_6SIoyzz-bOPtU9BNWdX7RJ9LUAFTZ31pm8UzXA477_gRXDESNG6S8f6v7H4IDVTCvZ341YltbXYtYS9sNq52zh_9JBWKG7hJmC8X5JWpl1sE_3rR6l3ztE_MuWbzT5aAhMtmeGtgB5ByfzoFvt2K3AwVd4II9zK_gEK3ygpMJZwmct8n0n7HLR_iRejxRZSo0Wl_tHvF-XJP5eNGqs" --challenge-responses USERNAME=julio,ANSWER=620510
    ```

    Sustituyendo los valores correspondientes como `ANSWER` y `SESSION`.

- **Verificar que los permisos se añaden al token:**
  - Después de autenticado, obtendrás un **IdToken**.
  - Decodifica el **IdToken** (puedes usar [jwt.io](https://jwt.io/)) y verifica que el atributo `custom:permissions` está presente y contiene los permisos esperados.

- **Confirmar el correcto funcionamiento:**
  - Asegúrate de que:
    - El código MFA se envía y se recibe correctamente.
    - La autenticación se completa exitosamente tras introducir el código.
    - Los permisos personalizados se agregan al token JWT.

---
