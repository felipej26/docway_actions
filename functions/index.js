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

var request = require('request');
var rp = require('request-promise');

var token;
var medicos;

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
    
    var options = {
        method: 'POST',
        uri: 'https://dev-gateway.api.docway.com.br/api/token',
        form: {
            client_id:'felipej2626@gmail.com',
            client_secret:'123456',
            grant_type:'password'
        },
        json: true
    }

    return rp(options)
        .then(function(access) {
            console.log('Body: ' + JSON.stringify(access));
            console.log('AccessToken: ' + JSON.stringify(access.access_token))
            token = access.access_token
            console.log('Token: ' + JSON.stringify(token));

            return conv.ask(new Permission({
                context: 'Olá, ',
                permissions: 'NAME',
              }));
        })
        .catch(function(err) {
            return console.log('Error: ' + err);
        });

        /*
    request.post({
        url: 'https://dev-gateway.api.docway.com.br/api/token',
        form: {
            client_id:'felipej2626@gmail.com',
            client_secret:'123456',
            grant_type:'password'
        }
    }, function(err, response, body) {
        if (err) {
            return console.error('Error', err);
        }
        console.log('Body: ' + JSON.stringify(body));
        token = JSON.parse(body).access_token
    });
*/
  // Asks the user's permission to know their name, for personalization.
  
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

    console.log('Token: ' + JSON.stringify(token));

    var options = {
        method: 'GET',
        uri: 'https://dev-gateway.api.docway.com.br/api/doctors?isSUSEnabled=false&latitude=-23.596973&longitude=-46.686679&specialtyId=2',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        json: true
    }
    
    return rp(options)
        .then(function(medicos) {

            console.log('Medicos: ' + JSON.stringify(medicos));

            var medico = medicos[0];
            console.log('CHegou Aqui 1');

            conv.ask('Selecione um dos seguintes médicos:');        
            return conv.ask(new Carousel({
                items: {
                    [medico.id]: {
                        title: medico.name,
                        description: 'R$ ' + medico.appointmentPrice,
                        image: new Image({
                            url: medico.profilePhotoUrl,
                            alt: medico.name
                        })
                    }, 
                    [medico.id + '11']: {
                        title: 'Tentar Novamente',
                        description: 'teste',
                        image: new Image({
                            url: 'https://blog.medcel.com.br/wp-content/uploads/2017/03/O-QUE-FAZ-UM-NEFROLOGISTA.jpg',
                            alt: 'Teste'
                        })
                    }
                }
            }))

        })
        .catch(function(err) {
            console.log('Error', err);
            return conv.close('Poxa, erramos em algo');
        });
/*
    return request.get({
        headers: {
            'Authorization': 'Bearer ' + token
        },
        url: 'https://dev-gateway.api.docway.com.br/api/doctors?isSUSEnabled=false&latitude=-23.596973&longitude=-46.686679&specialtyId=2'
    }, function(err, response, body) {
        if (err) {
            return console.error('Error', err);
        }
        console.log('Body: ' + JSON.stringify(body));
        
        medicos = JSON.parse(body);
        medico = medicos[0];
        conv.ask('Selecione um dos seguintes médicos:');
        conv.ask(new Carousel({
            items: {
                [medico.id]: {
                    title: medico.name,
                    description: medico.appointmentPrice,
                    image: new Image({
                        url: medicos.profilePhotoUrl,
                        alt: medico.name
                    })
                }
            }
        }))      
    });
*/
    /*
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
    */
});

app.intent('actions.intent.OPTION', (conv, params, option) => {
    let response = 'Certo, você selecionou ';
    
    console.log('Chegou Aqui 2');

    if (option) {

        /*
        if (option === 'PAULO') {
            response += 'o Dr. Paulo';
        } else if (option === 'MONICA') {
            response += 'a Dra. Monica';
        }
        */

        console.log('Chegou Aqui 3');

        if (option === 'c30a263e-1cbe-47f0-b0c9-f377c1d6ace1') {
            console.log('Chegou Aqui 4');
            response += 'o Dr. Docway';
        }

        if (option === 'c30a263e-1cbe-47f0-b0c9-f377c1d6ace111') {
            console.log('Chegou Aqui 5');
            response += 'Tente Novamente';
        }
        console.log('Chegou Aqui 6');
        response += '. Para confirmar a sua consulta acesse o link a seguir';
    } else {
        console.log('Chegou Aqui 7');
        response = 'Você não selecionou um item válido';
    }


    var options = {
        method: 'POST',
        uri: 'https://dev-gateway.api.docway.com.br/api/appointments',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        body: {
            requesterid:'5bd0c6da-8806-4ece-927d-348722df1351',
            specialty: {
                id: '2'
            },
            dateappointment: '2018-09-25T18:00:00',
            type: '1',
            address: {
                street: 'Alameda Vicente Pizon',
                number: '54',
                neighborhood: 'Vila Olimpia',
                city: 'São Paulo',
                state: 'São Paulo'
            },
            paymentmethod: '1',
            creditcardid: '1655',
            promotionalCode: 'JEFF',
            sellerid: option
        },
        json: true
    }

    return rp(options)
    .then(function(success) {

        console.log('Chegou Aqui 8');

        conv.ask(response);
        return conv.close(new LinkOutSuggestion({
            name: 'e Pagar',
            url: 'https://docway.com.br/',
        }));
    })
    .catch(function(err) {

        console.log('Chegou Aqui 9');

        console.log('Error', err);
        return conv.close('Poxa, erramos em algo');
    });
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);