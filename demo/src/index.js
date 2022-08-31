
import mirador from 'mirador/dist/es/src/index';
import annotationPlugins from '../../src';
import LocalStorageAdapter from '../../src/LocalStorageAdapter';
import AnnototAdapter from '../../src/AnnototAdapter';
import CatchPyAdapter from '../../src/CatchPyAdapter';

var jwt = require('jsonwebtoken');

function make_jwt(apikey, secret, user_id=null, ttl=3600){
  var date = new Date();
  return jwt.sign({
    "consumerKey": apikey,
    "userId": user_id,
    "ttl": ttl,
    "issuedAt": date.toISOString()
  }, secret, { expiresIn: ttl })
}
var token = make_jwt("localApp", "colessecretstring", "cole_crawford");

// const endpointUrl = 'http://127.0.0.1:3000/annotations';
// let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb25zdW1lcktleSI6ImxvY2FsQXBwIiwidXNlcklkIjoiY29sZV9jcmF3Zm9yZCIsImlzc3VlZEF0IjoiMjAyMS0wOS0xN1QyMDo1NzoyMy4xNjQyMDQrMDA6MDAiLCJ0dGwiOjUwMDAwLCJvdmVycmlkZSI6W119.R14vP__Cm-Owx7_RK90OsyxN_nhY8SkC0rYwYz4OqDc';

const config = {
  annotation: {
    // adapter: (canvasId) => new AnnototAdapter(canvasId, endpointUrl),
    adapter: (canvasId) => new CatchPyAdapter({
      jwt: token,
      canvasId: canvasId,
      endpointUrl: 'http://localhost:8000/catchpy',
      contextId: "asdfg",
      collectionId: "collectionided",
      userId: "cole_crawford",
      userName: "Cole Crawford",
      platformName: "localApp",
      extra: [
        {
          "name": "workId",
          "value": "Friday"
        },
        {
          "name": "objectId",
          "value": "abc123-def456"
        }
      ]
    }),
    hideAddAnnotationButton: false,
    // adapter: (canvasId) => new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),

    exportLocalStorageAnnotations: false, // display annotation JSON export button
  },
  id: 'demo',
  window: {
    defaultSideBarPanel: 'annotations',
    sideBarOpenByDefault: true,
  },
  windows: [{
    loadedManifest: 'https://iiif.harvardartmuseums.org/manifests/object/195903',
  }],
};

mirador.viewer(config, [...annotationPlugins]);
// window.miradorInstance = miradorInstance;
// window.Mirador = Mirador;