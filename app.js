
import http from 'http';
import querystring from 'querystring';
import url from 'url';

import { pipeline, env } from '@xenova/transformers';
import { console } from 'inspector';

class MyClassificationPipeline {
  // static task = 'text-classification';
  // static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
  static task = 'sentiment-analysis';
  static model = 'Xenova/twitter-roberta-base-sentiment-latest';
  static instance = null;

  static async getInstance(progress_callback = null) {

    if (this.instance === null) {

      // NOTE: Uncomment this to change the cache directory
      // env.cacheDir = './.cache';

      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

// Comment out this line if you don't want to start loading the model as soon as the server starts.
// If commented out, the model will be loaded when the first request is received (i.e,. lazily).
MyClassificationPipeline.getInstance();

//Translate API
const translateText = async (sourceText, sourceLang = 'id', targetLang = 'en') => {
  let uri = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
  console.log('Translating text:', sourceText);
  const res = await fetch(uri);
  return await res.json();
}

const mapNewText = (texts) => {
  let newText = '';
  texts.forEach(element => {
    newText += element[0] || '';
  });
  return newText;
}

// Define the HTTP server
const server = http.createServer();
const hostname = '127.0.0.1';
const port = 3000;

// Listen for requests made to the server
server.on('request', async (req, res) => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url);
  console.log(parsedUrl);

  // Extract the query parameters
  const { text, sourceLang = 'id', targetLang = 'en' } = querystring.parse(parsedUrl.query);

  // Set the response headers
  // res.setHeader('Content-Type', 'application/json');

  let response;
  let tranlateText = await translateText(text, sourceLang, targetLang);
  let newText = mapNewText(tranlateText[0]);
  console.log(newText);

  if (parsedUrl.pathname === '/classify' && newText) {
    const classifier = await MyClassificationPipeline.getInstance();
    response = await classifier(newText);
    response[0].text = text;
    response[0].tranlate_text = newText;
    res.statusCode = 200;
  } else {
    response = { 'error': 'Bad request' }
    res.statusCode = 400;
  }

  // Send the JSON response
  res.end(JSON.stringify(response[0] || []));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});