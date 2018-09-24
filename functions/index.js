// Copyright 2018, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Import the Dialogflow module and response creation dependencies
// from the Actions on Google client library.
const {
  dialogflow,
  BasicCard,
  Carousel,
  Image,
  LinkOutSuggestion,
  Permission
} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
  // Asks the user's permission to know their name, for personalization.
  conv.ask(new Permission({
    context: 'Olá, ',
    permissions: 'NAME',
  }));
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    // If the user denied our request, go ahead with the conversation.
    conv.ask(`Sem problemas. Diga o que você deseja?`);
  } else {
    // If the user accepted our request, store their name in
    // the 'conv.data' object for the duration of the conversation.
    conv.data.userName = conv.user.name.display;
    conv.ask(`Obrigado ${conv.data.userName}. Diga o que você deseja?`);
  }
});

app.intent('Request a Doctor', (conv, {speciality, date}) => {
  conv.ask('Selecione um dos seguintes médicos:');
  conv.ask(new Carousel({
      items: {
        'PAULO': {
            title: 'Dr. Paulo',
            description: '100 Reais',
            image: new Image({
                url: 'https://blog.medcel.com.br/wp-content/uploads/2017/03/O-QUE-FAZ-UM-NEFROLOGISTA.jpg',
                alt: 'Dr. Paulo'
            })
        },
        'MONICA': {
            title: 'Dra. Monica',
            description: '150 Reais',
            image: new Image({
                url: 'https://blog.ipog.edu.br/wp-content/uploads/2017/10/m%C3%A9dico.jpg',
                alt: 'Dr. Monica'
            })
        }
      }  
    }))
});

app.intent('actions.intent.OPTION', (conv, params, option) => {
    let response = 'Certo, você selecionou ';
    
    if (option) {
        if (option === 'PAULO') {
            response += 'o Dr. Paulo';
        } else if (option === 'MONICA') {
            response += 'a Dra. Monica';
        }
        response += '. Para confirmar a sua consulta acesse o link a seguir';
    } else {
        response = 'Você não selecionou um item válido';
    }
    
    conv.ask(response);
    conv.close(new LinkOutSuggestion({
        name: 'e Pagar',
        url: 'https://docway.com.br/',
    }));
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);