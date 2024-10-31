const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' }); // Asegúrate de que esta sea la región correcta

exports.handler = async (event) => {
    switch (event.triggerSource) {
        case 'DefineAuthChallenge_Authentication':
            defineAuthChallenge(event);
            break;
        case 'CreateAuthChallenge_Authentication':
            await createAuthChallenge(event);
            break;
        case 'VerifyAuthChallengeResponse_Authentication':
            verifyAuthChallengeResponse(event);
            break;
        default:
            console.log(`Unhandled triggerSource: ${event.triggerSource}`);
    }
    return event;
};

function defineAuthChallenge(event) {
    if (event.request.session.length === 0) {
        // Primera vez, crear el desafío
        event.response.challengeName = 'CUSTOM_CHALLENGE';
        event.response.issueTokens = false;
        event.response.failAuthentication = false;
    } else {
        const lastChallenge = event.request.session.slice(-1)[0];
        if (lastChallenge.challengeName === 'CUSTOM_CHALLENGE' && lastChallenge.challengeResult === true) {
            // Si el desafío anterior fue exitoso, emitir tokens
            event.response.issueTokens = true;
            event.response.failAuthentication = false;
        } else {
            // Repetir el desafío
            event.response.challengeName = 'CUSTOM_CHALLENGE';
            event.response.issueTokens = false;
            event.response.failAuthentication = false;
        }
    }
}

async function createAuthChallenge(event) {
    const email = event.request.userAttributes.email;
    const code = generateCode();

    // Guardar el código en los parámetros privados
    event.response.privateChallengeParameters = { code: code };
    event.response.challengeMetadata = 'EMAIL_MFA';

    // Enviar el código por correo electrónico
    await sendEmail(email, code);
}

function verifyAuthChallengeResponse(event) {
    const expectedCode = event.request.privateChallengeParameters.code;
    const userCode = event.request.challengeAnswer;

    if (userCode === expectedCode) {
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
}

async function sendEmail(recipient, code) {
    const params = {
        Destination: {
            ToAddresses: [recipient],
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: `Tu código de verificación MFA es: ${code}`,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Código de Verificación MFA',
            },
        },
        Source: 'christofer2497@gmail.com', // Reemplaza con tu correo verificado en SES
    };

    try {
        await ses.sendEmail(params).promise();
        console.log(`Correo enviado a ${recipient}`);
    } catch (error) {
        console.error(`Error al enviar correo a ${recipient}:`, error);
        throw error;
    }
}
