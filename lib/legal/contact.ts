import {
  OPERATOR_NAME,
  SUPPORT_EMAIL,
  type LegalContext,
  type LegalDocPair,
} from "./types";

/** Página de contacto. No cita precios, así que ignora el contexto. */
export function contact(_ctx: LegalContext): LegalDocPair {
  return {
    es: {
      title: "Contacto",
      subtitle:
        "Escríbenos y te respondemos en un plazo de hasta 48 horas hábiles.",
      sections: [
        {
          id: "soporte",
          heading: "1. Correo de soporte",
          blocks: [
            {
              kind: "p",
              text: `Nuestro único canal de atención es el correo electrónico: ${SUPPORT_EMAIL}.`,
            },
            {
              kind: "p",
              text: "Escríbenos siempre desde la dirección asociada a tu cuenta de PromptForge. Así podemos identificar tu caso sin pedirte datos adicionales y evitamos que alguien pueda hacerse pasar por ti.",
            },
          ],
        },
        {
          id: "tiempo",
          heading: "2. Tiempo de respuesta",
          blocks: [
            {
              kind: "p",
              text: "Respondemos en un plazo de hasta 48 horas hábiles. Los mensajes recibidos en fin de semana o en feriados en Bolivia se atienden a partir del siguiente día hábil.",
            },
            {
              kind: "p",
              text: "Si escribes por un problema de activación de Premium, revisamos tu caso con prioridad.",
            },
          ],
        },
        {
          id: "temas",
          heading: "3. En qué podemos ayudarte",
          blocks: [
            {
              kind: "ul",
              items: [
                "Problemas para iniciar sesión o recuperar tu cuenta.",
                "Créditos IA o rayitos que no cuadran con tu actividad.",
                "Pagos de Premium: activación, verificación o reembolsos.",
                "Reportar un prompt que incumple los Términos de Uso.",
                "Ejercer tus derechos de privacidad (acceso, rectificación, eliminación o portabilidad).",
                "Cualquier duda sobre los Términos de Uso, la Privacidad o las Cookies.",
              ],
            },
            {
              kind: "p",
              text: "Para agilizar la respuesta, incluye tu nombre de usuario y, si el caso lo requiere, la fecha del pago y su comprobante.",
            },
          ],
        },
        {
          id: "reportar",
          heading: "4. Reportar contenido o abuso",
          blocks: [
            {
              kind: "p",
              text: "Si encuentras un prompt que infringe derechos de autor, contiene datos personales de terceros o incumple los Términos de Uso, escríbenos indicando el enlace del prompt y el motivo. Revisamos todos los reportes y retiramos el contenido cuando corresponde.",
            },
          ],
        },
        {
          id: "responsable",
          heading: "5. Responsable del servicio",
          blocks: [
            {
              kind: "p",
              text: `PromptForge es operado por ${OPERATOR_NAME}, con domicilio en Bolivia.`,
            },
            {
              kind: "p",
              text: "No contamos con atención presencial ni telefónica: toda la comunicación se gestiona por correo electrónico, lo que nos permite dejar constancia de cada caso.",
            },
          ],
        },
      ],
    },

    en: {
      title: "Contact",
      subtitle: "Write to us and we will reply within 48 business hours.",
      sections: [
        {
          id: "soporte",
          heading: "1. Support email",
          blocks: [
            {
              kind: "p",
              text: `Our only support channel is email: ${SUPPORT_EMAIL}.`,
            },
            {
              kind: "p",
              text: "Always write to us from the address associated with your PromptForge account. That way we can identify your case without asking for additional information and we prevent anyone from impersonating you.",
            },
          ],
        },
        {
          id: "tiempo",
          heading: "2. Response time",
          blocks: [
            {
              kind: "p",
              text: "We reply within 48 business hours. Messages received on weekends or Bolivian public holidays are handled from the next business day.",
            },
            {
              kind: "p",
              text: "If you are writing about a Premium activation problem, we review your case as a priority.",
            },
          ],
        },
        {
          id: "temas",
          heading: "3. How we can help",
          blocks: [
            {
              kind: "ul",
              items: [
                "Problems signing in or recovering your account.",
                "AI credits or rays that do not match your activity.",
                "Premium payments: activation, verification or refunds.",
                "Reporting a prompt that breaches the Terms of Use.",
                "Exercising your privacy rights (access, rectification, erasure or portability).",
                "Any question about the Terms of Use, Privacy or Cookies.",
              ],
            },
            {
              kind: "p",
              text: "To speed up our reply, include your username and, where relevant, the payment date and its receipt.",
            },
          ],
        },
        {
          id: "reportar",
          heading: "4. Reporting content or abuse",
          blocks: [
            {
              kind: "p",
              text: "If you find a prompt that infringes copyright, contains personal data of third parties or breaches the Terms of Use, write to us with the prompt link and the reason. We review every report and remove the content where appropriate.",
            },
          ],
        },
        {
          id: "responsable",
          heading: "5. Service operator",
          blocks: [
            {
              kind: "p",
              text: `PromptForge is operated by ${OPERATOR_NAME}, domiciled in Bolivia.`,
            },
            {
              kind: "p",
              text: "We do not offer in-person or telephone support: all communication is handled by email, which lets us keep a record of every case.",
            },
          ],
        },
      ],
    },
  };
}
