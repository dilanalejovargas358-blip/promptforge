import {
  OPERATOR_NAME,
  SUPPORT_EMAIL,
  type LegalContext,
  type LegalDocPair,
} from "./types";

/**
 * Términos de uso. Recibe el contexto para poder citar el precio vigente sin
 * hardcodearlo: sale de la BD y es editable en /admin/config.
 */
export function terms(ctx: LegalContext): LegalDocPair {
  const usd = ctx.priceUsd.toFixed(2);
  const bob = ctx.priceBob;

  return {
    es: {
      title: "Términos de Uso",
      subtitle:
        "Las reglas que rigen el uso de PromptForge. Léelas antes de crear tu cuenta.",
      notice:
        "Este documento es un acuerdo legal entre tú y el operador de PromptForge. Al usar el Sitio lo aceptas en su totalidad.",
      sections: [
        {
          id: "aceptacion",
          heading: "1. Aceptación de estos términos",
          blocks: [
            {
              kind: "p",
              text: `Estos Términos de Uso (los «Términos») regulan el acceso y el uso de PromptForge (el «Sitio»), operado por ${OPERATOR_NAME}, con domicilio en Bolivia (el «Operador»).`,
            },
            {
              kind: "p",
              text: "Al crear una cuenta, acceder o utilizar el Sitio aceptas quedar vinculado por estos Términos en su totalidad. Si no estás de acuerdo con ellos, no debes usar el Sitio.",
            },
            {
              kind: "p",
              text: "Estos Términos se publican en español e inglés. En caso de discrepancia o duda de interpretación, prevalece la versión en español.",
            },
          ],
        },
        {
          id: "elegibilidad",
          heading: "2. Edad mínima: 18 años",
          blocks: [
            {
              kind: "p",
              text: "Debes tener al menos 18 años cumplidos para crear una cuenta y usar el Sitio. Al registrarte declaras y garantizas que cumples este requisito y que tienes capacidad legal para contratar.",
            },
            {
              kind: "p",
              text: "El Sitio no está dirigido a menores de edad. Si detectamos una cuenta perteneciente a una persona menor de 18 años, la eliminaremos junto con los datos asociados.",
            },
          ],
        },
        {
          id: "servicio",
          heading: "3. Descripción del servicio",
          blocks: [
            {
              kind: "p",
              text: "PromptForge es una plataforma que permite publicar, descubrir, compartir y apoyar prompts para herramientas de inteligencia artificial, así como utilizar herramientas de IA para generar, analizar y optimizar prompts.",
            },
            {
              kind: "p",
              text: "El Sitio es un espacio de intermediación. El Operador no es autor de los prompts publicados por los usuarios y no garantiza su calidad, exactitud, originalidad ni los resultados que produzcan. El uso de cualquier prompt es responsabilidad exclusiva de quien lo utiliza.",
            },
            {
              kind: "p",
              text: "El Sitio se ofrece «tal cual» y puede modificarse, limitarse, suspenderse o interrumpirse total o parcialmente en cualquier momento.",
            },
          ],
        },
        {
          id: "cuentas",
          heading: "4. Cuentas de usuario",
          blocks: [
            { kind: "p", text: "Respecto de tu cuenta, te comprometes a:" },
            {
              kind: "ul",
              items: [
                "Proporcionar datos veraces y mantenerlos actualizados.",
                "Mantener la confidencialidad de tu contraseña y responder por toda actividad realizada desde tu cuenta.",
                "Notificarnos de inmediato cualquier uso no autorizado o sospecha de acceso indebido.",
                "No crear cuentas de forma automatizada, ni ceder, vender, alquilar o compartir tu cuenta con terceros.",
              ],
            },
            {
              kind: "p",
              text: "Podemos suspender o cancelar cuentas que incumplan estos Términos o la legislación aplicable, sin que ello genere derecho a indemnización.",
            },
          ],
        },
        {
          id: "contenido",
          heading: "5. Contenido del usuario: propiedad y licencia",
          blocks: [
            {
              kind: "p",
              text: "Los prompts, textos, imágenes y demás contenidos que publiques (el «Contenido del Usuario») siguen siendo de tu propiedad. PromptForge no reclama la titularidad de tus prompts.",
            },
            {
              kind: "p",
              text: "Al publicar Contenido del Usuario otorgas a PromptForge una licencia mundial, no exclusiva, gratuita, transferible y sublicenciable para alojar, reproducir, mostrar públicamente, distribuir y adaptar técnicamente ese contenido, con la única finalidad de operar, mostrar y promocionar el Sitio. Esta licencia se extingue cuando eliminas el contenido, salvo en las copias de respaldo y registros que debamos conservar por obligaciones legales, de seguridad o de prevención de fraude.",
            },
            {
              kind: "p",
              text: "Declaras y garantizas que tienes todos los derechos necesarios sobre el Contenido del Usuario que publicas y que este no vulnera derechos de terceros ni ninguna norma aplicable.",
            },
            {
              kind: "p",
              text: "Nos reservamos el derecho de retirar cualquier contenido que incumpla estos Términos o la ley, sin que ello genere derecho a compensación alguna.",
            },
          ],
        },
        {
          id: "conducta",
          heading: "6. Conducta prohibida",
          blocks: [
            { kind: "p", text: "Queda expresamente prohibido:" },
            {
              kind: "ul",
              items: [
                "Publicar contenido ilegal, difamatorio, discriminatorio, violento, sexualmente explícito o que incite al odio.",
                "Publicar contenido que vulnere derechos de propiedad intelectual, industrial o de imagen de terceros.",
                "Publicar datos personales de terceros sin su consentimiento.",
                "Usar el Sitio para fraudes, estafas, suplantación de identidad o ingeniería social.",
                "Intentar vulnerar la seguridad del Sitio, acceder a cuentas ajenas o a áreas restringidas.",
                "Acceder de forma automatizada (bots, rastreadores) sin autorización escrita previa.",
                "Interferir con el funcionamiento del Sitio o sobrecargar su infraestructura.",
                "Emplear las herramientas de IA para generar cualquiera de los contenidos prohibidos en esta lista.",
              ],
            },
            {
              kind: "p",
              text: "El incumplimiento puede dar lugar a la retirada del contenido, a la suspensión o cierre de la cuenta y, cuando corresponda, a las acciones legales que procedan.",
            },
          ],
        },
        {
          id: "creditos",
          heading: "7. Créditos IA y rayitos",
          blocks: [
            {
              kind: "p",
              text: "PromptForge utiliza dos economías internas: los «créditos IA», que se consumen al usar las herramientas de inteligencia artificial, y los «rayitos», que se otorgan al apoyar prompts de otros usuarios.",
            },
            {
              kind: "p",
              text: "Los créditos IA y los rayitos no son dinero, ni moneda de curso legal, ni valores negociables, ni representan un derecho de crédito frente al Operador. No pueden comprarse, venderse, transferirse ni canjearse por dinero en efectivo. Son únicamente un mecanismo interno para repartir el uso del Sitio y no generan ningún derecho adquirido.",
            },
            {
              kind: "p",
              text: "Podemos ajustar los saldos, las cantidades que se otorgan y las reglas de regeneración de estas economías. Los rayitos se regeneran con el tiempo hasta un máximo acumulable, conforme a las reglas vigentes publicadas en el Sitio.",
            },
          ],
        },
        {
          id: "premium",
          heading: "8. Suscripción Premium",
          blocks: [
            {
              kind: "p",
              text: `El Sitio ofrece una suscripción opcional llamada «PromptForge Premium» por ${usd} dólares estadounidenses (US$ ${usd}) al mes, equivalentes con carácter aproximado a Bs ${bob} al tipo de cambio aplicado en el momento de la compra.`,
            },
            {
              kind: "p",
              text: "El pago se realiza de forma manual mediante un código QR boliviano. Debes transferir el importe indicado y confirmar la solicitud desde el Sitio. Una vez verificado el pago, activamos el Premium por un mes y acreditamos los créditos IA correspondientes.",
            },
            {
              kind: "p",
              text: "Al tratarse de un pago verificado manualmente, la activación no es instantánea: puede demorar hasta 15 minutos desde la confirmación y, en casos excepcionales, algo más. Si transcurrido ese plazo el Premium no se ha activado, escríbenos a " + SUPPORT_EMAIL + ".",
            },
            {
              kind: "p",
              text: "El precio y el tipo de cambio pueden actualizarse. El precio aplicable a tu compra es el que se mostraba en el Sitio en el momento en que realizaste el pago.",
            },
            {
              kind: "p",
              text: "El proceso de pago no recoge ni almacena datos bancarios: no guardamos números de tarjeta, cuentas ni credenciales financieras.",
            },
          ],
        },
        {
          id: "cancelacion",
          heading: "9. Cancelación y expiración",
          blocks: [
            {
              kind: "p",
              text: "La suscripción Premium no se renueva automáticamente. No existe cargo recurrente, débito automático ni cobro sorpresa.",
            },
            {
              kind: "p",
              text: "Al finalizar el mes contratado el Premium expira por sí solo y vuelves al plan gratuito. Para continuar con Premium debes realizar un nuevo pago de forma voluntaria.",
            },
            {
              kind: "p",
              text: "Puedes decidir no renovar simplemente no realizando un nuevo pago. Si prefieres cancelar antes del vencimiento, escríbenos y no volveremos a solicitar ningún pago.",
            },
          ],
        },
        {
          id: "reembolsos",
          heading: "10. Reembolsos",
          blocks: [
            {
              kind: "p",
              text: "Como regla general, los pagos de Premium no son reembolsables una vez activado el servicio, por tratarse de contenido y servicios digitales de acceso inmediato y de pagos manuales que no pueden revertirse automáticamente.",
            },
            {
              kind: "p",
              text: "No obstante, evaluaremos cualquier solicitud de reembolso conforme a la legislación boliviana aplicable en materia de protección al consumidor. Las condiciones y el procedimiento se detallan en nuestra Política de Reembolso.",
            },
          ],
        },
        {
          id: "propiedad-intelectual",
          heading: "11. Propiedad intelectual de PromptForge",
          blocks: [
            {
              kind: "p",
              text: "El nombre PromptForge, su logotipo, el diseño del Sitio, el código fuente, los textos institucionales y los elementos gráficos son titularidad del Operador o de sus licenciantes, y están protegidos por la normativa de propiedad intelectual e industrial.",
            },
            {
              kind: "p",
              text: "No puedes copiar, reproducir, modificar, distribuir, publicar ni explotar comercialmente estos elementos sin autorización escrita previa.",
            },
            {
              kind: "p",
              text: "La licencia que otorgas sobre tu Contenido del Usuario no te transfiere ningún derecho sobre la marca ni sobre el Sitio.",
            },
          ],
        },
        {
          id: "responsabilidad",
          heading: "12. Limitación de responsabilidad",
          blocks: [
            {
              kind: "p",
              text: "El Sitio se presta «tal cual» y «según disponibilidad», sin garantías de ningún tipo, expresas o implícitas, incluidas las de comerciabilidad, idoneidad para un fin concreto o ausencia de errores.",
            },
            {
              kind: "p",
              text: "No garantizamos la disponibilidad continua del Sitio, ni que los prompts publicados sean exactos, originales, seguros o aptos para tu finalidad, ni el resultado que puedas obtener de las herramientas de inteligencia artificial.",
            },
            {
              kind: "p",
              text: "En la máxima medida permitida por la ley boliviana, el Operador no será responsable de daños indirectos, incidentales, especiales, punitivos o consecuentes, ni de la pérdida de datos, beneficios, oportunidades de negocio o reputación.",
            },
            {
              kind: "p",
              text: "La responsabilidad total del Operador frente a ti, por cualquier causa relacionada con el Sitio, se limita al importe que hayas pagado a PromptForge en los tres meses anteriores al hecho que origine la reclamación.",
            },
            {
              kind: "p",
              text: "Nada en estos Términos excluye ni limita la responsabilidad que la legislación boliviana no permita excluir o limitar.",
            },
          ],
        },
        {
          id: "modificaciones",
          heading: "13. Modificación de los términos",
          blocks: [
            {
              kind: "p",
              text: "Podemos modificar estos Términos en cualquier momento. La versión vigente se publica en esta página con su fecha de última actualización.",
            },
            {
              kind: "p",
              text: "Si los cambios son sustanciales lo comunicaremos por los medios disponibles en el Sitio. El uso continuado del Sitio después de la entrada en vigor implica la aceptación de los nuevos Términos.",
            },
          ],
        },
        {
          id: "ley-aplicable",
          heading: "14. Ley aplicable y jurisdicción",
          blocks: [
            {
              kind: "p",
              text: "Estos Términos se rigen por las leyes del Estado Plurinacional de Bolivia.",
            },
            {
              kind: "p",
              text: "Cualquier controversia se someterá a los tribunales competentes de Bolivia, sin perjuicio de los derechos que la normativa de protección al consumidor reconozca al usuario.",
            },
          ],
        },
        {
          id: "contacto",
          heading: "15. Contacto",
          blocks: [
            {
              kind: "p",
              text: `Para consultas, reclamos o notificaciones relacionadas con estos Términos, escríbenos a ${SUPPORT_EMAIL}. Respondemos en un plazo de hasta 48 horas hábiles.`,
            },
          ],
        },
      ],
    },

    en: {
      title: "Terms of Use",
      subtitle:
        "The rules that govern your use of PromptForge. Please read them before creating your account.",
      notice:
        "This document is a legal agreement between you and the operator of PromptForge. By using the Site you accept it in full.",
      sections: [
        {
          id: "aceptacion",
          heading: "1. Acceptance of these terms",
          blocks: [
            {
              kind: "p",
              text: `These Terms of Use (the "Terms") govern access to and use of PromptForge (the "Site"), operated by ${OPERATOR_NAME}, domiciled in Bolivia (the "Operator").`,
            },
            {
              kind: "p",
              text: "By creating an account, accessing or using the Site you agree to be bound by these Terms in full. If you do not agree with them, you must not use the Site.",
            },
            {
              kind: "p",
              text: "These Terms are published in Spanish and English. In the event of any discrepancy or doubt as to interpretation, the Spanish version prevails.",
            },
          ],
        },
        {
          id: "elegibilidad",
          heading: "2. Minimum age: 18",
          blocks: [
            {
              kind: "p",
              text: "You must be at least 18 years old to create an account and use the Site. By registering you represent and warrant that you meet this requirement and have the legal capacity to enter into contracts.",
            },
            {
              kind: "p",
              text: "The Site is not directed at minors. If we detect an account belonging to a person under 18, we will delete it together with its associated data.",
            },
          ],
        },
        {
          id: "servicio",
          heading: "3. Description of the service",
          blocks: [
            {
              kind: "p",
              text: "PromptForge is a platform that lets you publish, discover, share and support prompts for artificial intelligence tools, as well as use AI tools to generate, analyse and optimise prompts.",
            },
            {
              kind: "p",
              text: "The Site is an intermediary space. The Operator is not the author of prompts published by users and does not guarantee their quality, accuracy, originality or the results they produce. Use of any prompt is the sole responsibility of the person using it.",
            },
            {
              kind: "p",
              text: "The Site is provided \"as is\" and may be modified, limited, suspended or discontinued in whole or in part at any time.",
            },
          ],
        },
        {
          id: "cuentas",
          heading: "4. User accounts",
          blocks: [
            { kind: "p", text: "With respect to your account, you agree to:" },
            {
              kind: "ul",
              items: [
                "Provide truthful information and keep it up to date.",
                "Keep your password confidential and remain responsible for all activity carried out from your account.",
                "Notify us immediately of any unauthorised use or suspected improper access.",
                "Not create accounts by automated means, nor assign, sell, rent or share your account with third parties.",
              ],
            },
            {
              kind: "p",
              text: "We may suspend or terminate accounts that breach these Terms or applicable law, without any right to compensation.",
            },
          ],
        },
        {
          id: "contenido",
          heading: "5. User content: ownership and licence",
          blocks: [
            {
              kind: "p",
              text: "The prompts, texts, images and other content you publish (the \"User Content\") remain your property. PromptForge does not claim ownership of your prompts.",
            },
            {
              kind: "p",
              text: "By publishing User Content you grant PromptForge a worldwide, non-exclusive, royalty-free, transferable and sublicensable licence to host, reproduce, publicly display, distribute and technically adapt that content, for the sole purpose of operating, displaying and promoting the Site. This licence ends when you delete the content, except for backup copies and records we must retain for legal, security or fraud-prevention obligations.",
            },
            {
              kind: "p",
              text: "You represent and warrant that you hold all necessary rights over the User Content you publish and that it does not infringe the rights of third parties or any applicable rule.",
            },
            {
              kind: "p",
              text: "We reserve the right to remove any content that breaches these Terms or the law, without any right to compensation.",
            },
          ],
        },
        {
          id: "conducta",
          heading: "6. Prohibited conduct",
          blocks: [
            { kind: "p", text: "The following are expressly prohibited:" },
            {
              kind: "ul",
              items: [
                "Publishing illegal, defamatory, discriminatory, violent, sexually explicit or hate-inciting content.",
                "Publishing content that infringes the intellectual property, industrial property or image rights of third parties.",
                "Publishing personal data of third parties without their consent.",
                "Using the Site for fraud, scams, identity theft or social engineering.",
                "Attempting to breach the Site's security, access other users' accounts or reach restricted areas.",
                "Accessing by automated means (bots, crawlers) without prior written authorisation.",
                "Interfering with the operation of the Site or overloading its infrastructure.",
                "Using the AI tools to generate any of the content prohibited in this list.",
              ],
            },
            {
              kind: "p",
              text: "Breach may result in removal of the content, suspension or closure of the account and, where applicable, appropriate legal action.",
            },
          ],
        },
        {
          id: "creditos",
          heading: "7. AI credits and rays",
          blocks: [
            {
              kind: "p",
              text: "PromptForge uses two internal economies: \"AI credits\", which are spent when using the artificial intelligence tools, and \"rays\", which are granted when supporting other users' prompts.",
            },
            {
              kind: "p",
              text: "AI credits and rays are not money, legal tender, negotiable instruments, nor do they represent any claim against the Operator. They cannot be bought, sold, transferred or exchanged for cash. They are solely an internal mechanism for allocating use of the Site and confer no vested rights.",
            },
            {
              kind: "p",
              text: "We may adjust balances, the amounts granted and the regeneration rules of these economies. Rays regenerate over time up to a maximum accumulating balance, in accordance with the rules published on the Site.",
            },
          ],
        },
        {
          id: "premium",
          heading: "8. Premium subscription",
          blocks: [
            {
              kind: "p",
              text: `The Site offers an optional subscription called "PromptForge Premium" for ${usd} United States dollars (US$ ${usd}) per month, approximately equivalent to Bs ${bob} at the exchange rate applied at the time of purchase.`,
            },
            {
              kind: "p",
              text: "Payment is made manually via a Bolivian QR code. You must transfer the indicated amount and then confirm the request from the Site. Once the payment is verified, we activate Premium for one month and credit the corresponding AI credits.",
            },
            {
              kind: "p",
              text: "Because this is a manually verified payment, activation is not instant: it may take up to 15 minutes from confirmation and, in exceptional cases, longer. If Premium has not been activated after that period, write to us at " + SUPPORT_EMAIL + ".",
            },
            {
              kind: "p",
              text: "The price and exchange rate may be updated. The price applicable to your purchase is the one displayed on the Site at the moment you made the payment.",
            },
            {
              kind: "p",
              text: "The payment process does not collect or store banking data: we do not keep card numbers, account numbers or financial credentials.",
            },
          ],
        },
        {
          id: "cancelacion",
          heading: "9. Cancellation and expiry",
          blocks: [
            {
              kind: "p",
              text: "The Premium subscription does not renew automatically. There is no recurring charge, automatic debit or surprise billing.",
            },
            {
              kind: "p",
              text: "At the end of the contracted month Premium expires on its own and you return to the free plan. To continue with Premium you must make a new payment voluntarily.",
            },
            {
              kind: "p",
              text: "You may choose not to renew simply by not making a new payment. If you prefer to cancel before expiry, write to us and we will not request any further payment.",
            },
          ],
        },
        {
          id: "reembolsos",
          heading: "10. Refunds",
          blocks: [
            {
              kind: "p",
              text: "As a general rule, Premium payments are non-refundable once the service has been activated, as they concern digital content and services with immediate access and manual payments that cannot be reversed automatically.",
            },
            {
              kind: "p",
              text: "Nevertheless, we will assess any refund request in accordance with applicable Bolivian consumer protection law. The conditions and procedure are set out in our Refund Policy.",
            },
          ],
        },
        {
          id: "propiedad-intelectual",
          heading: "11. PromptForge intellectual property",
          blocks: [
            {
              kind: "p",
              text: "The PromptForge name, its logo, the Site design, the source code, institutional texts and graphic elements are owned by the Operator or its licensors and are protected by intellectual and industrial property law.",
            },
            {
              kind: "p",
              text: "You may not copy, reproduce, modify, distribute, publish or commercially exploit these elements without prior written authorisation.",
            },
            {
              kind: "p",
              text: "The licence you grant over your User Content does not transfer any right over the brand or the Site to you.",
            },
          ],
        },
        {
          id: "responsabilidad",
          heading: "12. Limitation of liability",
          blocks: [
            {
              kind: "p",
              text: "The Site is provided \"as is\" and \"as available\", without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose or freedom from errors.",
            },
            {
              kind: "p",
              text: "We do not guarantee continuous availability of the Site, nor that published prompts are accurate, original, safe or fit for your purpose, nor any result you may obtain from the artificial intelligence tools.",
            },
            {
              kind: "p",
              text: "To the maximum extent permitted by Bolivian law, the Operator shall not be liable for indirect, incidental, special, punitive or consequential damages, nor for loss of data, profits, business opportunities or reputation.",
            },
            {
              kind: "p",
              text: "The Operator's total liability to you, for any cause related to the Site, is limited to the amount you have paid to PromptForge in the three months preceding the event giving rise to the claim.",
            },
            {
              kind: "p",
              text: "Nothing in these Terms excludes or limits any liability that Bolivian law does not permit to be excluded or limited.",
            },
          ],
        },
        {
          id: "modificaciones",
          heading: "13. Changes to the terms",
          blocks: [
            {
              kind: "p",
              text: "We may modify these Terms at any time. The current version is published on this page with its last-updated date.",
            },
            {
              kind: "p",
              text: "If the changes are substantial we will announce them through the channels available on the Site. Continued use of the Site after they take effect constitutes acceptance of the new Terms.",
            },
          ],
        },
        {
          id: "ley-aplicable",
          heading: "14. Governing law and jurisdiction",
          blocks: [
            {
              kind: "p",
              text: "These Terms are governed by the laws of the Plurinational State of Bolivia.",
            },
            {
              kind: "p",
              text: "Any dispute shall be submitted to the competent courts of Bolivia, without prejudice to the rights that consumer protection rules grant to users.",
            },
          ],
        },
        {
          id: "contacto",
          heading: "15. Contact",
          blocks: [
            {
              kind: "p",
              text: `For questions, claims or notices relating to these Terms, write to us at ${SUPPORT_EMAIL}. We reply within 48 business hours.`,
            },
          ],
        },
      ],
    },
  };
}
