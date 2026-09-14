import {
  OPERATOR_NAME,
  SUPPORT_EMAIL,
  type LegalContext,
  type LegalDocPair,
} from "./types";

/**
 * Política de reembolso.
 *
 * Describe únicamente el flujo de pago real: el QR boliviano verificado a mano.
 * Las rutas de Stripe que siguen en el repositorio no son accesibles desde
 * ninguna pantalla del Sitio, así que no se mencionan aquí.
 */
export function refunds(ctx: LegalContext): LegalDocPair {
  const usd = ctx.priceUsd.toFixed(2);
  const bob = ctx.priceBob;

  return {
    es: {
      title: "Política de Reembolso",
      subtitle:
        "Cómo funciona el pago de Premium y en qué casos podemos devolverte el dinero.",
      notice:
        "Al ser un servicio digital de acceso inmediato, los pagos de Premium no son reembolsables una vez activados. Las excepciones se detallan más abajo.",
      sections: [
        {
          id: "como-se-paga",
          heading: "1. Cómo se paga Premium",
          blocks: [
            {
              kind: "p",
              text: `PromptForge Premium cuesta ${usd} dólares estadounidenses (US$ ${usd}) al mes, equivalentes con carácter aproximado a Bs ${bob} al tipo de cambio aplicado en el momento de la compra.`,
            },
            {
              kind: "p",
              text: "El pago se realiza de forma manual mediante transferencia a un código QR boliviano. Tú transfieres el importe, confirmas la solicitud desde el Sitio y nuestro equipo verifica la recepción del pago para activar la suscripción.",
            },
            {
              kind: "p",
              text: "La suscripción se activa por un mes y no se renueva automáticamente: no hay cobros recurrentes ni débitos automáticos.",
            },
          ],
        },
        {
          id: "no-reembolsable",
          heading: "2. Regla general: no hay reembolsos tras la activación",
          blocks: [
            {
              kind: "p",
              text: "Una vez activado el Premium, el pago no es reembolsable. El motivo es doble: se trata de contenido y servicios digitales de acceso inmediato, y de pagos manuales entre personas que no pueden revertirse automáticamente.",
            },
            {
              kind: "p",
              text: "Esto significa que no reembolsamos, entre otros casos: que hayas dejado de usar el Sitio, que no hayas aprovechado todos los créditos IA del mes, o que un prompt o una herramienta de IA no haya producido el resultado que esperabas.",
            },
          ],
        },
        {
          id: "excepciones",
          heading: "3. Excepciones: cuándo sí devolvemos el dinero",
          blocks: [
            {
              kind: "p",
              text: "Sí evaluaremos favorablemente un reembolso cuando el problema sea atribuible a nosotros:",
            },
            {
              kind: "ul",
              items: [
                "Pagaste y el Premium nunca se activó, y no pudimos resolverlo.",
                "Se te cobró dos veces por error (por ejemplo, por pagar dos veces el mismo periodo).",
                "Activamos el servicio de forma errónea, o el importe transferido no corresponde al precio mostrado en el Sitio.",
                "Un fallo técnico imputable a PromptForge te impidió usar el servicio durante la totalidad del periodo contratado.",
              ],
            },
            {
              kind: "p",
              text: "En estos casos devolvemos el importe íntegro del periodo afectado.",
            },
          ],
        },
        {
          id: "como-solicitar",
          heading: "4. Cómo solicitar un reembolso",
          blocks: [
            {
              kind: "p",
              text: `Escríbenos a ${SUPPORT_EMAIL} desde la dirección de correo asociada a tu cuenta, indicando:`,
            },
            {
              kind: "ol",
              items: [
                "El correo electrónico o nombre de usuario de tu cuenta.",
                "La fecha del pago y el importe transferido.",
                "El número de referencia o comprobante de la transferencia.",
                "Una descripción breve del problema.",
              ],
            },
            {
              kind: "p",
              text: "Podemos pedirte información adicional para verificar el pago antes de resolver la solicitud.",
            },
          ],
        },
        {
          id: "plazo",
          heading: "5. Plazo de resolución",
          blocks: [
            {
              kind: "p",
              text: "Acusamos recibo de tu solicitud y la resolvemos en un plazo de hasta 15 días hábiles desde que recibimos toda la información necesaria.",
            },
            {
              kind: "p",
              text: "Si la solicitud se aprueba, el reembolso se realiza por el mismo medio por el que pagaste, en un plazo razonable. Los tiempos de acreditación dependen de tu entidad financiera, no de nosotros.",
            },
          ],
        },
        {
          id: "ley-aplicable",
          heading: "6. Legislación aplicable",
          blocks: [
            {
              kind: "p",
              text: `Esta política se interpreta conforme a la legislación del Estado Plurinacional de Bolivia en materia de protección al consumidor, y se aplica sin perjuicio de los derechos que esa normativa reconozca al usuario. El responsable es ${OPERATOR_NAME}, con domicilio en Bolivia.`,
            },
            {
              kind: "p",
              text: "Si consideras que tu solicitud no fue atendida correctamente, puedes acudir a las instancias de defensa del consumidor que correspondan en Bolivia.",
            },
          ],
        },
        {
          id: "contacto",
          heading: "7. Contacto",
          blocks: [
            {
              kind: "p",
              text: `Para cualquier consulta sobre pagos o reembolsos, escríbenos a ${SUPPORT_EMAIL}. Respondemos en un plazo de hasta 48 horas hábiles.`,
            },
          ],
        },
      ],
    },

    en: {
      title: "Refund Policy",
      subtitle:
        "How Premium payment works and in which cases we can return your money.",
      notice:
        "As a digital service with immediate access, Premium payments are non-refundable once activated. The exceptions are set out below.",
      sections: [
        {
          id: "como-se-paga",
          heading: "1. How Premium is paid",
          blocks: [
            {
              kind: "p",
              text: `PromptForge Premium costs ${usd} United States dollars (US$ ${usd}) per month, approximately equivalent to Bs ${bob} at the exchange rate applied at the time of purchase.`,
            },
            {
              kind: "p",
              text: "Payment is made manually by transfer to a Bolivian QR code. You transfer the amount, confirm the request from the Site, and our team verifies receipt of the payment in order to activate the subscription.",
            },
            {
              kind: "p",
              text: "The subscription is activated for one month and does not renew automatically: there are no recurring charges or automatic debits.",
            },
          ],
        },
        {
          id: "no-reembolsable",
          heading: "2. General rule: no refunds after activation",
          blocks: [
            {
              kind: "p",
              text: "Once Premium is activated, the payment is non-refundable. The reason is twofold: this concerns digital content and services with immediate access, and manual payments between people that cannot be reversed automatically.",
            },
            {
              kind: "p",
              text: "This means we do not refund, among other cases: that you stopped using the Site, that you did not use all of the month's AI credits, or that a prompt or AI tool did not produce the result you expected.",
            },
          ],
        },
        {
          id: "excepciones",
          heading: "3. Exceptions: when we do refund",
          blocks: [
            {
              kind: "p",
              text: "We will look favourably on a refund when the problem is attributable to us:",
            },
            {
              kind: "ul",
              items: [
                "You paid and Premium was never activated, and we could not resolve it.",
                "You were charged twice by mistake (for example, by paying for the same period twice).",
                "We activated the service incorrectly, or the amount transferred does not match the price displayed on the Site.",
                "A technical failure attributable to PromptForge prevented you from using the service for the entire contracted period.",
              ],
            },
            {
              kind: "p",
              text: "In these cases we refund the full amount of the affected period.",
            },
          ],
        },
        {
          id: "como-solicitar",
          heading: "4. How to request a refund",
          blocks: [
            {
              kind: "p",
              text: `Write to us at ${SUPPORT_EMAIL} from the email address associated with your account, stating:`,
            },
            {
              kind: "ol",
              items: [
                "The email address or username of your account.",
                "The date of payment and the amount transferred.",
                "The reference number or receipt of the transfer.",
                "A brief description of the problem.",
              ],
            },
            {
              kind: "p",
              text: "We may ask for additional information to verify the payment before resolving the request.",
            },
          ],
        },
        {
          id: "plazo",
          heading: "5. Resolution timeframe",
          blocks: [
            {
              kind: "p",
              text: "We acknowledge receipt of your request and resolve it within up to 15 business days from receiving all necessary information.",
            },
            {
              kind: "p",
              text: "If the request is approved, the refund is made by the same means you used to pay, within a reasonable period. Crediting times depend on your financial institution, not on us.",
            },
          ],
        },
        {
          id: "ley-aplicable",
          heading: "6. Governing law",
          blocks: [
            {
              kind: "p",
              text: `This policy is interpreted in accordance with the consumer protection legislation of the Plurinational State of Bolivia, and applies without prejudice to the rights that such rules grant to users. The responsible party is ${OPERATOR_NAME}, domiciled in Bolivia.`,
            },
            {
              kind: "p",
              text: "If you consider that your request was not handled correctly, you may turn to the appropriate consumer protection bodies in Bolivia.",
            },
          ],
        },
        {
          id: "contacto",
          heading: "7. Contact",
          blocks: [
            {
              kind: "p",
              text: `For any question about payments or refunds, write to us at ${SUPPORT_EMAIL}. We reply within 48 business hours.`,
            },
          ],
        },
      ],
    },
  };
}
