import openai
import streamlit as st

openai.api_key = "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"

def generar_respuesta(pregunta):
    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=pregunta,
        max_tokens=1024,
        n=1,
        stop=None,
        temperature=0.5,
    )
    return response.choices[0].text.strip()

st.title("Chatbot-UPIICSA")
st.write("Si no sientes que la respuesta del bot tenga sentido, hazla llegar a algún alumnx consejerx o mándala al formulario https://forms.gle/YmpQqeLifvMDRymDA para mejorar el bot.")

pregunta = st.text_input("Pregunta:")
if st.button("Enviar"):
    respuesta = generar_respuesta(pregunta)
    if respuesta:
        st.text("Respuesta: {}".format(respuesta))
    else:
        st.text("Lo siento, esta pregunta aún no soy capaz de responderla, hazla llegar a algún alumnx consejerx o mándala al forms https://forms.gle/YmpQqeLifvMDRymDA")
