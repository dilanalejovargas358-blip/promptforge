import {
  SUPPORT_EMAIL,
  type LegalContext,
  type LegalDocPair,
} from "./types";

/** Política de cookies. No cita precios, así que ignora el contexto. */
export function cookiesPolicy(_ctx: LegalContext): LegalDocPair {
  return {
    es: {
      title: "Política de Cookies",
      subtitle:
        "Usamos muy pocas cookies y ninguna sirve para rastrearte. Aquí está el detalle.",
      notice:
        "PromptForge no usa cookies de publicidad, de análisis ni de seguimiento entre sitios.",
      sections: [
        {
          id: "que-son",
          heading: "1. Qué son las cookies",
          blocks: [
            {
              kind: "p",
              text: "Las cookies son pequeños archivos de texto que un sitio web guarda en tu navegador. Sirven para que el sitio recuerde información entre una página y otra, como si has iniciado sesión.",
            },
            {
              kind: "p",
              text: "Además de cookies, el Sitio puede usar almacenamiento local del navegador con finalidades técnicas similares. Esta política cubre ambos casos.",
            },
          ],
        },
        {
          id: "cuales-usamos",
          heading: "2. Cuáles usamos",
          blocks: [
            {
              kind: "p",
              text: "Usamos únicamente cookies técnicas, es decir, las imprescindibles para que el Sitio funcione. No puedes desactivarlas sin dejar de usar el servicio.",
            },
            {
              kind: "ul",
              items: [
                "Cookie de sesión de NextAuth: identifica tu sesión una vez que inicias sesión. Sin ella, el Sitio te trataría como visitante anónimo en cada página.",
                "Cookies de protección CSRF: evitan que terceros puedan enviar peticiones en tu nombre aprovechando tu sesión abierta.",
                "Cookie de idioma («locale»): recuerda si elegiste español o inglés en las páginas legales. Dura un año.",
              ],
            },
          ],
        },
        {
          id: "no-tracking",
          heading: "3. Lo que NO hacemos",
          blocks: [
            {
              kind: "ul",
              items: [
                "No usamos cookies de publicidad ni de remarketing.",
                "No usamos cookies de análisis de terceros para medir tu comportamiento.",
                "No te rastreamos entre distintos sitios web.",
                "No vendemos ni compartimos datos de navegación con anunciantes.",
              ],
            },
          ],
        },
        {
          id: "desactivar",
          heading: "4. Cómo desactivarlas",
          blocks: [
            {
              kind: "p",
              text: "Puedes borrar o bloquear las cookies desde la configuración de tu navegador (Chrome, Firefox, Safari, Edge y otros ofrecen esta opción en sus ajustes de privacidad).",
            },
            {
              kind: "p",
              text: "Ten en cuenta que si bloqueas las cookies de sesión no podrás iniciar sesión ni usar la mayoría de las funciones del Sitio. Si bloqueas solo la cookie de idioma, las páginas legales volverán al español.",
            },
          ],
        },
        {
          id: "contacto",
          heading: "5. Contacto",
          blocks: [
            {
              kind: "p",
              text: `Si tienes dudas sobre esta política, escríbenos a ${SUPPORT_EMAIL}. Respondemos en un plazo de hasta 48 horas hábiles.`,
            },
          ],
        },
      ],
    },

    en: {
      title: "Cookie Policy",
      subtitle:
        "We use very few cookies and none of them exist to track you. Here is the detail.",
      notice:
        "PromptForge does not use advertising, analytics or cross-site tracking cookies.",
      sections: [
        {
          id: "que-son",
          heading: "1. What cookies are",
          blocks: [
            {
              kind: "p",
              text: "Cookies are small text files that a website stores in your browser. They let the site remember information from one page to the next, such as whether you are signed in.",
            },
            {
              kind: "p",
              text: "In addition to cookies, the Site may use browser local storage for similar technical purposes. This policy covers both.",
            },
          ],
        },
        {
          id: "cuales-usamos",
          heading: "2. Which ones we use",
          blocks: [
            {
              kind: "p",
              text: "We use only technical cookies, meaning those essential for the Site to work. You cannot disable them without ceasing to use the service.",
            },
            {
              kind: "ul",
              items: [
                "NextAuth session cookie: identifies your session once you sign in. Without it, the Site would treat you as an anonymous visitor on every page.",
                "CSRF protection cookies: prevent third parties from sending requests on your behalf by exploiting your open session.",
                "Language cookie (\"locale\"): remembers whether you chose Spanish or English on the legal pages. It lasts one year.",
              ],
            },
          ],
        },
        {
          id: "no-tracking",
          heading: "3. What we do NOT do",
          blocks: [
            {
              kind: "ul",
              items: [
                "We do not use advertising or remarketing cookies.",
                "We do not use third-party analytics cookies to measure your behaviour.",
                "We do not track you across different websites.",
                "We do not sell or share browsing data with advertisers.",
              ],
            },
          ],
        },
        {
          id: "desactivar",
          heading: "4. How to disable them",
          blocks: [
            {
              kind: "p",
              text: "You can delete or block cookies from your browser settings (Chrome, Firefox, Safari, Edge and others offer this option in their privacy settings).",
            },
            {
              kind: "p",
              text: "Note that if you block session cookies you will not be able to sign in or use most features of the Site. If you block only the language cookie, the legal pages will revert to Spanish.",
            },
          ],
        },
        {
          id: "contacto",
          heading: "5. Contact",
          blocks: [
            {
              kind: "p",
              text: `If you have questions about this policy, write to us at ${SUPPORT_EMAIL}. We reply within 48 business hours.`,
            },
          ],
        },
      ],
    },
  };
}
