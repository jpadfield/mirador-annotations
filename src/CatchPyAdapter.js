/** */

export default class CatchPyAdapter {
    /** */
    constructor({jwt, canvasId, endpointUrl, platformName, contextId="1", collectionId="1", userId="", userName="", extra=[], context="http://catchpy.harvardx.harvard.edu.s3.amazonaws.com/jsonld/catch_context_jsonld.json", schemaVersion="1.2.0"} = {}) {
      this.canvasId = canvasId;
      this.endpointUrl = endpointUrl;
      this.jwt = jwt;
      this.userId = userId;
      this.userName = userName;
      this.platformName = platformName;
      this.contextId = contextId;
      this.collectionId = collectionId;
      this.context = context;
      this.schemaVersion = schemaVersion;
      this.extra = extra;
      // extra is an array of objects with "name" and "value" properties - easy way to store additional data your application needs but CatchPy doesn't care about
      // no good filtering for that currently implemented
      // "extra": [
      //   {
      //    "name": "extra1",
      //    "value": "value1"
      //   }
      // ]
    }
  
    get annotationPageId() {
      return `${this.endpointUrl}/pages?uri=${this.canvasId}`;
    }

    createPayload(annotation){
      return {
        "id": annotation.id,
        "@context": this.context,
        "type": "Annotation",
        "schema_version": this.schemaVersion,
        "creator": {
          "id": this.userId,
          "name": this.userName 
        },
        "permissions": {
          "can_read": [],
          "can_update": [this.userId],
          "can_delete": [this.userId],
          "can_admin": [this.userId]
        },
        "platform": {
          "platform_name": this.platformName,   
          "context_id": this.contextId,  
          "collection_id": this.collectionId,
          "target_source_id": this.canvasId,
          "extra": this.extra
        },
        "body": {
          "type": "List",
          "items": [{
            "type": annotation.body.type,
            "format": "text/html",
            "value": annotation.body.value,
            "purpose": annotation.motivation
          }]
        },
        "target": {
          "type": "List",
          "items": [
            {
              "source": this.canvasId,
              "type": "Image",
              "selector": {
                "type": "Choice",
                "items": annotation.target.selector
              }
            }
          ]
        }
      };
    }
  
    async create(annotation) {
      return fetch(`${this.endpointUrl}/annos/`, {
        body: JSON.stringify(this.createPayload(annotation)),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.jwt}`
        },
        method: 'POST',
      })
      .then((response) => this.all())
      .catch(() => this.all());
    }
  
    async update(annotation) {
      return fetch(`${this.endpointUrl}/annos/${encodeURIComponent(annotation.id)}`, {
        body: JSON.stringify(this.createPayload(annotation)),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.jwt}`
        },
        method: 'PUT',
      })
        .then((response) => this.all())
        .catch(() => this.all());
    }
  
    async delete(annoId) {
      return fetch(`${this.endpointUrl}/annos/${encodeURIComponent(annoId)}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.jwt}`
        },
        method: 'DELETE',
      })
        .then((response) => this.all())
        .catch(() => this.all());
    }
  
    async get(annoId) {
      return (await fetch(`${this.endpointUrl}/annos/${encodeURIComponent(annoId)}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.jwt}`
        },
      })).json();
    }
  
    async all() {
      let params = {
        limit: -1,
        "source_id": this.canvasId,
        "platform": this.platformName
      }
      let queryString = '';
      for(let key in params){
        queryString += `&${key}=${params[key]}`;
      }
      const res = await fetch(`${this.endpointUrl}/annos/?${queryString}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.jwt}`
        },
        method: 'GET',
      });
      let annos = await res.json();
      return this.createAnnotationPage(annos);
    }

    // TODO: match this to schema better
    formatAnnotation(item){
      let bound = null;
      item.target.items.forEach((b) => {
        if(b.type == "Image"){
            bound = b;
        }
      })
      return {
        "body": {
          "type": item.body.items[0].type,
          "value": item.body.items[0].value
        },
        "id": item.id,
        "motivation": item.body.items[0].purpose,
        "target": {
          "source": bound.source,
          "selector": bound.selector.items
        },
        "type": item.type
      }
    }

    /** Creates an AnnotationPage from a list of annotations */
    createAnnotationPage(annos) {
      let formattedAnnos = [];
      annos.rows.forEach((anno) => formattedAnnos.push(this.formatAnnotation(anno)));
      if (Array.isArray(formattedAnnos)) {
        return {
          id: this.annotationPageId,
          items: formattedAnnos,
          type: 'AnnotationPage',
        };
      }
      return annos;
    }

  }