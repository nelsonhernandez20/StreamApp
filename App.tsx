import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

const App = () => {
  const [responseText, setResponseText] = useState('');
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'white' : 'white',
  };

  useEffect(() => {
    const data = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Cuentame un chiste largo',
        },
      ],
      stream: true,
      max_tokens: 60,
    };

    fetch('https://api.openai.com/v1/chat/completions', {
      reactNative: {textStreaming: true},
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer YOUR_API_KEY',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        const reader = response.body.getReader();

        // Función para leer cada chunk del stream
        function read() {
          return reader.read().then(({done, value}) => {
            if (done) {
              console.log('Stream completo');
              return;
            }
            const textChunk = new TextDecoder('utf-8').decode(value);
            console.log(textChunk, 'cada chunk');
            for (const obj of extraerDatos(textChunk)) {
              // const data = limpiarYConvertir(obj); // Ahora se imprimirá cada objeto JSON
              if (obj.choices[0].delta.content !== undefined) {
                const data = obj.choices[0].delta.content;
                setResponseText(prevText => prevText + data);
              }
            }
            return read(); // Llama a read() recursivamente hasta que el stream se complete
          });
        }

        return read(); // Comienza a leer el stream
      })
      .catch(error =>
        console.error('Error al solicitar la API de GPT-3.5 Turbo:', error),
      );
  }, []);

  function* extraerDatos(inputString) {
    const dataRegex = /data: \{.*?\}(?=\s|$)/g;
    const matches = inputString.match(dataRegex);

    if (matches) {
      for (const match of matches) {
        const jsonPart = match.slice(6);
        try {
          const dataObject = JSON.parse(jsonPart);
          yield dataObject;
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    }
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Text style={styles.responseText}>{responseText}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  responseText: {
    fontSize: 16,
    color: 'black',
    padding: 20,
  },
});

export default App;
