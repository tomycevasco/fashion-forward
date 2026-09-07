/* ============================================================
   FASHION FORWARD — CONFIGURACION GLOBAL
   ------------------------------------------------------------
   ESTE ES EL UNICO ARCHIVO QUE TENES QUE TOCAR PARA CONFIGURAR
   EL SITIO. Cambia estos valores y listo, aplica a todo el sitio.
   ============================================================ */

window.FF_CONFIG = {

  /* ---------- 1. WHATSAPP ----------
     Formato internacional SIN el "+", SIN el 0 de area y SIN el 15.
     Ej: celular 11 5555-4444 de Buenos Aires  ->  "5491155554444"        */
  WHATSAPP_NUMBER: '5491169562789',

  // Mensaje del boton flotante (todas las paginas menos el carrito)
  WHATSAPP_MESSAGE: '¡Hola! Quería consultar sobre sus productos.',

  /* ---------- 2. MERCADO PAGO ----------
     Por ahora no hay backend. Si dejas el valor en null, el boton
     "Pagar con Mercado Pago" abre un modal de "Proximamente".
     Cuando tengas el link de pago / checkout, pegalo aca y el boton
     pasa a redirigir automaticamente.                                    */
  MERCADOPAGO_LINK: null,             // ej: 'https://mpago.la/xxxxxxx'

  /* ---------- 3. FORMULARIO DE CONTACTO ----------
     Sin backend, el form muestra una confirmacion en pantalla.
     Para conectarlo de verdad, crea un form en Formspree (formspree.io)
     o EmailJS y pega la URL del endpoint aca. El JS ya hace el POST.     */
  CONTACT_FORM_ENDPOINT: null,        // ej: 'https://formspree.io/f/xxxxxxx'

  /* ---------- 4. DATOS DE CONTACTO / REDES (footer) ---------- */
  CONTACTO: {
    email: 'hola@fashionforward.com.ar',
    telefono: '+54 9 11 6956-2789',
    direccion: 'Showroom con cita previa — Buenos Aires, Argentina',
    horario: 'Lun a Vie 10 a 19 h · Sáb 10 a 14 h'
  },
  REDES: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    tiktok: 'https://tiktok.com/'
  },

  /* ---------- 5. MARCAS ----------
     slug -> metadata. El slug tiene que coincidir con la carpeta
     (/furla, /bally, /liujo) y con la key del products.json.             */
  MARCAS: {
    furla: {
      nombre: 'Furla',
      claim: 'Marroquinería italiana desde 1927',
      descripcion: 'Cuero italiano, formas limpias y una paleta de tierras y camel. Piezas hechas para durar.',
      origen: 'Bologna, Italia'
    },
    bally: {
      nombre: 'Bally',
      claim: 'Quiet luxury suizo desde 1851',
      descripcion: 'Precisión suiza aplicada al calzado. Líneas sobrias, materiales nobles, cero estridencia.',
      origen: 'Schönenwerd, Suiza'
    },
    liujo: {
      nombre: 'Liu Jo',
      claim: 'Glamour italiano contemporáneo',
      descripcion: 'Femenino, brillante y con actitud. Ropa y accesorios para brillar todos los días.',
      origen: 'Módena, Italia'
    }
  },

  /* ---------- 6. RUTAS ---------- */
  DATA_URL: '/assets/data/products.json'
};
