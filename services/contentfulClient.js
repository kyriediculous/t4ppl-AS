const contentful   = require('contentful'),
      space        = process.env.SPACE_ID || 'qwmvif36yygb',
      accessToken  = process.env.CDA_TOKEN || '09b67755474b6e59dc0537c1c4bde640e2046f3e383ceb2e81c7718853e819fb';


      var client = contentful.createClient({
        accessToken: accessToken,
        space: space
      })

      exports.client = client;
