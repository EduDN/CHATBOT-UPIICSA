import { pipeline, cos_sim } from "@xenova/transformers";

import type { AnsweringStrategy } from "../answering-strategy";

// You can move your knowledge base here or import it from another file
const knowledge_base = [
  {
    question: "Hay fechas estipuladas para hacer las prácticas profesionales?",
    answer:
      "No, no hay fechas estipuladas. Puedes iniciar tus prácticas profesionales en cualquier momento, siempre y cuando el trámite se realice con fechas actuales al inicio de las mismas. No se aceptan horas retroactivas. ",
  },
  {
    question:
      "¿Qué documentos necesito para realizar mis prácticas profesionales?",
    answer:
      "Para registrar tus prácticas profesionales, debes enviar en formato PDF al correo practicas_upiicsa@ipn.mx los siguientes documentos: Constancia de créditos, Cédula de registro, Constancia de vigencia de derechos de tu seguro médico (IMSS, ISSSTE, etc.), captura de pantalla del registro de la empresa y de tu registro como alumno en la plataforma SISAE-SIBOLTRA, y una copia de tu horario de clases si eres alumno inscrito. ",
  },
  {
    question:
      "Para titularme tengo que hacer tanto servicio social como prácticas profesionales ¿o es solo una?",
    answer:
      "El Servicio Social es un requisito general y obligatorio para todas las opciones de titulación. Las Prácticas Profesionales, por otro lado, son una de las nueve opciones de titulación disponibles; no son un requisito obligatorio para todas las demás modalidades. Por lo tanto, debes completar obligatoriamente el Servicio Social, y puedes elegir titularte mediante la opción de Práctica Profesional si cumples los requisitos. ",
  },
  {
    question: "Requisitos para tramitar el servicio social",
    answer:
      "Para iniciar tu servicio social necesitas: ser alumno inscrito o egresado, tener cubierto como mínimo el 70% de los créditos de tu carrera, contar con una constancia de vigencia de derechos de tu servicio médico (IMSS, ISSSTE, etc.) y presentar tu CURP actualizado. ",
  },
  {
    question: "Explicación de la titulación por currícula.",
    answer:
      "La titulación por currícula consiste en acreditar un conjunto de materias electivas específicas (una 'Línea Curricular') con una calificación mínima de 8.0 en cada una y un 90% de asistencia. No puedes combinar materias de diferentes líneas y no se permite acreditar estas materias en examen extraordinario (ETS) o recursamiento. ",
  },
  {
    question:
      "como tramitar constancias (boleta, tira de materias, constancia de estudios etc.)",
    answer:
      "Puedes tramitar la mayoría de las constancias, como la de estudios o la boleta global, a través del SAES en la sección 'Trámites / Solicitud'. Si el documento que necesitas no está disponible en el sistema, debes acudir a la ventanilla de Gestión Escolar. ",
  },
  {
    question:
      "Cuántos créditos son los mínimos para realizar el servicio social?",
    answer:
      "Se requiere tener cubierto como mínimo el 70% de los créditos del plan de estudios para poder iniciar el servicio social. ",
  },
  {
    question: "Hola!",
    answer:
      "¡Hola, UPIICSIANO! Estoy aquí para ayudarte con tus dudas sobre la escuela. ¿En qué puedo asistirte?",
  },
  {
    question: "Cómo estás?",
    answer:
      "Estoy funcionando correctamente, ¡gracias por preguntar! Listo para responder tus preguntas sobre la UPIICSA.",
  },
  {
    question: "Cuáles son las formas de titulación?",
    answer:
      "UPIICSA ofrece nueve opciones de titulación: 1. Proyecto de investigación, 2. Tesis, 3. Memoria de experiencia profesional, 4. Créditos de posgrado, 5. Seminario de titulación, 6. Escolaridad (promedio), 7. Curricular, 8. Práctica profesional. ",
  },
  {
    question: "¿Qué pasa si no pude tener tutor en mi primer semestre?",
    answer:
      "No hay ninguna consecuencia académica. El tutor académico es una figura de orientación para apoyarte en tu trayectoria y en el logro de tus metas, pero no tener uno asignado no afecta tu situación escolar. ",
  },
  {
    question:
      "¿Hasta que momento pierdo el derecho de tener seguro facultativo?",
    answer:
      "Pierdes el derecho al seguro facultativo en el momento en que dejas de ser considerado alumno del Instituto Politécnico Nacional, ya sea por egreso o por baja definitiva. ",
  },
  {
    question:
      "¿Cómo funciona específicamente la titulación por Experiencia laboral?",
    answer:
      "Esta opción, llamada 'Memoria de Experiencia Profesional', consiste en elaborar un informe escrito sobre tus actividades profesionales durante un periodo mínimo de tres años (comprobables después de haber egresado). En este informe debes demostrar la aplicación de los conocimientos de tu carrera. El trabajo se defiende en una presentación oral ante un jurado. ",
  },
  {
    question:
      "Donde y como denunciar o reportar a un profesor qué incumple con la impartición de unidades de aprendizaje",
    answer:
      "Puedes acudir a la Subdirección Académica en el Edificio de Gobierno para recibir asistencia. También puedes acercarte con el jefe de academia del profesor en cuestión o con un alumno consejero para recibir orientación sobre el procedimiento a seguir. ",
  },
  {
    question:
      "Si repruebo mi materia de titulación, puedo recusar y titularme aún, por línea curricular?",
    answer:
      "No. La opción de titulación por línea curricular exige que todas las unidades de aprendizaje de la línea se acrediten en curso normal, con una calificación mínima de 8.0. No se pueden acreditar por Examen a Título de Suficiencia (ETS) ni en recursamiento. ",
  },
  {
    question:
      "¿Qué hago si mi constancia de vigencia de IMSS ya sale como dada de baja y tengo que hacer mis prácticas profesionales?",
    answer:
      "Debes acercarte al área de Servicios Médicos de la UPIICSA, ubicada en el Edificio de Gobierno, para que te orienten sobre el procedimiento para realizar tu alta nuevamente en el seguro facultativo del IMSS. ",
  },
  {
    question: "Como hago para cambiarme de escuela",
    answer:
      "Debes estar atento a la convocatoria de 'Cambio de Carrera'. Es importante saber que, según las normativas actuales, no se permiten cambios de carrera externos (de una escuela a otra del IPN). Los cambios solo son posibles de manera interna, es decir, entre las carreras que se ofrecen dentro de la misma UPIICSA. ",
  },
  {
    question:
      "¿cuáles son las formas de titulación, requisitos, y en qué momento se puede empezar con el trámite??",
    answer:
      "Las 9 formas de titulación son: Tesis, Proyecto de investigación, Memoria de experiencia profesional, Créditos de posgrado, Seminario, Escolaridad, Curricular y Práctica profesional. Los requisitos generales son tener el 100% de créditos, la liberación del servicio social y la acreditación del idioma inglés (nivel B1 o B2 según tu plan). El momento para iniciar el trámite depende de la opción; por ejemplo, para la opción por promedio puedes iniciarlo al egresar, mientras que para la memoria de experiencia necesitas 3 años de experiencia laboral post-egreso. Para más detalles, visita: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html ",
  },
  {
    question:
      "¿Cómo puedo pedir resguardo de una materia de laboratorio de mecánica clásica?",
    answer:
      "El 'resguardo de calificación' no es un mecanismo oficial contemplado en el reglamento. Se trata de un acuerdo informal entre la academia y el profesor. En los planes de estudio más recientes (2021), la teoría y el laboratorio son materias separadas, por lo que cada una se acredita de forma independiente. ",
  },
  {
    question: "¿Cuántas materias puedo reinscribir?",
    answer:
      "Si eres alumno regular, puedes inscribir la carga académica que desees hasta la máxima permitida. Si eres alumno irregular, tienes derecho a inscribir una carga entre la mínima y la media. Puedes consultar las cargas exactas en la página de Gestión Escolar de UPIICSA. ",
  },
  {
    question:
      "¿Si paso mis adeudos en la primera ronda de ETS, soy alumno regular?",
    answer:
      "No. Adquieres el estatus de 'alumno regular' cuando al cierre oficial del periodo semestral no tienes ninguna materia adeudada en tu historial académico. Aprobar en ETS te ayuda a no tener adeudos para el siguiente semestre, pero tu estatus del semestre que concluyó fue 'irregular'. ",
  },
  {
    question: "¿Si cuento con dictamen vigente puedo reinscribirme?",
    answer:
      "Sí, puedes reinscribirte siempre y cuando tu dictamen (ya sea de UPIICSA o de la Comisión de Situación Escolar de Zacatenco) te lo permita. En caso de duda, es muy importante que consultes a tu asesor de carrera en Gestión Escolar. ",
  },
  {
    question: "¿Cuánto es el tiempo de espera de mi tramite?",
    answer:
      "El tiempo de espera varía según el trámite. Las constancias de estudios, periodo vacacional, servicio social y prácticas profesionales tardan de 5 a 10 días hábiles. Una boleta global tarda de 15 a 20 días hábiles, y una boleta global certificada puede tardar de 30 a 40 días hábiles. ",
  },
  {
    question: "¿Qué dictamen debo de solicitar si estoy desfasado?",
    answer:
      "Depende de tu periodo de ingreso. Si tu ingreso fue del periodo 17/2 en adelante, debes solicitar un dictamen por oportunidad en UPIICSA. Si tu ingreso fue del 17/1 hacia atrás, debes solicitar el dictamen por oportunidad ante el Consejo General Consultivo (CGC) en Zacatenco. ",
  },
  {
    question: "¿Dónde puedo ver la resolución de mi dictamen?",
    answer:
      "Si solicitaste un dictamen UPIICSA, puedes ver la resolución directamente en tu SAES, en la sección 'Dictámenes'. Si solicitaste un dictamen del CGC de Zacatenco, la resolución se publica en la página oficial de UPIICSA, en la sección de Gestión Escolar. ",
  },
  {
    question: "que onda",
    answer:
      "¡Qué tal! Soy el chatbot de UPIICSA. ¿Tienes alguna pregunta sobre la escuela? Estoy para ayudarte.",
  },
  {
    question: "hello",
    answer:
      "Hello! I'm the UPIICSA chatbot, ready to help you with your questions about the school. How can I assist you?",
  },
  {
    question: "¿Cómo empiezo las prácticas profesionales?",
    answer:
      "Para iniciar, debes tener al menos el 50% de tus créditos. El proceso es en línea: debes reunir tus documentos (constancia de créditos, cédula de registro, vigencia del IMSS, etc.) y enviarlos en formato PDF al correo practicas_upiicsa@ipn.mx. Para ver la guía completa y descargar los formatos, visita: https://www.upiicsa.ipn.mx/estudiantes/practicas-profesionales.html ",
  },
  {
    question: "¿Cómo puedo reportar a un profesor?",
    answer:
      "Para reportar a un profesor, puedes dirigirte a la Subdirección Académica en el Edificio de Gobierno. Otras opciones son hablar con el jefe de la academia a la que pertenece el profesor o buscar orientación con un alumno consejero. ",
  },
  {
    question: "¿Cómo acreditar electivas?",
    answer:
      "Existen diversas formas de acreditar materias electivas, como participar en talleres culturales, actividades deportivas, o eventos académicos. Cada actividad tiene requisitos y evidencias específicas que debes entregar. Puedes consultar toda la información detallada en: https://www.upiicsa.ipn.mx/estudiantes/electivas.html ",
  },
  {
    question: "¿Qué pasa si repruebo una materia?",
    answer:
      "Si repruebas una materia, tu situación académica cambia a 'irregular'. Tienes dos opciones principales para acreditarla: 1) Presentar un Examen a Título de Suficiencia (ETS). 2) Recursar la materia una sola vez. Si después de recursarla no la acreditas, podrías tener la oportunidad de cursarla en una modalidad diferente si se ofrece en el IPN. ",
  },
  {
    question: "¿Dónde es la academia de transporte?",
    answer:
      "La academia de Sistemas de Transporte se encuentra en el segundo piso del Edificio de Desarrollo Profesional Específico (Ingeniería). ",
  },
  {
    question: "¿Cuál es la carta de dictamen HCTCE UPIICSA por oportunidad?",
    answer:
      "Puedes consultar y descargar el formato oficial de la carta para solicitar dictamen por oportunidad al H. Consejo Técnico Consultivo Escolar de UPIICSA en el siguiente enlace: https://www.upiicsa.ipn.mx/assets/files/upiicsa/estudiantes/gestion-escolar/carta-oportunidad-upiicsa.pdf ",
  },
  {
    question: "¿Cuál es el correo de bajas?",
    answer:
      "El correo electrónico para trámites de bajas es: bajas.upiicsa@gmail.com ",
  },
  {
    question: "¿Cuáles son las actividades deportivas que ofrece la UPIICSA?",
    answer:
      "UPIICSA ofrece una amplia variedad de disciplinas como Fútbol Americano (varonil y femenil), Fútbol Soccer, Básquetbol, Voleibol, Lucha Olímpica, Karate, Box, Tae Kwon Do, Tenis, Remo y Tocho Bandera. Para conocer los horarios, entrenadores y requisitos, visita: https://www.upiicsa.ipn.mx/estudiantes/actividades-deportivas.html ",
  },
  {
    question: "¿Qué es un seminario de titulación?",
    answer:
      "Es una de las opciones para titularte. Consiste en cursar y acreditar un seminario de al menos 150 horas con una calificación mínima de 8.0 y 90% de asistencia. Al finalizar, debes entregar un trabajo escrito sobre el tema del seminario. Puedes encontrar más información en: https://www.upiicsa.ipn.mx/educacion-continua/seminarios-de-titulacion.html ",
  },
  {
    question: "¿Qué es la movilidad académica?",
    answer:
      "Es un programa que te permite cursar un semestre en otra universidad, ya sea en México o en el extranjero, con la finalidad de cursar materias equivalentes a tu plan de estudios que serán revalidadas a tu regreso a UPIICSA. ",
  },
  {
    question: "¿Qué hacer si se me pasó la fecha de baja temporal?",
    answer:
      "El trámite de baja temporal tiene fechas estrictas. A menos que puedas comprobar una causa de fuerza mayor, no podrás tramitarla fuera de tiempo. Es crucial que acudas a Gestión Escolar o a la Subdirección Académica para revisar tu caso, ya que si dejas de asistir a clases sin tramitar la baja, podrías ser considerado desertor. ",
  },
  {
    question: "¿Cuándo puedo solicitar un dictamen de oportunidad?",
    answer:
      "Debes solicitar este dictamen cuando tienes al menos una materia en desfase (reprobada) y necesitas la oportunidad para acreditarla, ya sea presentando un ETS o recursándola. También se solicita si no acreditaste electivas y no te inscribiste en el semestre anterior. ",
  },
  {
    question: "¿Qué es un dictamen?",
    answer:
      "Un dictamen es un documento oficial emitido por Gestión Escolar cuando tu situación académica se encuentra en un caso especial no previsto por el Reglamento General de Estudios. Su objetivo es justificar tu permanencia en el IPN y ayudarte a regularizar tu trayectoria. ",
  },
  {
    question: "¿Qué es un ESPA?",
    answer:
      "Un ESPA (Examen de Saberes Previamente Adquiridos) es un examen que puedes presentar al inicio del semestre para acreditar una materia sin necesidad de cursarla, siempre y cuando demuestres que ya posees los conocimientos necesarios. Debes tener la materia inscrita y realizar la solicitud formalmente. ",
  },
  {
    question: "¿Dónde se encuentra Servicio Social?",
    answer:
      "La oficina de Servicio Social se encuentra en la planta alta del Edificio de Gobierno. ",
  },
  {
    question: "¿Qué es un ETS?",
    answer:
      "Un ETS es un Examen a Título de Suficiencia. Es una evaluación que te permite acreditar una materia que reprobaste en el periodo ordinario, dándote una oportunidad adicional para aprobarla. ",
  },
  {
    question: "¿Dónde está la academia de investigación de operaciones?",
    answer:
      "La academia de Investigación de Operaciones se encuentra en el tercer piso del Edificio de Desarrollo Profesional Específico (Ingeniería). ",
  },
  {
    question: "¿Quién es el director de la UPIICSA?",
    answer:
      "El director de la UPIICSA es el M. en C. Emmanuel González Rogel. ",
  },
  {
    question: "como hago mi servicio social",
    answer:
      "El proceso inicia registrándote como prestador en el Sistema Institucional de Servicio Social (SISS). Debes cumplir con los requisitos (mínimo 70% de créditos, vigencia de IMSS, etc.), encontrar un programa de servicio social aprobado y seguir los pasos de validación y entrega de documentos que se indican en la página de Servicio Social de UPIICSA. Para una guía detallada, visita: https://www.upiicsa.ipn.mx/estudiantes/servicio-social.html ",
  },
  {
    question: "¿Dónde es el salón transporte?",
    answer:
      "La sala de transporte se encuentra en el segundo piso del Edificio de Ingeniería, a un costado de la academia de Sistemas de Transporte. ",
  },
  {
    question: "¿Cuántas carreras hay en UPIICSA?",
    answer:
      "UPIICSA ofrece 6 carreras de licenciatura: Administración Industrial, Ciencias de la Informática, Ingeniería en Informática, Ingeniería en Transporte, Ingeniería Ferroviaria e Ingeniería Industrial. Para más detalles, visita: https://www.upiicsa.ipn.mx/oferta-educativa/ ",
  },
  {
    question: "¿Qué es un tutor?",
    answer:
      "Según el Reglamento General de Estudios, el tutor académico tiene como función orientarte en la definición de tu trayectoria escolar (elección de materias) y apoyarte para que logres tus metas académicas. ",
  },
  {
    question: "¿Qué son las electivas?",
    answer:
      "Las materias electivas son aquellas que puedes seleccionar de la oferta institucional para complementar tu formación, de acuerdo a tus intereses. Acreditar ciertas actividades (culturales, deportivas, etc.) puede darte créditos para estas materias. ",
  },
  {
    question: "¿Qué es una optativa?",
    answer:
      "Las materias optativas son aquellas que puedes seleccionar de un conjunto de opciones predefinidas dentro de tu plan de estudios para un periodo escolar específico. A diferencia de las electivas, las optativas forman parte de las líneas de especialización de tu carrera. ",
  },
  {
    question: "¿Qué pasa si excedo el tiempo para terminar mi carrera?",
    answer:
      "Según el Artículo 75 del Reglamento General de Estudios, si agotas el tiempo máximo para concluir tu programa académico (incluyendo la ampliación de plazo), puedes optar por la certificación de las materias que sí acreditaste o solicitar autorización para cursar el complemento de tus estudios en una modalidad diferente a la escolarizada, si el cupo lo permite. ",
  },
  {
    question: "¿Qué son las prácticas profesionales?",
    answer:
      "Son un ejercicio guiado y supervisado que te permite aplicar tus conocimientos en un entorno laboral real. Tienen una duración mínima de 150 horas y para realizarlas debes haber cubierto al menos el 50% de los créditos de tu carrera. Para más información, visita: https://www.upiicsa.ipn.mx/estudiantes/practicas-profesionales.html ",
  },
  {
    question: "¿Qué es el servicio social?",
    answer:
      "Es una actividad obligatoria y temporal que realizas como requisito para obtener tu título. Su objetivo es que apliques tus conocimientos para resolver problemas de la sociedad. Tiene una duración de 480 horas, a cubrir en un periodo no menor a seis meses ni mayor a dos años. ",
  },
  {
    question: "¿Cómo pedir prestado un auditorio?",
    answer:
      "Para solicitar el préstamo de un auditorio, debes acudir a la oficina de Difusión y Fomento a la Cultura, ubicada en el Edificio de Gobierno. ",
  },
  {
    question: "¿Cómo cambiarme de plan de estudios?",
    answer:
      "Debes acudir al departamento de Gestión Escolar. Allí revisarán tu trayectoria académica y, con base en el reglamento, te informarán sobre las opciones disponibles para un posible cambio de plan de estudios. ",
  },
  {
    question: "¿Qué sanciones puedo recibir por tomar dentro de la escuela?",
    answer:
      "Según el Artículo 106 del Reglamento General de Estudios, las sanciones por consumir bebidas alcohólicas dentro de la escuela pueden ir desde un apercibimiento o amonestación escrita, hasta una suspensión temporal o la baja definitiva del Instituto, dependiendo de la gravedad de la falta. ",
  },
  {
    question: "¿Qué sanciones recibo si me encuentran drogado en la escuela?",
    answer:
      "Al igual que con el consumo de alcohol, el Artículo 106 del Reglamento General de Estudios estipula que las sanciones por consumir o portar estupefacientes van desde una amonestación escrita hasta la suspensión temporal o la baja definitiva del Instituto Politécnico Nacional. ",
  },
  {
    question: "¿Qué áreas componen a la UPIICSA?",
    answer:
      "El campus de UPIICSA se compone de varios edificios principales, entre ellos: Edificio de Gobierno (administración), Formación Básica, Estudios Profesionales Genéricos (Sociales), Desarrollo Profesional Específico (Ingeniería), Competencias Integrales (Pesados), Laboratorios Ligeros, Edificio de Actividades Culturales y el Gimnasio. Puedes ver la estructura completa en: https://www.upiicsa.ipn.mx/conocenos/estructura-upiicsa.pdf ",
  },
  {
    question: "¿Qué es UPIICSA?",
    answer:
      "UPIICSA son las siglas de la Unidad Profesional Interdisciplinaria de Ingeniería y Ciencias Sociales y Administrativas, una de las escuelas de nivel superior del Instituto Politécnico Nacional (IPN).",
  },
  {
    question: "¿Cuántas veces puedo reprobar una materia?",
    answer:
      "Según el reglamento, tienes la oportunidad de recursar una materia una sola vez. Si la repruebas en curso normal, tienes la opción de presentar un ETS o recursarla. ",
  },
  {
    question: "¿Quién es el subdirector académico?",
    answer:
      "El Subdirector Académico de la UPIICSA es el Dr. Javier Hernández Hernández. ",
  },
  {
    question: "¿Qué son las equivalencias?",
    answer:
      "Las materias electivas son asignaturas opcionales que puedes elegir según tus intereses para explorar y enriquecer tus conocimientos en áreas complementarias a tu especialidad, ofreciendo una formación más diversa. ",
  },
  {
    question: "¿Quién es Eduardo Domínguez Navarrete?",
    answer:
      "Según la información disponible, durante el periodo 2022-2023 fue alumno consejero representante del programa de ingeniería en informática y creador de un chatbot para la comunidad. ",
  },
  {
    question: "¿Qué es el seguro facultativo?",
    answer:
      "Es un esquema de aseguramiento médico que el IMSS otorga de forma gratuita a los estudiantes de instituciones públicas de nivel medio superior, superior y posgrado. ",
  },
  {
    question: "como tramito mi dictamen",
    answer:
      "El trámite de un dictamen depende del tipo que necesites (por oportunidad, por desfase, etc.). Debes consultar la página de Gestión Escolar de UPIICSA para conocer las fechas, requisitos, formatos y procedimientos específicos para tu caso: https://www.upiicsa.ipn.mx/estudiantes/gestion-escolar.html ",
  },
  {
    question: "Cuándo se inscriben los ETS?",
    answer:
      "Las fechas de inscripción a los Exámenes a Título de Suficiencia (ETS) se publican cada periodo en la página de Gestión Escolar y en el SAES. El proceso generalmente incluye: 1. Realizar el pago en el banco. 2. Sellar el comprobante en Recursos Financieros. 3. Registrar los créditos en Gestión Escolar. 4. Inscribir la materia en el SAES. Debes estar muy atento a las convocatorias. ",
  },
  {
    question: "como se tramita una baja temporal?",
    answer:
      "Para tramitar una baja temporal, debes estar inscrito y ser alumno regular. El trámite se realiza en las fechas que publica Gestión Escolar al inicio del semestre. Debes llenar una carta de exposición de motivos dirigida al director y el formato de baja disponible en la página de UPIICSA, y entregarlos en la ventanilla correspondiente. ",
  },
  {
    question: "¿Qué carreras ofrece la escuela?",
    answer:
      "UPIICSA ofrece seis carreras de nivel licenciatura: Ingeniería Industrial, Ingeniería en Informática, Ingeniería en Transporte, Ingeniería Ferroviaria, Licenciatura en Administración Industrial y Licenciatura en Ciencias de la Informática.",
  },
  {
    question:
      "¿Cuáles son los edificios principales del campus y para qué sirven?",
    answer:
      "El campus de la UPIICSA está organizado en varios edificios clave: \n- Edificio de Gobierno: Alberga las oficinas administrativas principales, incluyendo la Dirección, Gestión Escolar y otras coordinaciones. \n- Formación Básica: Donde se imparten las materias de los primeros semestres. \n- Estudios Profesionales Genéricos (Sociales): Enfocado en materias del área de ciencias sociales y administrativas. \n- Desarrollo Profesional Específico (Ingeniería): Contiene aulas y laboratorios para las carreras de ingeniería. \n- Competencias Integrales e Institucionales (Pesados): Incluye laboratorios especializados y talleres. \n- Laboratorios Ligeros: Contiene laboratorios de física y química. \n- Edificio de Actividades Culturales: Sede de los talleres culturales, auditorios y la Unidad de Informática (UDI). \n- Gimnasio: Alberga las instalaciones deportivas principales. \n- Unidad Politécnica de Integración Social: Oficinas de movilidad académica, titulación y emprendimiento. \nPara un recorrido virtual, puedes consultar el mapa interactivo. 2",
  },
  {
    question: "¿Qué carreras de licenciatura ofrece la UPIICSA?",
    answer:
      "La UPIICSA ofrece las siguientes carreras a nivel licenciatura, divididas en dos grandes áreas: \n\nCiencias Sociales y Administrativas:\n- Licenciatura en Administración Industrial\n\nIngeniería y Ciencias Físico Matemáticas:\n- Ingeniería en Informática\n- Ingeniería en Transporte\n- Ingeniería Ferroviaria\n- Ingeniería Industrial\n- Licenciatura en Ciencias de la Informática\n\nTodos los programas se imparten en modalidad escolarizada. 3",
  },
  {
    question: "¿Qué maestrías y doctorados se ofrecen en UPIICSA?",
    answer:
      "La oferta de posgrado en UPIICSA incluye las siguientes maestrías y un doctorado, todos en modalidad escolarizada:\n\nMaestrías:\n- Maestría en Administración\n- Maestría en Ciencias en Estudios Interdisciplinarios para Pequeñas y Medianas Empresas\n- Maestría en Informática\n- Maestría en Ingeniería Industrial\n\nDoctorado:\n- Doctorado en Gestión y Política de Innovación\n\nPara más detalles sobre cada programa, puedes visitar la sección de Posgrado. 3",
  },
  {
    question:
      "¿Cuál es el perfil de ingreso para la Licenciatura en Administración Industrial?",
    answer:
      "El aspirante a la Licenciatura en Administración Industrial debe tener conocimientos en ciencias, administración, humanidades, economía y tecnología. Se requieren habilidades de comunicación y trabajo en equipo, junto con una actitud positiva, emprendedora y proactiva. 3",
  },
  {
    question:
      "¿Cuál es el campo laboral de un Licenciado en Administración Industrial?",
    answer:
      "Un egresado de Administración Industrial puede trabajar en organizaciones públicas y privadas en áreas como: administración estratégica, gestión de tecnologías de la información, finanzas, capital humano, consultoría, comercio electrónico, logística y auditoría de sistemas de gestión de calidad y ambiental. 3",
  },
  {
    question: "¿Cuál es el perfil de ingreso para Ingeniería en Informática?",
    answer:
      "El aspirante a Ingeniería en Informática debe provenir preferentemente del área de Físico-Matemáticas, tener conocimientos básicos de inglés y un interés en el desarrollo de software de alta calidad, Internet de las Cosas, seguridad de la información y computación en la nube. 3",
  },
  {
    question: "¿Cuál es el campo laboral de un Ingeniero en Informática?",
    answer:
      "Un Ingeniero en Informática puede desempeñarse en organizaciones nacionales e internacionales, públicas o privadas, en áreas que requieran soluciones tecnológicas como desarrollo de software, seguridad de la información, Internet de las Cosas y computación en la nube, tanto en roles directivos como operativos y de investigación. 5",
  },
  {
    question: "¿Cuál es el perfil de ingreso para Ingeniería en Transporte?",
    answer:
      "El aspirante a Ingeniería en Transporte debe mostrar interés por los sistemas de transporte y su relación con los entornos social, ambiental, económico y tecnológico. Se requieren conocimientos en áreas científicas y administrativas, así como habilidades de comunicación, pensamiento analítico y trabajo en equipo. 3",
  },
  {
    question: "¿Cuál es el campo laboral de un Ingeniero en Transporte?",
    answer:
      "El Ingeniero en Transporte puede trabajar en dependencias gubernamentales del sector, organismos internacionales de regulación, centros de investigación, empresas de tecnología para la simulación y planeación del transporte, fabricantes de vehículos, aseguradoras y consultorías especializadas. 3",
  },
  {
    question: "¿Cuál es el perfil de ingreso para Ingeniería Ferroviaria?",
    answer:
      "El aspirante a Ingeniería Ferroviaria debe haber concluido el nivel medio superior, preferentemente con bases en física, química, matemáticas, computación y dibujo. Es indispensable tener disposición de tiempo completo para los estudios. 3",
  },
  {
    question: "¿Cuál es el campo laboral de un Ingeniero Ferroviario?",
    answer:
      "Un Ingeniero Ferroviario puede trabajar en el sector público y privado, coordinando la construcción de infraestructura ferroviaria, evaluando impactos ambientales y urbanos de proyectos, realizando peritajes técnicos y diagnosticando las necesidades de la industria proveedora de tecnología y componentes ferroviarios. 3",
  },
  {
    question: "¿Cuál es el perfil de ingreso para Ingeniería Industrial?",
    answer:
      "El aspirante a Ingeniería Industrial debe tener conocimientos básicos en matemáticas, física y química. Se requieren habilidades para el análisis de datos, comunicación oral y escrita, y manejo de tecnologías de la información. Se valora una actitud innovadora, disposición para el trabajo en equipo y un interés por el desarrollo industrial sostenible. 3",
  },
  {
    question: "¿Cuál es el campo laboral de un Ingeniero Industrial?",
    answer:
      "El Ingeniero Industrial se desempeña en cualquier sector productivo o de servicios, en áreas como manufactura inteligente, control de calidad, logística, gestión de la cadena de suministro, seguridad ocupacional, finanzas y desarrollo de proyectos, tanto a nivel operativo como directivo. 3",
  },
  {
    question:
      "¿Cuál es el perfil de ingreso para la Licenciatura en Ciencias de la Informática?",
    answer:
      "El aspirante a Ciencias de la Informática debe tener conocimientos de nivel medio superior en ciencias básicas, sociales y administrativas, con dominio de herramientas de cómputo y preferencia por la programación. Se requiere un nivel básico de inglés y habilidades para el autoaprendizaje y trabajo en equipo. 3",
  },
  {
    question:
      "¿Cuál es el campo laboral de un Licenciado en Ciencias de la Informática?",
    answer:
      "Un egresado de Ciencias de la Informática puede integrarse en empresas públicas y privadas liderando proyectos en áreas como Business Intelligence, Data Analytics, aplicaciones en la nube y E-commerce. También puede emprender creando productos y servicios de TI. 3",
  },
  {
    question:
      "¿Cuáles son los requisitos generales para ingresar a una licenciatura en el IPN?",
    answer:
      "Para ingresar a cualquier licenciatura del IPN, los requisitos generales son: \n1. Cumplir con los antecedentes académicos y requisitos de la convocatoria vigente. \n2. Presentar el examen de admisión para el nivel superior. \n3. Ser seleccionado en el concurso de admisión. 4",
  },
  {
    question: "¿Cuándo se publica la convocatoria de admisión al IPN?",
    answer:
      "El IPN generalmente publica dos grandes convocatorias al año. La primera convocatoria, para ingresar en el periodo de agosto, se publica usualmente en la tercera semana de febrero. La segunda convocatoria o 'segunda vuelta', para ingresar en enero del siguiente año, se publica típicamente en la tercera semana de julio. Debes estar muy atento al sitio web oficial del IPN (www.ipn.mx) para las fechas exactas. 13",
  },
  {
    question:
      "¿Cómo es el proceso de pre-registro en línea para el examen de admisión?",
    answer:
      "El pre-registro se realiza en el portal de admisiones del IPN (www.ipn.mx). El proceso se organiza por orden alfabético, según la primera letra de tu apellido paterno. Debes ingresar en los días que te correspondan para crear una cuenta, llenar tus datos personales y seleccionar las opciones de carrera de tu interés. Este paso es fundamental para generar tu Solicitud de Registro (Documento A). 13",
  },
  {
    question: "¿En qué fechas es el registro de admisión según mi apellido?",
    answer:
      "Las fechas de registro en línea se asignan según la primera letra de tu apellido paterno. Por ejemplo, para la convocatoria 2025-2026, el calendario fue: \n- A, B: 01 al 08 de febrero\n- C: 09 al 13 de febrero\n- D, E, F: 14 al 20 de febrero\n- G: 21 al 26 de febrero\n- H, I, J, K, L: 27 de febrero al 02 de marzo\n- M: 03 al 07 de marzo\n- N, Ñ, O, P, Q: 08 al 13 de marzo\n- R, S: 14 al 19 de marzo\n- T, U, V, W, X, Y, Z: 20 al 22 de marzo\nEs crucial que consultes la convocatoria oficial del año en curso, ya que estas fechas pueden variar. 13",
  },
  {
    question:
      "¿Qué documentos necesito para mi cita de registro al examen de admisión?",
    answer:
      "Una vez que completes tu pre-registro en línea, deberás acudir a una cita presencial. Los documentos que generalmente se solicitan son: \n1. Solicitud de Registro (Documento A) impresa.\n2. Identificación oficial con fotografía (original).\n3. Comprobante del depósito o pago por el derecho al examen. 13",
  },
  {
    question: "¿Cuándo es el examen de admisión del IPN?",
    answer:
      "El examen de admisión para las unidades de la CDMX y zona metropolitana usualmente se realiza durante un fin de semana a finales de mayo o principios de junio. Para la convocatoria 2025, por ejemplo, las fechas fueron el 31 de mayo y 01 de junio. La fecha y hora exactas de tu examen vendrán especificadas en tu Ficha de Examen (Documento B). 13",
  },
  {
    question:
      "¿Cuándo y dónde puedo ver los resultados del examen de admisión?",
    answer:
      "Los resultados del examen de admisión se publican en el sitio web oficial del IPN (www.ipn.mx). Para la primera convocatoria, los resultados suelen estar disponibles en la tercera semana de julio. Podrás consultarlos ingresando a la plataforma de admisión con tu folio y fecha de nacimiento para descargar tu Hoja de Resultados (Documento C). 13",
  },
  {
    question:
      "Fui aceptado en UPIICSA, ¿qué documentos necesito para inscribirme?",
    answer:
      "¡Felicidades! Para tu inscripción, necesitarás presentar los siguientes documentos en original en la fecha y lugar que indique tu Hoja de Resultados (Documento C): \n1. Hoja de Resultados (Documento C). \n2. Certificado de estudios de Bachillerato (concluido al 100%). \n3. Clave Única de Registro de Población (CURP) certificada. \n4. Acta de nacimiento legible. \n5. Solicitud de inscripción emitida por la Dirección de Administración Escolar (DAE). \n6. Comprobante del donativo. \n7. Fotografías tamaño infantil. 13",
  },
  {
    question: "¿Existe una segunda vuelta o un examen complementario?",
    answer:
      "Sí. Los aspirantes que no fueron asignados en la primera convocatoria pueden participar en el proceso de la segunda vuelta, cuya convocatoria se publica generalmente en julio para iniciar clases en el periodo de febrero-julio del siguiente año. El proceso es muy similar, con registro en línea, examen y publicación de resultados. 13",
  },
  {
    question:
      "¿Cuál es el proceso de inscripción para alumnos de nuevo ingreso?",
    answer:
      "Una vez que fuiste asignado, debes seguir los pasos de inscripción. Generalmente, esto incluye: \n1. Entrega de documentos: Acudir a Gestión Escolar de UPIICSA en las fechas asignadas (usualmente a mediados de agosto) con todos tus documentos (certificado de bachillerato, acta de nacimiento, CURP, solicitud de inscripción, etc.). \n2. Curso de inducción: Asistir al curso de inducción obligatorio, que se realiza la semana previa al inicio de clases. \n3. Consulta de horario: Tu horario de clases estará disponible en el sistema SAES unos días antes del inicio del semestre. \nPara más información, consulta la guía de nuevo ingreso en la página de UPIICSA. 2",
  },
  {
    question:
      "¿Cómo es el proceso de reinscripción para semestres posteriores?",
    answer:
      "El proceso de reinscripción se realiza cada semestre a través del Sistema de Administración Escolar (SAES). Las citas para reinscripción se otorgan con base en tu situación académica (regular o irregular) y tu promedio. Deberás ingresar al SAES en la fecha y hora de tu cita para seleccionar tus materias. Es importante realizar el donativo correspondiente antes de tu cita. 19",
  },
  {
    question: "¿Qué es el SAES y para qué sirve?",
    answer:
      "El SAES (Sistema de Administración Escolar) es la plataforma en línea más importante para los estudiantes de UPIICSA. A través del SAES puedes: \n- Realizar tu reinscripción cada semestre. \n- Consultar tu horario y calificaciones. \n- Inscribirte a Exámenes a Título de Suficiencia (ETS). \n- Descargar tu constancia de créditos y otros documentos académicos. \n- Dar de alta o baja materias. \nTu usuario es tu número de boleta y tu contraseña inicial son las primeras 4 letras de tu apellido paterno en mayúsculas. El sitio es www.saes.upiicsa.ipn.mx. 18",
  },
  {
    question: "¿Dónde puedo consultar el calendario académico oficial?",
    answer:
      "El calendario académico oficial para la modalidad escolarizada, con todas las fechas importantes como inicio y fin de semestre, periodos vacacionales, días de asueto y fechas de evaluación, se publica en la página principal del IPN. Puedes consultarlo y descargarlo en formato PDF desde la sección 'Calendario Académico' del sitio www.ipn.mx. 22",
  },
  {
    question: "¿Cuáles son las fechas clave del calendario escolar 2025-2026?",
    answer:
      "Según el calendario académico 2025-2026 para la modalidad escolarizada, algunas fechas importantes son:\n- Inicio del periodo 25-1: 18 de agosto de 2025.\n- Días de descanso obligatorio en 2025: 15 de septiembre, 17 de noviembre.\n- Periodo vacacional de invierno: Del 22 de diciembre de 2025 al 2 de enero de 2026.\n- Fin del periodo 25-1: 5 de enero de 2026.\n- Inicio del periodo 26-1: 12 de enero de 2026.\n- Días de descanso obligatorio en 2026: 2 de febrero, 16 de marzo, 1 de mayo, 5 de mayo, 15 de mayo.\n- Periodo vacacional de primavera: Del 6 al 10 de abril de 2026.\n- Fin del periodo 26-1: 10 de julio de 2026.\nPara ver el calendario completo, visita la página oficial del IPN. 22",
  },
  {
    question: "¿Cómo puedo tramitar una baja temporal?",
    answer:
      "Puedes solicitar una baja temporal por hasta dos periodos escolares. El trámite se realiza en fechas específicas (generalmente durante el primer mes del semestre, por ejemplo, del 28 de agosto al 28 de septiembre de 2024). Debes llenar el formato de baja temporal, disponible en la sección de Gestión Escolar de la página de UPIICSA, y seguir el procedimiento indicado. 23",
  },
  {
    question: "¿Cómo puedo tramitar una baja definitiva?",
    answer:
      "La baja definitiva de la modalidad escolarizada se puede tramitar en cualquier momento del semestre (por ejemplo, del 26 de agosto al 21 de enero de 2025). Debes descargar y llenar el formato correspondiente, adjuntar una copia de tu INE y una carta de exposición de motivos dirigida al director de la UPIICSA. El trámite puede ser realizado por ti o por un representante con carta poder. 23",
  },
  {
    question: "¿Qué es un ETS y cómo me inscribo?",
    answer:
      "Un ETS es un Examen a Título de Suficiencia, una oportunidad para acreditar una materia que reprobaste. El proceso de inscripción es el siguiente:\n1. Consulta la programación: Revisa las fechas y horarios de los ETS en el SAES.\n2. Realiza el pago: Paga el derecho a examen en el banco y presenta el comprobante en la ventanilla de recursos financieros para que te sellen el formato de pago.\n3. Registra tus créditos: Acude a las ventanillas de Gestión Escolar con tu formato sellado para que registren tus créditos.\n4. Inscribe el ETS en SAES: Ingresa a tu cuenta del SAES, ve a la sección 'ETS' y selecciona la materia y turno que deseas presentar.\n5. Imprime tu comprobante: Descarga e imprime tu comprobante de inscripción al ETS, lo necesitarás para presentar el examen. 21",
  },
  {
    question: "¿Cuáles son los horarios de la biblioteca?",
    answer:
      "La biblioteca 'Ing. Manuel Zorrilla Carcaño' tiene los siguientes horarios de servicio:\n- Lunes a viernes: de 8:00 a 20:00 horas.\n- Sábados y domingos: de 8:00 a 18:00 horas. 25",
  },
  {
    question: "¿Qué servicios ofrece la biblioteca de UPIICSA?",
    answer:
      "La biblioteca ofrece una variedad de servicios para la comunidad estudiantil, incluyendo:\n- Consulta en sala con estantería abierta.\n- Préstamo de libros a domicilio.\n- Préstamo interbibliotecario.\n- Consulta de la colección de referencia (enciclopedias, manuales).\n- Consulta de tesis impresas.\n- Acceso a recursos digitales y bases de datos (Ligoteca).\n- Sala de lectura y proyección de películas. 25",
  },
  {
    question: "¿Qué servicios médicos ofrece la UPIICSA?",
    answer:
      "UPIICSA cuenta con un Servicio Médico que ofrece atención de primer contacto para padecimientos agudos y urgencias menores ocurridas dentro del plantel. También realizan campañas de salud, vacunación y dan orientación sobre planificación familiar y enfermedades de transmisión sexual. 26",
  },
  {
    question: "¿Cuáles son los horarios del servicio médico?",
    answer:
      "El horario de atención médica de primer contacto es:\n- Lunes a viernes: de 7:30 a 21:00 horas.\n- Sábado: de 8:30 a 19:30 horas.\n- Domingo: de 8:30 a 14:00 horas. 26",
  },
  {
    question: "¿Hay servicio dental en UPIICSA?",
    answer:
      "Sí, UPIICSA ofrece servicio de salud bucal. Proporciona diagnóstico, tratamiento de primer contacto, atención de urgencias odontológicas y enseñanza de técnicas de higiene. 26",
  },
  {
    question: "¿Cuáles son los horarios del servicio dental?",
    answer:
      "El horario del servicio dental es:\n- Lunes a viernes: de 8:00 a 21:00 horas.\n- Sábado: de 8:30 a 19:00 horas.\n- Domingo: de 8:30 a 14:00 horas. 26",
  },
  {
    question: "¿Hay atención nutricional y de salud visual?",
    answer:
      "Sí. Se ofrece asesoría nutricional para combatir el sobrepeso y la obesidad, de lunes a viernes de 7:30 a 19:00 horas. El servicio de salud visual, para detección y tratamiento de problemas visuales, atiende los jueves de 10:00 a 16:00 horas. 26",
  },
  {
    question: "Como alumno, ¿tengo algún seguro de vida o de accidentes?",
    answer:
      "Sí. Por ser alumno inscrito en el IPN, tienes un seguro de vida y de accidentes sin costo. Este seguro te brinda una protección económica en caso de pérdidas orgánicas o indemnizaciones a consecuencia de un accidente. Puedes solicitar más información de lunes a viernes, de 9:00 a 19:00 horas. 26",
  },
  {
    question: "¿Qué actividades culturales se ofrecen en UPIICSA?",
    answer:
      "UPIICSA tiene una amplia oferta de talleres culturales, entre los que se encuentran: Artes Plásticas, Baile de Salón, Salsa Cubana, Danza Folklórica, Danzas Polinesias, Canto, Guitarra, Piano, Baile de los 60's y Cine Club. Estas actividades pueden otorgar créditos para materias electivas. 28",
  },
  {
    question:
      "¿Cuáles son los requisitos para inscribirme a un taller cultural?",
    answer:
      "Para inscribirte a los talleres culturales necesitas:\n1. Credencial de la escuela vigente.\n2. Tira de materias o comprobante de inscripción.\n3. Carnet vigente del IMSS.\nEs importante mencionar que el cupo es limitado y los talleres son gratuitos. 29",
  },
  {
    question: "¿Qué actividades deportivas y equipos hay en UPIICSA?",
    answer:
      "UPIICSA ofrece una gran variedad de disciplinas deportivas, tanto representativas como participativas. Algunas de ellas son: Fútbol Americano (varonil y femenil equipado), Fútbol Soccer (varonil y femenil), Básquetbol, Voleibol, Lucha Olímpica, Karate Do, Remo, Atletismo, Box, Tae Kwon Do, Tenis y Tocho Bandera (Flag Football). 30",
  },
  {
    question: "¿Qué instalaciones deportivas tiene la UPIICSA?",
    answer:
      "La unidad cuenta con excelentes instalaciones deportivas, que incluyen:\n- Gimnasio principal con duela para básquetbol y voleibol.\n- Gimnasio de pesas y área de cardio.\n- Áreas para Karate, Lucha Olímpica y Tae Kwon Do.\n- Campo empastado para Fútbol Soccer y Fútbol Americano.\n- Cancha de Fútbol Rápido con pasto sintético.\n- Cancha de Tenis.\n- Instalaciones de Remo en la Pista Olímpica de Cuemánco. 30",
  },
  {
    question: "¿Cómo me inscribo a un equipo deportivo?",
    answer:
      "La información sobre los requisitos específicos de inscripción, pruebas o 'tryouts' para los equipos representativos no se detalla en la página web. Se recomienda contactar directamente a la Coordinación de Actividades Deportivas en el gimnasio principal o acercarse a los entrenadores de cada disciplina para obtener información sobre horarios de entrenamiento y cómo puedes integrarte. 30",
  },
  {
    question: "¿Qué tipos de becas ofrece el IPN para alumnos de UPIICSA?",
    answer:
      "El IPN ofrece un amplio programa de becas para las cuales los alumnos de UPIICSA pueden aplicar. Las principales son:\n- Beca Institucional: Apoyo para estudiantes en situación regular.\n- Beca de Excelencia: Para estudiantes con desempeño académico sobresaliente.\n- Beca de Transporte: Apoyo para gastos de traslado.\n- Beca Cultural o Deportiva: Para alumnos que destacan en estas actividades.\n- Beca de Estímulo Institucional de Formación de Investigadores (BEIFI): Para alumnos que participan en proyectos de investigación.\n- Becas de Posgrado: Apoyos para maestría y doctorado. 32",
  },
  {
    question: "¿Cómo solicito una beca en el IPN?",
    answer:
      "El proceso para solicitar una beca se realiza a través del Sistema Informático de Becas (SIBec). Los pasos generales son:\n1. Estar atento a la Convocatoria General de Becas, que usualmente se publica al inicio del ciclo escolar (agosto-septiembre).\n2. Ingresar al portal SIBec (www.sibec.ipn.mx) con tu usuario y contraseña.\n3. Llenar la solicitud de beca y el estudio socioeconómico en línea.\n4. Subir la documentación que te solicite el sistema.\n5. Consultar los resultados en la misma plataforma en la fecha indicada en la convocatoria. 32",
  },
  {
    question: "¿Cuáles son los montos y requisitos de la Beca Institucional?",
    answer:
      "La Beca Institucional está dirigida a estudiantes en situación escolar regular. Para el nivel superior (licenciatura), el monto es de $6,600 MXN por periodo escolar. Los requisitos son:\n- Ser estudiante regular.\n- Tener un promedio general mínimo de 7.0.\n- Estar inscrito en la modalidad escolarizada, no escolarizada o mixta.\nLos alumnos de primer ingreso presentan su certificado de bachillerato. \nPara más información, consulta la convocatoria oficial. 34",
  },
  {
    question: "¿Cuáles son los montos y requisitos de la Beca de Excelencia?",
    answer:
      "La Beca de Excelencia está dirigida a estudiantes con un desempeño académico sobresaliente. El monto es de $19,000 MXN por periodo escolar. Los requisitos específicos son:\n- Ser estudiante regular.\n- Haber cursado al menos el 30% de los créditos de tu carrera.\n- Tener un promedio general mínimo de 9.0 para las áreas de Ciencias Médico Biológicas y Físico Matemáticas, y de 9.5 para Ciencias Sociales y Administrativas. \nPara más información, consulta la convocatoria oficial. 36",
  },
  {
    question: "¿Puedo tener dos becas al mismo tiempo?",
    answer:
      "Generalmente no. La mayoría de las becas del IPN no son compatibles con otros apoyos económicos para el mismo fin otorgados por el gobierno federal. La principal excepción es la beca BEIFI (Estímulo Institucional de Formación de Investigadores), que sí es compatible con la Beca Institucional, la Beca de Excelencia y otras. Siempre debes revisar las reglas de compatibilidad en cada convocatoria. 32",
  },
  {
    question: "¿Qué es la movilidad académica?",
    answer:
      "La movilidad académica es un programa que te permite cursar un semestre en otra institución de educación superior, ya sea en México (movilidad nacional) o en el extranjero (movilidad internacional). El objetivo es que curses materias equivalentes a tu plan de estudios, las cuales serán revalidadas a tu regreso a UPIICSA. 38",
  },
  {
    question: "¿Qué requisitos necesito para irme de movilidad académica?",
    answer:
      "Los requisitos generales varían según la convocatoria, pero comúnmente son:\n- Ser alumno regular.\n- Tener un promedio mínimo de 8.0 o 8.5, dependiendo de la convocatoria.\n- Haber cursado entre el 50% y el 80% de los créditos de tu carrera (estar entre 5° y 7° semestre).\n- Para movilidad internacional, contar con un certificado del idioma del país destino con un nivel B2 (por ejemplo, inglés certificado por Cenlex o Cambridge).\n- No tener movilidades previas en tu historial académico. 38",
  },
  {
    question: "¿Cómo inicio el proceso de movilidad académica?",
    answer:
      "Debes estar atento a las convocatorias que publica la Coordinación de Cooperación Académica (CCA) del IPN. El proceso generalmente se abre dos veces al año (marzo-abril y agosto-septiembre). Una vez publicada la convocatoria, debes contactar a la Coordinación de Movilidad Académica de UPIICSA para recibir orientación sobre los trámites internos. \nContacto: movilidad_upiicsa@ipn.mx, Tel: 56242000 Ext. 70536. 38",
  },
  {
    question: "¿Qué es el Servicio Social?",
    answer:
      "El Servicio Social es una actividad obligatoria y temporal que todos los alumnos y egresados del IPN deben realizar. Su objetivo es que apliques tus conocimientos para resolver problemas de la sociedad y desarrolles un compromiso social. 40",
  },
  {
    question: "¿Cuándo puedo empezar mi Servicio Social?",
    answer:
      "Para iniciar tu Servicio Social, necesitas cumplir con los siguientes requisitos:\n- Ser alumno inscrito o egresado.\n- Tener cubierto como mínimo el 70% de los créditos de tu carrera.\n- Contar con constancia de vigencia de derechos de tu servicio médico (IMSS, ISSSTE, etc.).\n- Presentar tu CURP actualizado. 40",
  },
  {
    question: "¿Cómo me registro para el Servicio Social?",
    answer:
      "El proceso se realiza a través del Sistema Institucional de Servicio Social (SISS) y por correo electrónico. Los pasos son:\n1. Regístrate en el SISS como prestador, ingresando tus datos.\n2. Solicita la validación de tu pre-registro enviando un correo a servicio.social_upii@ipn.mx.\n3. Espera la aceptación en el SISS (por parte de la empresa o de UPIICSA).\n4. Genera tu carta compromiso en el SISS (sin imprimirla aún).\n5. Envía tus documentos (carta compromiso sin firmar, CURP, constancia de créditos y vigencia de servicio médico) en un solo PDF al mismo correo.\n6. Una vez aprobados, imprime tu carta compromiso y recaba las firmas y sellos correspondientes.\nPara una guía detallada, visita la página de Servicio Social de UPIICSA. 40",
  },
  {
    question: "¿Dónde puedo hacer mi Servicio Social?",
    answer:
      "Puedes realizar tu Servicio Social únicamente en dependencias del IPN o en empresas y organizaciones del sector público o privado que tengan un convenio vigente y estén registradas en el Sistema Institucional de Servicio Social (SISS). Debes verificar en el SISS que el programa que te interesa esté disponible. 40",
  },
  {
    question: "¿Qué son las Prácticas Profesionales?",
    answer:
      "Las Prácticas Profesionales son un ejercicio guiado y supervisado que te permite aplicar tus conocimientos teóricos en un entorno laboral real. Su objetivo es acercarte al mundo profesional y ampliar tus perspectivas de desarrollo. 42",
  },
  {
    question: "¿Cuáles son los requisitos para hacer Prácticas Profesionales?",
    answer:
      "Los requisitos para registrar tus Prácticas Profesionales son:\n- Si eres alumno inscrito: Tener entre el 50% y el 99.99% de los créditos de tu carrera y estar inscrito en el periodo actual.\n- Si eres egresado: Contar con un seguro médico vigente (IMSS, ISSSTE, privado, etc.).\n- Debes cubrir un mínimo de 150 horas de prácticas. 42",
  },
  {
    question: "¿Cómo es el proceso para registrar mis Prácticas Profesionales?",
    answer:
      "El proceso se realiza completamente en línea. Debes enviar un correo a practicas_upiicsa@ipn.mx con el asunto 'INICIO PRÁCTICAS PROFESIONALES' y adjuntar en archivos PDF separados los siguientes documentos:\n1. Constancia de créditos (descargada del SAES).\n2. Cédula de registro (disponible en la página de UPIICSA).\n3. Constancia de vigencia de derechos de tu seguro médico.\n4. Captura de pantalla del registro de la empresa en la plataforma SISAE-SIBOLTRA.\n5. Captura de pantalla de tu registro como alumno en SISAE-SIBOLTRA.\n6. Copia de tu horario de clases (solo si eres alumno inscrito).\nUna vez enviados, el área de Prácticas Profesionales te enviará tu carta de presentación. Para una guía detallada, visita la página de Prácticas Profesionales de UPIICSA. 42",
  },
  {
    question: "¿Dónde puedo hacer mis Prácticas Profesionales?",
    answer:
      "Puedes realizarlas en dependencias públicas o en empresas privadas. Si es una empresa privada, esta debe estar registrada en la plataforma del IPN para prácticas profesionales, conocida como SISA-SIBOLTRA. Las prácticas deben realizarse de forma presencial. 42",
  },
  {
    question:
      "¿Cuáles son los requisitos generales para iniciar mi trámite de titulación?",
    answer:
      "Para iniciar cualquier opción de titulación, debes contar con la siguiente documentación base:\n- Certificado de estudios y carta de pasante (original y copia).\n- Constancia de liberación de servicio social.\n- Acta de nacimiento.\n- Documento de acreditación del idioma inglés, según lo requiera tu plan de estudios. 43",
  },
  {
    question: "¿Qué nivel de inglés necesito para titularme?",
    answer:
      "El nivel de inglés requerido depende de tu carrera y plan de estudios. De forma general:\n- Nivel B2: Para los planes 2010 de Administración Industrial, Ciencias de la Informática, Ingeniería Industrial, Ingeniería en Informática e Ingeniería en Transporte.\n- Nivel B1: Para el plan 2008 de Ingeniería en Sistemas Automotrices y para todos los planes de estudio 2021 de las 7 carreras. \nEs fundamental que verifiques el requisito específico para tu plan. 43",
  },
  {
    question:
      "¿Cuáles son todas las opciones de titulación que ofrece la UPIICSA?",
    answer:
      "UPIICSA ofrece nueve opciones diferentes para la titulación:\n1. Proyecto de investigación\n2. Tesis\n3. Memoria de experiencia profesional\n4. Créditos de posgrado\n5. Seminario de titulación (interno o externo)\n6. Escolaridad (promedio)\n7. Curricular\n8. Práctica profesional\nCada opción tiene requisitos y procedimientos específicos. Para más detalles, visita la página de Titulación de UPIICSA: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html 43",
  },
  {
    question:
      "¿En qué consiste la titulación por Tesis o Proyecto de Investigación?",
    answer:
      "Consiste en presentar un trabajo escrito (tesis o reporte técnico de investigación) que proponga nuevos enfoosques o desarrolle un nuevo prototipo, proceso o sistema en tu área. El trabajo se realiza bajo la dirección de un profesor y debe ser defendido en un examen oral ante un jurado. El proceso incluye la autorización del tema, asignación de asesores, revisión del trabajo y finalmente el examen profesional. \nPara ver el procedimiento completo y los formatos, visita la página de Titulación: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html 43",
  },
  {
    question:
      "¿Cómo funciona la titulación por Memoria de Experiencia Profesional?",
    answer:
      "Esta opción es para egresados que tienen al menos tres años de experiencia laboral comprobable después de haber concluido sus estudios. Debes elaborar un informe escrito que describa tus actividades profesionales donde aplicaste los conocimientos de tu carrera. Este informe se presenta ante un jurado. Necesitarás una constancia de la empresa donde laboras o laboraste. \nPara ver el procedimiento completo y los formatos, visita la página de Titulación: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html 43",
  },
  {
    question: "¿Cómo me puedo titular por Créditos de Posgrado?",
    answer:
      "Esta opción consiste en cursar un programa de maestría afín a tu licenciatura. Te puedes titular al cubrir el 75% de los créditos de la maestría, o al cubrir el 50% de los créditos y presentar dos trabajos de investigación. El primer paso es solicitar un 'Dictamen de Afinidad' ante la Secretaría de Investigación y Posgrado (SIP) del IPN para asegurar que la maestría que quieres cursar es válida para esta opción. \nPara ver el procedimiento completo, visita la página de Titulación: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html 43",
  },
  {
    question: "¿Cómo funciona la titulación por Seminario?",
    answer:
      "Puedes titularte acreditando un seminario de titulación de al menos 150 horas, con una calificación mínima de 8.0 y 90% de asistencia. Al final del seminario, debes entregar un trabajo escrito sobre el tema del mismo. Puedes tomar un seminario interno (en UPIICSA) o uno externo (en otra unidad del IPN), para lo cual necesitarás una 'Carta de no inconveniente' de la oficina de titulación de UPIICSA. \nPara ver el procedimiento completo, visita la página de Titulación: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html 43",
  },
  {
    question: "¿Cómo me puedo titular por Escolaridad (promedio)?",
    answer:
      "Esta es una de las opciones más directas. Puedes titularte por escolaridad si cumpliste con dos condiciones: \n1. Obtuviste un promedio general mínimo de 9.0 a lo largo de toda tu carrera. \n2. No reprobaste ninguna materia (es decir, no presentaste ningún examen extraordinario). \nSi cumples estos requisitos, el trámite es administrativo y no requiere trabajo escrito ni examen oral. \nPara ver el procedimiento completo, visita la página de Titulación: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html 43",
  },
  {
    question: "¿En qué consiste la titulación Curricular?",
    answer:
      "Esta opción se basa en acreditar una serie de materias electivas diseñadas específicamente para la titulación, que forman una 'Línea Curricular'. Debes haber cursado y aprobado todas las materias de una misma línea curricular con una calificación mínima de 8.0 en cada una. No puedes combinar materias de diferentes líneas. \nPara ver el procedimiento completo, visita la página de Titulación: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html 43",
  },
  {
    question: "¿Cómo funciona la titulación por Práctica Profesional?",
    answer:
      "Para esta opción, debes haber realizado un mínimo de 720 horas de prácticas profesionales (independientes del servicio social) en un área relacionada con tu carrera. Debes tener un promedio general mínimo de 8.0 y haber cubierto al menos el 50% de tus créditos al iniciar. Al finalizar, debes entregar un informe escrito sobre tus actividades, el cual será la base para tu examen profesional. \nPara ver el procedimiento completo, visita la página de Titulación: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html 43",
  },
  {
    question: "¿Cuál es el correo o contacto del Director de la UPIICSA?",
    answer:
      "El Director de la UPIICSA es el M. en C. Emmanuel González Rogel. Su correo electrónico es egonzalezro@ipn.mx y su extensión es la 70000. 44",
  },
  {
    question:
      "¿Cómo contacto al Jefe del Programa Académico de Ingeniería Industrial?",
    answer:
      "La Jefa del Programa Académico de Ingeniería Industrial es Yennely Eloísa Goycochea Pineda. El correo de la jefatura es jpa.ingind.upiicsa@ipn.mx y la extensión es la 70061. Esta información se obtuvo del directorio oficial de la UPIICSA. Para más información, visite la pagina de indentidad UPIICSA https://sseis.upiicsa.ipn.mx/induccion/upiicsa.html",
  },
  {
    question:
      "¿Cuál es el contacto de la Jefatura de Ingeniería en Informática?",
    answer:
      "La Jefa del Programa Académico de Ingeniería en Informática es la Dra. Susana Cuevas Escobar. El correo de la jefatura es jpa.inform.upiicsa@ipn.mx y la extensión es la 70130. Esta información se obtuvo del directorio oficial de la UPIICSA. Para más información, visite la pagina de indentidad UPIICSA https://sseis.upiicsa.ipn.mx/induccion/upiicsa.html",
  },
  {
    question: "¿Cómo contacto a la Jefatura de Administración Industrial?",
    answer:
      "El Jefe del Programa Académico de Administración Industrial es el MSIG. José Miguel Cortés Navarro. El correo de la jefatura es jpa.admon.upiicsa@ipn.mx y la extensión es la 70264. Esta información se obtuvo de los directorios oficiales de la UPIICSA. Para más información, visite la pagina de indentidad UPIICSA https://sseis.upiicsa.ipn.mx/induccion/upiicsa.html",
  },
  {
    question:
      "¿Quién es el responsable de la Sección de Estudios de Posgrado e Investigación (SEPI)?",
    answer:
      "El Jefe de la Sección de Estudios de Posgrado e Investigación (SEPI) es el Dr. Javier Hernández Ávalos. Su correo es jhernandeza@ipn.mx y su extensión es la 70276. Esta información se obtuvo del directorio de la SEPI. Para más información, visite la pagina de indentidad UPIICSA https://sseis.upiicsa.ipn.mx/induccion/upiicsa.html",
  },
  {
    question: "¿Cuál es el contacto de la oficina de Titulación?",
    answer:
      "La oficina de Titulación se encuentra temporalmente en la Unidad Politécnica de Integración Social. Para más información, visite la pagina de indentidad UPIICSA https://sseis.upiicsa.ipn.mx/induccion/upiicsa.html Aunque no se especifica un contacto directo en los directorios, los trámites se gestionan a través de la Subdirección de Servicios Educativos e Integración Social, cuyo subdirector es Emmanuel González Rogel (egonzalezro@ipn.mx, ext. 70006), según el directorio oficial de la UPIICSA. Para más información, visite la pagina de indentidad UPIICSA https://sseis.upiicsa.ipn.mx/induccion/upiicsa.html Se recomienda acudir presencialmente para obtener información precisa.",
  },
  {
    question: "¿Cuál es el contacto del Departamento de Gestión Escolar?",
    answer:
      "El Departamento de Gestión Escolar se encuentra en la planta baja del Edificio de Gobierno. La responsable de la Mesa de Control es Vania Berenice González Sandoval, su correo es vbgonzalez@ipn.mx y la extensión es la 70056. Esta información se obtuvo del directorio oficial de la UPIICSA. Para más información, visite la pagina de indentidad UPIICSA https://sseis.upiicsa.ipn.mx/induccion/upiicsa.html",
  },
  {
    question: "¿Cuál es el correo de la Unidad de Informática (UDI)?",
    answer:
      "El jefe de la Unidad de Informática (UDI) es el Ing. Eduardo Sánchez Solórzano. Su correo es esanchezs@ipn.mx y su extensión es la 70031. La UDI se encuentra en el Edificio de Culturales, según el directorio oficial de la UPIICSA. Para más información, visite la pagina de indentidad UPIICSA https://sseis.upiicsa.ipn.mx/induccion/upiicsa.html",
  },
  {
    question: "¿Quién es el contacto para dudas sobre el Servicio Social?",
    answer:
      "Para cualquier duda, puedes contactar a la Coordinación de Servicio Social. El coordinador es el Lic. Olaf Olascoaga Díaz. El correo es servicio.social_upii@ipn.mx, el teléfono es 56242000 Ext. 70069 y la oficina se ubica en la planta alta del Edificio de Gobierno. Esta información se obtuvo de la página de Servicio Social de la UPIICSA. Para más información, visite la pagina de indentidad UPIICSA https://sseis.upiicsa.ipn.mx/induccion/upiicsa.html",
  },
  {
    question: "¿Puedo hacer el servicio social aunque tenga un ETS?",
    answer:
      "Sí. El requisito principal para iniciar el servicio social es tener una constancia que acredite haber cursado y aprobado, como mínimo, el 70% de los créditos totales de la carrera. El reglamento no menciona ser alumno regular como un requisito indispensable, por lo que tener que presentar un ETS no debería ser un impedimento siempre y cuando se cumpla con el porcentaje de créditos requerido.",
  },
  {
    question:
      "¿Puedo hacer las practicas profesionales aunque tenga un dictamen?",
    answer:
      "Los reglamentos consultados no mencionan explícitamente si tener un dictamen de la COSIE impide realizar las prácticas profesionales. Un dictamen se solicita en situaciones académicas complejas y especiales. Debido a la naturaleza excepcional de esta situación, es fundamental verificar directamente con el departamento de Prácticas Profesionales de UPIICSA si existen restricciones para alumnos con un dictamen vigente.",
  },
  {
    question: "¿Puedo hacer el servicio social aunque tenga un dictamen?",
    answer:
      "Sí, siempre y cuando cumplas con el requisito principal. Para realizar el servicio social se debe contar con una constancia que valide tener como mínimo el 70% de los créditos de la carrera aprobados. Tener un dictamen de la COSIE no se menciona como un impedimento en la normativa, por lo que si cumples con el requisito de créditos, deberías poder realizar el trámite.",
  },
  {
    question: "¿Puedo hacer las practicas profesionales si estoy desfasado?",
    answer:
      "No. Un alumno con estatus de 'desfasado' pierde su derecho a reinscripción para el periodo escolar inmediato siguiente. Esto significa que no es un alumno activo y no puede iniciar nuevos trámites académicos como las prácticas profesionales hasta que su situación sea resuelta a través de un dictamen favorable de la COSIE.",
  },
  {
    question: "¿Puedo hacer el servicio social si estoy desfasado?",
    answer:
      "No. El estatus de 'desfasado' implica la pérdida del derecho a reinscripción, por lo que no se te considera un alumno activo. Aunque el servicio social es para 'Alumnos o Egresados' , un estudiante desfasado no entra en ninguna de estas dos categorías. Primero debes regularizar tu situación mediante un dictamen de la COSIE para poder inscribirte y luego iniciar el trámite.",
  },
  {
    question: "¿En qué situaciones pierdo la beca?",
    answer:
      "Se puede perder o cancelar una beca por varias razones. La más común es dejar de ser alumno regular, ya que es un requisito para la mayoría de las becas. Otras causas incluyen: proporcionar información falsa, suspender los estudios, concluir la carrera, cometer faltas al reglamento estudiantil o incumplir con las obligaciones específicas de la beca. Fuente: Reglamento de Becas de la Fundación Politécnico, A.C. ",
  },
  {
    question: "¿Cómo puedo perder una beca en el IPN?",
    answer:
      "La causa más frecuente para perder una beca es volverse alumno irregular (reprobar una o más materias), ya que la regularidad académica es un requisito clave en la mayoría de las convocatorias. También se puede cancelar por motivos como suspender los estudios, ser sancionado por faltas disciplinarias, o no cumplir con los términos y obligaciones establecidos en la convocatoria de la beca y el reglamento.",
  },
  {
    question: "¿Puedo aplicar a movilidad académica si estoy desfasado?",
    answer:
      "No. Uno de los requisitos indispensables para aplicar al programa de movilidad académica, tanto nacional como internacional, es ser 'alumno regular'. Un alumno con estatus de 'desfasado' es, por definición, irregular y ha perdido su derecho a reinscripción , por lo que no es elegible.",
  },
  {
    question: "¿Puedo aplicar a movilidad académica si estoy en dictamen?",
    answer:
      "No. El programa de movilidad académica exige que el aspirante sea un 'alumno regular'. Estar en proceso de dictamen con la COSIE significa que tienes una situación académica irregular que necesita una resolución especial , por lo tanto, no cumples con el requisito de regularidad para ser candidato a la movilidad.",
  },
  {
    question: "¿Puedo aplicar a movilidad académica si tengo un ETS?",
    answer:
      "No. Para ser elegible para el programa de movilidad académica, es un requisito ser 'alumno regular'. Tener que presentar un ETS por una materia reprobada te coloca en situación de alumno irregular , lo que te impide cumplir con los requisitos de la convocatoria de movilidad.",
  },
  {
    question: "¿Cualquier alumno puede presentar extraordinario?",
    answer:
      "No. Aunque se considera un derecho, no aplica universalmente. Hay unidades de aprendizaje, como laboratorios o proyectos, que por su naturaleza práctica no ofrecen examen extraordinario. Además, algunos profesores o academias pueden establecer requisitos para tener derecho a presentarlo, como haber cumplido con un porcentaje mínimo de asistencia a clases.",
  },
  {
    question: "¿Cualquier alumno puede presentar un ETS?",
    answer:
      "No. El ETS está destinado principalmente a alumnos que han reprobado una o más asignaturas que ya cursaron. Por regla general, no se pueden presentar en ETS las unidades de aprendizaje que no han sido cursadas previamente. La única excepción es para alumnos que solicitan adelantar materias, lo cual se rige por un procedimiento específico y requiere respetar la seriación del plan de estudios.",
  },
  {
    question: "¿Quiénes son elegibles para presentar un ETS?",
    answer:
      "Principalmente, los alumnos que han reprobado una asignatura. También pueden presentarlo alumnos con buen desempeño que deseen adelantar materias, siempre que se respete la seriación del plan de estudios. Fuente: https://es.scribd.com/document/49987617/REGLAMENTO-DE-ESTUDIOS-ESCOLARIZADO-IPN ",
  },
  {
    question:
      "¿Cuál es el costo de un ETS en UPIICSA y cómo se realiza el pago?",
    answer:
      "El costo es una cuota fija por cada examen (por ejemplo, $20.00 MXN). El pago debe realizarse obligatoriamente mediante un depósito en ventanilla o practicaja en la institución bancaria designada (BBVA). Es crucial destacar que no se aceptan transferencias bancarias. Fuente: https://www.upiicsa.ipn.mx/assets/files/upiicsa/docs/estudiantes/gestion-escolar/vuelta-ets.pdf ",
  },
  {
    question:
      "¿Qué sucede una vez que genero mi comprobante de inscripción a ETS en el sistema SAES?",
    answer:
      "Una vez que se genera el comprobante de inscripción, la acción es definitiva y no se puede realizar ningún cambio en las materias o turnos seleccionados. Este documento impreso es tu única prueba oficial de inscripción. Fuente: https://www.upiicsa.ipn.mx/assets/files/upiicsa/docs/estudiantes/gestion-escolar/vuelta-ets.pdf ",
  },
  {
    question: "¿Qué documentos debo presentar el día de mi examen ETS?",
    answer:
      "Es indispensable que lleves contigo una identificación oficial con fotografía (preferentemente la credencial del IPN) y el comprobante de inscripción a ETS impreso. Fuente: https://www.upiicsa.ipn.mx/assets/files/upiicsa/docs/estudiantes/gestion-escolar/vuelta-ets.pdf ",
  },
  {
    question:
      "¿Cuál es la diferencia clave entre un examen extraordinario y un ETS?",
    answer:
      "El examen extraordinario es una segunda oportunidad inmediata para mejorar una calificación o acreditar una materia, y se conserva la calificación más alta. El ETS es un examen formal y riguroso que evalúa todo el contenido de la materia para acreditarla sin recursarla, y su resultado reemplaza por completo la calificación anterior. Fuente: https://sseis.upiicsa.ipn.mx/induccion/src/reglamento.pdf ",
  },
  {
    question:
      "¿Cómo afecta a mi calificación final presentar un examen extraordinario?",
    answer:
      "Se registrará la calificación más alta entre la obtenida en el periodo ordinario y la del examen extraordinario. Si repruebas el extraordinario pero ya habías aprobado la materia, conservas tu calificación aprobatoria original, por lo que no hay riesgo de bajar tu promedio. Fuente: https://sseis.upiicsa.ipn.mx/induccion/src/reglamento.pdf ",
  },
  {
    question:
      "¿Todas las unidades de aprendizaje ofrecen la opción de examen extraordinario?",
    answer:
      "No. Generalmente, las materias con un alto componente práctico, como laboratorios, talleres o proyectos integradores, no ofrecen esta opción. La disponibilidad depende del diseño pedagógico de la asignatura, no del profesor. Fuente: https://www.tiktok.com/@paqaprendas/video/7387485496114515206 ",
  },
  {
    question: "¿Qué es un alumno en situación irregular?",
    answer:
      "Es un estudiante que, al finalizar un periodo escolar, ha reprobado una o más asignaturas y, por lo tanto, no ha acreditado todas las unidades de aprendizaje conforme a su mapa curricular. Fuente: https://es.scribd.com/document/49987617/REGLAMENTO-DE-ESTUDIOS-ESCOLARIZADO-IPN ",
  },
  {
    question: "¿Qué significa tener el estatus de 'desfasado'?",
    answer:
      "Un alumno está 'desfasado' cuando ha reprobado una materia y ya ha agotado las tres oportunidades reglamentarias para acreditarla: el curso ordinario, el recurse y un semestre adicional para presentarla únicamente en ETS. Fuente: https://medium.com/@ccupiicsa/consejos-para-tu-reinscripcion-9b1b2d523a73 ",
  },
  {
    question: "¿Cuál es la consecuencia de quedar en estatus de 'desfasado'?",
    answer:
      "La consecuencia inmediata es la pérdida del derecho a reinscripción para el siguiente periodo escolar. El alumno queda bloqueado administrativamente y debe solicitar un dictamen a la COSIE para poder continuar sus estudios. Fuente: https://medium.com/@ccupiicsa/consejos-para-tu-reinscripcion-9b1b2d523a73 ",
  },
  {
    question:
      "¿Cuáles son las causas académicas para una baja definitiva del IPN?",
    answer:
      "Las principales causas son: 1) Adeudar cuatro o más asignaturas al inicio de un periodo de reinscripción. 2) Exceder el tiempo máximo establecido en el plan de estudios para concluir la carrera (generalmente 12 semestres). 3) No acreditar una o dos asignaturas reprobadas en los dos semestres posteriores a haberlas cursado por primera vez. Fuente: https://www.aplicaciones.abogadogeneral.ipn.mx/reglamentos/REGLAMENTO_ESCOLAR.pdf ",
  },
  {
    question: "¿Para qué sirve la Comisión de Situación Escolar (COSIE)?",
    answer:
      "Es un órgano que funciona como un 'tribunal académico' para analizar casos excepcionales. Tiene la facultad de otorgar dispensas a las reglas generales, como autorizar una oportunidad adicional para presentar ETS a un alumno 'desfasado'. Fuente: https://www.upiicsa.ipn.mx/assets/files/upiicsa/docs/estudiantes/gestion-escolar/cosie-01.pdf ",
  },
  {
    question: "¿Qué documentos necesito para solicitar un dictamen a la COSIE?",
    answer:
      "Debes presentar el formato COSIE-01, una carta de exposición de motivos detallada explicando las causas de tu situación, y lo más importante, documentos probatorios (informes médicos, constancias laborales, actas legales, etc.) que respalden y evidencien tus argumentos. Fuente: https://www.upiicsa.ipn.mx/estudiantes/gestion-escolar.html ",
  },
  {
    question: "¿Dónde puedo encontrar guías de estudio oficiales para los ETS?",
    answer:
      "La UPIICSA no tiene un repositorio centralizado de guías oficiales para ETS. El recurso oficial más fiable es el programa de estudios completo (temario) de la materia, que se puede solicitar en la academia correspondiente. Muchos estudiantes recurren a recursos no oficiales creados por otros alumnos en plataformas como YouTube y Scribd. Fuente: https://www.youtube.com/watch?v=pPz1klU8qMI ",
  },
  {
    question:
      "¿A dónde puedo acudir si necesito asesoría académica para un ETS?",
    answer:
      "La Coordinación de Tutorías de UPIICSA ofrece programas de 'Tutoría de Regularización Académica', diseñados específicamente para preparar a los alumnos para presentar exámenes ETS. También existen asesorías permanentes durante el semestre. Fuente: https://www.upiicsa.ipn.mx/assets/files/upiicsa/docs//inicio/tutorias-25.pdf ",
  },
  {
    question:
      "¿Con quién debo hablar si tengo un problema con mi inscripción en SAES vs. una duda sobre el contenido del examen?",
    answer:
      "Para problemas de inscripción, pagos o trámites en el SAES, contacta al Departamento de Gestión Escolar (gestion_upiicsa@ipn.mx). Para dudas sobre el contenido del examen, temarios o asesorías académicas, acude a la Academia correspondiente y a la Coordinación de Tutorías. Fuente: https://servicios.dae.ipn.mx/cambiosua/nse_correos.html  y https://www.upiicsa.ipn.mx/estudiantes/tutorias.html ",
  },
  {
    question:
      "¿Puedo dar de baja una materia que estoy cursando por segunda vez (recurse)?",
    answer:
      "No. El reglamento establece que cuando un alumno está recursando una unidad de aprendizaje, no procederá la baja de la misma. Fuente: https://sseis.upiicsa.ipn.mx/induccion/src/reglamento.pdf ",
  },
  {
    question:
      "¿Cuáles son los requisitos de créditos para iniciar el Servicio Social?",
    answer:
      "Para poder iniciar el Servicio Social, el alumno debe tener una constancia que acredite haber cursado y aprobado, como mínimo, el 70% de los créditos totales de su carrera. Fuente: https://www.upiicsa.ipn.mx/estudiantes/servicio-social.html ",
  },
  {
    question:
      "¿Existe un calendario específico para la realización de las prácticas profesionales?",
    answer:
      "No se estipulan fechas específicas de inicio. El trámite debe definir un periodo y horario para la práctica que no sea mayor a seis meses, con el objetivo de cumplir 720 horas totales (máximo 8 horas diarias de lunes a viernes). Fuente: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html",
  },
  {
    question:
      "¿Están definidas las fechas para el periodo de prácticas profesionales?",
    answer:
      "No se estipulan fechas específicas de inicio. El trámite debe definir un periodo y horario para la práctica que no sea mayor a seis meses, con el objetivo de cumplir 720 horas totales (máximo 8 horas diarias de lunes a viernes). Fuente: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html",
  },
  {
    question:
      "¿Cuáles son los plazos establecidos para comenzar y finalizar las prácticas profesionales?",
    answer:
      "No se estipulan fechas específicas de inicio. El trámite debe definir un periodo y horario para la práctica que no sea mayor a seis meses, con el objetivo de cumplir 720 horas totales (máximo 8 horas diarias de lunes a viernes). Fuente: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html",
  },
  {
    question:
      "¿Hay un cronograma oficial para el programa de prácticas profesionales?",
    answer:
      "No se estipulan fechas específicas de inicio. El trámite debe definir un periodo y horario para la práctica que no sea mayor a seis meses, con el objetivo de cumplir 720 horas totales (máximo 8 horas diarias de lunes a viernes). Fuente: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html",
  },
  {
    question: "¿Cuándo se pueden hacer las prácticas profesionales?",
    answer:
      "No se estipulan fechas específicas de inicio. El trámite debe definir un periodo y horario para la práctica que no sea mayor a seis meses, con el objetivo de cumplir 720 horas totales (máximo 8 horas diarias de lunes a viernes). Fuente: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html",
  },
  {
    question: "¿Hay fechas límite para empezar las prácticas?",
    answer:
      "No se estipulan fechas específicas de inicio. El trámite debe definir un periodo y horario para la práctica que no sea mayor a seis meses, con el objetivo de cumplir 720 horas totales (máximo 8 horas diarias de lunes a viernes). Fuente: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html",
  },
  {
    question: "¿Tengo que hacer las prácticas en algún momento en particular?",
    answer:
      "No se estipulan fechas específicas de inicio. El trámite debe definir un periodo y horario para la práctica que no sea mayor a seis meses, con el objetivo de cumplir 720 horas totales (máximo 8 horas diarias de lunes a viernes). Fuente: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html",
  },
  {
    question: "¿Hay algún periodo concreto para realizar las prácticas?",
    answer:
      "No se estipulan fechas específicas de inicio. El trámite debe definir un periodo y horario para la práctica que no sea mayor a seis meses, con el objetivo de cumplir 720 horas totales (máximo 8 horas diarias de lunes a viernes). Fuente: https://www.upiicsa.ipn.mx/estudiantes/titulacion.html",
  },
];

export class TransformersJsStrategy implements AnsweringStrategy {
  private extractor: any = null; // To hold the pipeline instance
  private corpus_embeddings: number[][] = [];

  async initialize(): Promise<void> {
    console.log("Initializing Transformers.js model...");
    const modelName = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
    this.extractor = await pipeline("feature-extraction", modelName);

    const corpus = knowledge_base.map((item) => item.question);
    const result = await this.extractor(corpus, {
      pooling: "mean",
      normalize: true,
    });

    const flat_embeddings: number[] = Array.from(result.data);
    const embeddingDim = result.dims[1];
    for (let i = 0; i < result.dims[0]; i++) {
      this.corpus_embeddings.push(
        flat_embeddings.slice(i * embeddingDim, (i + 1) * embeddingDim),
      );
    }
    console.log("Transformers.js model ready.");
  }

  async getAnswer(question: string): Promise<string> {
    if (!this.extractor) {
      throw new Error("Strategy not initialized. Call initialize() first.");
    }

    const question_embedding_result = await this.extractor(question, {
      pooling: "mean",
      normalize: true,
    });
    const question_embedding: number[] = Array.from(
      question_embedding_result.data,
    );

    let best_match = { index: -1, score: -1 };
    for (let i = 0; i < this.corpus_embeddings.length; i++) {
      const corpus_embeddings = this.corpus_embeddings[i];
      if (!corpus_embeddings) {
        continue;
      }
      const score = cos_sim(question_embedding, corpus_embeddings);
      if (score > best_match.score) {
        best_match = { index: i, score: score };
      }
    }

    if (best_match.score < 0.5) {
      return "I'm sorry, I don't have information about that.";
    }

    const answer = knowledge_base[best_match?.index]?.answer;
    if (!answer) {
      return "I'm sorry, I don't have an answer for that.";
    }

    return answer;
  }
}
