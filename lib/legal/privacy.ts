import {
  OPERATOR_NAME,
  SUPPORT_EMAIL,
  type LegalContext,
  type LegalDocPair,
} from "./types";

/** Política de privacidad. No cita precios, así que ignora el contexto. */
export function privacy(_ctx: LegalContext): LegalDocPair {
  return {
    es: {
      title: "Política de Privacidad",
      subtitle:
        "Qué datos recogemos, para qué los usamos, con quién los compartimos y qué puedes hacer al respecto.",
      sections: [
        {
          id: "responsable",
          heading: "1. Quién trata tus datos",
          blocks: [
            {
              kind: "p",
              text: `El responsable del tratamiento de tus datos personales es ${OPERATOR_NAME}, con domicilio en Bolivia, operador de PromptForge (el «Sitio»).`,
            },
            {
              kind: "p",
              text: `Para cualquier consulta sobre esta política puedes escribirnos a ${SUPPORT_EMAIL}.`,
            },
          ],
        },
        {
          id: "datos",
          heading: "2. Qué datos recogemos",
          blocks: [
            {
              kind: "p",
              text: "Recogemos únicamente los datos necesarios para operar el Sitio:",
            },
            {
              kind: "ul",
              items: [
                "Datos de cuenta: dirección de correo electrónico, nombre o nombre de usuario.",
                "Contraseña: se almacena siempre cifrada con algoritmos de hash irreversible. Nunca la vemos ni podemos recuperarla en texto claro.",
                "Si te registras con Google: identificador de la cuenta, correo electrónico y foto de perfil públicos que Google nos entrega. No accedemos a tu contraseña de Google ni a otros datos de esa cuenta.",
                "Datos de uso: saldo de créditos IA, rayitos, prompts publicados, apoyos recibidos y herramientas de IA utilizadas.",
                "Datos de pago: cuando contratas Premium por QR, la referencia y el estado de la solicitud. No recibimos ni almacenamos números de tarjeta, cuentas bancarias ni credenciales financieras.",
                "Datos técnicos: dirección IP y agente de usuario, que registramos con fines de seguridad, prevención de abuso y diagnóstico de errores.",
              ],
            },
          ],
        },
        {
          id: "uso",
          heading: "3. Para qué usamos tus datos",
          blocks: [
            {
              kind: "ul",
              items: [
                "Crear y gestionar tu cuenta y permitirte iniciar sesión.",
                "Prestar el servicio: publicar prompts, usar las herramientas de IA y gestionar tus créditos y rayitos.",
                "Procesar y verificar el pago manual de Premium y activar la suscripción.",
                "Moderar el contenido publicado y aplicar los Términos de Uso.",
                "Proteger el Sitio frente a fraude, abuso y accesos no autorizados.",
                "Enviarte avisos operativos relacionados con tu cuenta o con el servicio.",
                "Cumplir obligaciones legales que nos sean aplicables.",
              ],
            },
            {
              kind: "p",
              text: "No usamos tus datos para elaborar perfiles publicitarios ni los vendemos a terceros.",
            },
          ],
        },
        {
          id: "terceros",
          heading: "4. Con quién compartimos tus datos",
          blocks: [
            {
              kind: "p",
              text: "No vendemos tus datos personales. Los compartimos únicamente con los proveedores que hacen posible el servicio:",
            },
            {
              kind: "ul",
              items: [
                "Supabase: alojamiento de la base de datos donde reside la información de la cuenta.",
                "Vercel: alojamiento e infraestructura del Sitio, y almacenamiento de archivos subidos (Vercel Blob).",
                "Google: si eliges iniciar sesión con Google, para autenticar tu identidad.",
                "DeepSeek: procesamiento de los textos que envías a las herramientas de IA y a los sistemas de moderación de contenido.",
              ],
            },
            {
              kind: "p",
              text: "Estos proveedores pueden tratar datos fuera de Bolivia. Al usar el Sitio aceptas que tus datos se procesen en las ubicaciones donde operan estos servicios.",
            },
            {
              kind: "p",
              text: "También podremos comunicar datos cuando exista una obligación legal o un requerimiento válido de una autoridad competente.",
            },
          ],
        },
        {
          id: "derechos",
          heading: "5. Tus derechos",
          blocks: [
            {
              kind: "p",
              text: "Puedes ejercer los siguientes derechos sobre tus datos personales:",
            },
            {
              kind: "ul",
              items: [
                "Acceso: saber qué datos tuyos tratamos.",
                "Rectificación: corregir datos inexactos o incompletos.",
                "Eliminación: solicitar el borrado de tus datos y de tu cuenta.",
                "Portabilidad: recibir tus datos en un formato estructurado y de uso común.",
                "Oposición y limitación: oponerte a determinados tratamientos o pedir que se limiten.",
              ],
            },
            {
              kind: "p",
              text: `Para ejercerlos, escríbenos a ${SUPPORT_EMAIL} desde la dirección asociada a tu cuenta. Responderemos en un plazo de hasta 48 horas hábiles.`,
            },
            {
              kind: "p",
              text: "La eliminación de la cuenta es irreversible y conlleva la pérdida de los prompts publicados, los créditos IA, los rayitos y cualquier Premium activo, sin derecho a reembolso.",
            },
          ],
        },
        {
          id: "cookies",
          heading: "6. Cookies",
          blocks: [
            {
              kind: "p",
              text: "Usamos únicamente cookies técnicas, necesarias para que el Sitio funcione: la de sesión y las de protección frente a falsificación de peticiones (CSRF), además de la cookie que recuerda el idioma que eliges en las páginas legales.",
            },
            {
              kind: "p",
              text: "No usamos cookies de publicidad, de análisis ni de seguimiento entre sitios. Puedes consultar el detalle en nuestra Política de Cookies.",
            },
          ],
        },
        {
          id: "retencion",
          heading: "7. Cuánto tiempo conservamos los datos",
          blocks: [
            {
              kind: "p",
              text: "Conservamos los datos de tu cuenta mientras esta permanezca activa. Si solicitas su eliminación, los borramos en un plazo razonable, salvo aquellos que debamos conservar para cumplir obligaciones legales, resolver disputas o prevenir el fraude.",
            },
            {
              kind: "p",
              text: "Los registros técnicos (IP y agente de usuario) se conservan por un periodo limitado y se eliminan o anonimizan cuando dejan de ser necesarios para las finalidades de seguridad indicadas.",
            },
          ],
        },
        {
          id: "menores",
          heading: "8. Menores de edad",
          blocks: [
            {
              kind: "p",
              text: "El Sitio está prohibido para personas menores de 18 años. No recogemos conscientemente datos de menores. Si detectamos una cuenta de una persona menor de edad, la eliminaremos junto con sus datos.",
            },
          ],
        },
        {
          id: "seguridad",
          heading: "9. Seguridad",
          blocks: [
            {
              kind: "p",
              text: "Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: cifrado de contraseñas, conexiones cifradas y control de acceso a la base de datos. Ningún sistema es completamente seguro, por lo que no podemos garantizar una seguridad absoluta.",
            },
          ],
        },
        {
          id: "cambios",
          heading: "10. Cambios en esta política",
          blocks: [
            {
              kind: "p",
              text: "Podemos actualizar esta política para reflejar cambios en el servicio o en la normativa aplicable. Publicaremos la versión vigente en esta página con su fecha de última actualización.",
            },
          ],
        },
        {
          id: "contacto",
          heading: "11. Contacto",
          blocks: [
            {
              kind: "p",
              text: `Para cualquier consulta o solicitud relacionada con tus datos personales, escríbenos a ${SUPPORT_EMAIL}. Respondemos en un plazo de hasta 48 horas hábiles.`,
            },
          ],
        },
      ],
    },

    en: {
      title: "Privacy Policy",
      subtitle:
        "What data we collect, what we use it for, who we share it with and what you can do about it.",
      sections: [
        {
          id: "responsable",
          heading: "1. Who processes your data",
          blocks: [
            {
              kind: "p",
              text: `The controller of your personal data is ${OPERATOR_NAME}, domiciled in Bolivia, operator of PromptForge (the "Site").`,
            },
            {
              kind: "p",
              text: `For any question about this policy you can write to us at ${SUPPORT_EMAIL}.`,
            },
          ],
        },
        {
          id: "datos",
          heading: "2. What data we collect",
          blocks: [
            {
              kind: "p",
              text: "We collect only the data needed to operate the Site:",
            },
            {
              kind: "ul",
              items: [
                "Account data: email address, name or username.",
                "Password: always stored hashed with irreversible algorithms. We never see it and cannot recover it in plain text.",
                "If you sign up with Google: the account identifier, email address and public profile picture that Google provides. We do not access your Google password or other data in that account.",
                "Usage data: AI credit balance, rays, published prompts, support received and AI tools used.",
                "Payment data: when you subscribe to Premium by QR, the reference and status of the request. We do not receive or store card numbers, bank accounts or financial credentials.",
                "Technical data: IP address and user agent, logged for security, abuse prevention and error diagnosis.",
              ],
            },
          ],
        },
        {
          id: "uso",
          heading: "3. What we use your data for",
          blocks: [
            {
              kind: "ul",
              items: [
                "Creating and managing your account and letting you sign in.",
                "Providing the service: publishing prompts, using the AI tools and managing your credits and rays.",
                "Processing and verifying the manual Premium payment and activating the subscription.",
                "Moderating published content and enforcing the Terms of Use.",
                "Protecting the Site against fraud, abuse and unauthorised access.",
                "Sending you operational notices about your account or the service.",
                "Complying with legal obligations applicable to us.",
              ],
            },
            {
              kind: "p",
              text: "We do not use your data to build advertising profiles and we do not sell it to third parties.",
            },
          ],
        },
        {
          id: "terceros",
          heading: "4. Who we share your data with",
          blocks: [
            {
              kind: "p",
              text: "We do not sell your personal data. We share it only with the providers that make the service possible:",
            },
            {
              kind: "ul",
              items: [
                "Supabase: hosting of the database where account information resides.",
                "Vercel: hosting and infrastructure for the Site, and storage of uploaded files (Vercel Blob).",
                "Google: if you choose to sign in with Google, to authenticate your identity.",
                "DeepSeek: processing of the texts you submit to the AI tools and to the content moderation systems.",
              ],
            },
            {
              kind: "p",
              text: "These providers may process data outside Bolivia. By using the Site you accept that your data is processed in the locations where these services operate.",
            },
            {
              kind: "p",
              text: "We may also disclose data where there is a legal obligation or a valid request from a competent authority.",
            },
          ],
        },
        {
          id: "derechos",
          heading: "5. Your rights",
          blocks: [
            {
              kind: "p",
              text: "You may exercise the following rights over your personal data:",
            },
            {
              kind: "ul",
              items: [
                "Access: to know what data of yours we process.",
                "Rectification: to correct inaccurate or incomplete data.",
                "Erasure: to request deletion of your data and your account.",
                "Portability: to receive your data in a structured, commonly used format.",
                "Objection and restriction: to object to certain processing or ask for it to be restricted.",
              ],
            },
            {
              kind: "p",
              text: `To exercise them, write to us at ${SUPPORT_EMAIL} from the address associated with your account. We reply within 48 business hours.`,
            },
            {
              kind: "p",
              text: "Deleting your account is irreversible and entails the loss of published prompts, AI credits, rays and any active Premium, with no right to a refund.",
            },
          ],
        },
        {
          id: "cookies",
          heading: "6. Cookies",
          blocks: [
            {
              kind: "p",
              text: "We use only technical cookies, necessary for the Site to work: the session cookie and cross-site request forgery (CSRF) protection cookies, plus the cookie that remembers the language you choose on the legal pages.",
            },
            {
              kind: "p",
              text: "We do not use advertising, analytics or cross-site tracking cookies. You can find the details in our Cookie Policy.",
            },
          ],
        },
        {
          id: "retencion",
          heading: "7. How long we keep data",
          blocks: [
            {
              kind: "p",
              text: "We keep your account data while the account remains active. If you request deletion, we erase it within a reasonable period, except for what we must retain to comply with legal obligations, resolve disputes or prevent fraud.",
            },
            {
              kind: "p",
              text: "Technical logs (IP and user agent) are kept for a limited period and are deleted or anonymised once they are no longer needed for the security purposes described.",
            },
          ],
        },
        {
          id: "menores",
          heading: "8. Minors",
          blocks: [
            {
              kind: "p",
              text: "The Site is prohibited for anyone under 18. We do not knowingly collect data from minors. If we detect an account belonging to a minor, we will delete it together with its data.",
            },
          ],
        },
        {
          id: "seguridad",
          heading: "9. Security",
          blocks: [
            {
              kind: "p",
              text: "We apply reasonable technical and organisational measures to protect your data: password hashing, encrypted connections and access control over the database. No system is completely secure, so we cannot guarantee absolute security.",
            },
          ],
        },
        {
          id: "cambios",
          heading: "10. Changes to this policy",
          blocks: [
            {
              kind: "p",
              text: "We may update this policy to reflect changes in the service or in applicable regulations. We will publish the current version on this page with its last-updated date.",
            },
          ],
        },
        {
          id: "contacto",
          heading: "11. Contact",
          blocks: [
            {
              kind: "p",
              text: `For any question or request relating to your personal data, write to us at ${SUPPORT_EMAIL}. We reply within 48 business hours.`,
            },
          ],
        },
      ],
    },
  };
}
