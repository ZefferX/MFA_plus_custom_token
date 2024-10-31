exports.handler = async (event) => {
    try {
        console.log("Evento recibido:", JSON.stringify(event, null, 2));

        // Definir permisos hardcodeados
        const permissions = ["read", "write", "delete"];
        const permissionsString = permissions.join(',');

        // Agregar los permisos al ID Token y al Access Token como un atributo personalizado
        event.response = event.response || {};
        event.response.claimsOverrideDetails = event.response.claimsOverrideDetails || {};
        event.response.claimsOverrideDetails.claimsToAddOrOverride = {
            "custom:permissions": permissionsString  // Permisos en formato de string
        };

        console.log("Claims a agregar/override:", event.response.claimsOverrideDetails.claimsToAddOrOverride);

        return event;
    } catch (error) {
        console.error("Error en Lambda:", error);
        throw error;
    }
};
