import pandas as pd
import streamlit as st
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

data = pd.read_csv('dataset.csv', encoding='latin1')
data.fillna('', inplace=True)  # Reemplaza los valores NaN con cadenas vacías
preguntas = data["pregunta"].tolist()
respuestas = data["respuesta"].tolist()

vectorizer = TfidfVectorizer()
preguntas_vectorizadas = vectorizer.fit_transform(preguntas)
respuestas_vectorizadas = vectorizer.transform(respuestas)

modelo = NearestNeighbors(n_neighbors=1)
modelo.fit(preguntas_vectorizadas)

def obtener_respuesta(pregunta):
    pregunta_vectorizada = vectorizer.transform([pregunta])
    indice_mas_cercano = modelo.kneighbors(pregunta_vectorizada)[1][0][0]
    return respuestas[indice_mas_cercano]

st.title("Chatbot-UPIICSA")
st.write("Si no sientes que la respuesta del bot tenga sentido, hazla llegar a algún alumnx consejerx o mándala al formulario https://forms.gle/YmpQqeLifvMDRymDA para mejorar el bot.")

pregunta = st.text_input("Pregunta:")
if st.button("Enviar"):
    respuesta = obtener_respuesta(pregunta)
    if respuesta:
        st.markdown(f'**Respuesta:**\n\n{respuesta}')
    else:
        st.markdown('Lo siento, esta pregunta aún no soy capaz de responderla, hazla llegar a algún alumnx consejerx o mándala al forms https://forms.gle/YmpQqeLifvMDRymDA')

for _ in range(10):  # Añadir espacios en blanco
    st.write('')

st.markdown('---')
st.write('Creado por Eduardo Domínguez Navarrete')
st.write('Alumno Consejero Ing. Informática')
