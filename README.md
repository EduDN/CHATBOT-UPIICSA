# CHATBOT-UPIICSA

Este proyecto es un chatbot creado con el propósito de ayudar a la comunidad de UPIICSA a obtener respuestas rápidas y eficientes a sus preguntas frecuentes. El código está construido utilizando Python, junto con las bibliotecas pandas, Streamlit, y Scikit-learn.

## Código

El siguiente es un resumen del código:

1. Se importan las bibliotecas necesarias (pandas, Streamlit, y Scikit-learn).
2. Se carga el conjunto de datos que contiene las preguntas y respuestas, y se reemplazan los valores NaN con cadenas vacías.
3. Se utiliza la técnica TF-IDF para vectorizar las preguntas y respuestas.
4. Se crea un modelo NearestNeighbors para encontrar la respuesta más cercana a una pregunta ingresada.
5. Se crea una función para obtener la respuesta basada en el modelo.
6. Se utiliza Streamlit para crear una interfaz de usuario sencilla, que permite al usuario ingresar preguntas y obtener respuestas.

## Instrucciones de uso

1. Instale las bibliotecas necesarias: pandas, Streamlit y Scikit-learn.
2. Ejecute el código en su entorno Python preferido.
3. La interfaz de usuario de Streamlit se abrirá en su navegador web predeterminado.
4. Ingrese su pregunta en el cuadro de texto y haga clic en "Enviar".
5. La respuesta aparecerá en la misma página.
6. Si el chatbot no puede responder a su pregunta, se le proporcionará un enlace para enviar la pregunta a través de un formulario de Google: https://forms.gle/YmpQqeLifvMDRymDA

## Contribuir

Si desea contribuir a este proyecto, no dude en enviar preguntas que no hayan sido respondidas correctamente a través del formulario mencionado anteriormente.

---

Creado por Eduardo Domínguez Navarrete.
