
Ext.define('MapApp.controller.MapController', {
    extend: 'Ext.app.Controller',

    init: function () {
        var me = this;
        me.missionwindow = null;

        me.listen({
            'controller': {
                '#MainController': {
                    onMessageRequest: function (e) {
                        me.onMessageRequest(e);
                    }
                },
                '#IoController': {
                    onProcessHTML5Message: function (e) {
                        me.onProcessHTML5Message(e);
                    }
                }
            }


        });
    },
    initMap: function () {
        var me = this;


        require(["esri/map",
                 "esri/dijit/PopupTemplate",
                 "esri/request",
                 "esri/geometry/Point",
                 "esri/graphic",
                 "esri/layers/FeatureLayer",
                 "esri/InfoTemplate",
                 "dojo/dom-construct",
                 "dojo/on",
                 "dojo/_base/array",
                 "dojo/domReady!"
             ], function (Map,
                          FeatureLayer,
                          InfoTemplate,
                          PopupTemplate,
                          esriRequest,
                          Point,
                          Graphic,
                          domConstruct,
                          on,
                          array) {




            me.map = new Map("map", {
                center: [-56.049, 38.485],
                zoom: 3,
                basemap: "streets"
            });

            me.map.mapLayers = [];

            //create a feature collection for the flickr photos
            var featureCollection = {
                "layerDefinition": null,
                "featureSet": {
                    "features": [],
                    "geometryType": "esriGeometryPoint"
                }
            };
            featureCollection.layerDefinition = {
                "geometryType": "esriGeometryPoint",
                "objectIdField": "__OBJECTID",
                "type": "Feature Layer",
                "typeIdField": "",
                "drawingInfo": {
                    "renderer": {
                        "type": "simple",
                        "symbol": {
                            "type": "esriPMS",
                            "url": "http://static.arcgis.com/images/Symbols/Basic/RedSphere.png",
                            "imageData": "/resources/images/flickr.png",////link to your img,
                            "contentType": "image/png",
                            "width": 20,
                            "height": 20
                        }
                    }
                },
                "fields": [{
                    "name": "__OBJECTID",
                    "alias": "__OBJECTID",
                    "type": "esriFieldTypeOID",
                    "editable": false,
                    "domain": null
                }],
                "types": [],
                "capabilities": "Query"
            };

            //define a popup template
            var popupTemplate = new PopupTemplate({
                title: "{title}",
                description: "{description}",
                url: 'http://localhost:63342/MapApp'
            });

            //create a feature layer based on the feature collection
            me.map.featureLayer = new FeatureLayer(featureCollection, {
                id: 'flickrLayer',
                infoTemplate: popupTemplate
            });

            //add the feature layer that contains the flickr photos to the map

            me.map.addLayers([me.map.featureLayer]);

            //me.map.infoWindow.resize(150,105);
            me.map.mapLayers.push(me.map.featureLayer);  //this client side map layer is the maps graphics layer



        dojo.connect(me.map, "onMouseDrag", function (evt) {//check the name of the event!!!

            if (me.map.infoWindow.isShowing) {
                console.debug('Map event onMouseDrag...');
                var loc = me.map.infoWindow.getSelectedFeature().geometry;
                if (!me.map.extent.contains(loc)) {
                    me.map.infoWindow.hide();
                }
            }
        });

        //associate the features with the popup on click
        dojo.connect(me.map.featureLayer, "onClick", function (evt){ //check the name of the event!!!
            console.debug('Map onFeatureClickFeature event...');
            me.onFeatureClick(evt);
        });

        dojo.connect(me.map, "onLayerAdd", function (results) {
            console.debug("Map onLayersAdd event");
            requestPhotos();
        });

        dojo.connect(me.map, "onLoad", function () {
            console.debug("Map onLoad event");
            me.onMapLoad();
        });

        dojo.connect(me.map, "onClick", function () {
            console.debug('Map onMapClick event...');
            me.onMapClick();
        });

        function requestPhotos() {
            //get geotagged photos from flickr
            //tags=flower&tagmode=all
            var requestHandle = esriRequest({
                url: "http://api.flickr.com/services/feeds/geo?&format=json",
                callbackParamName: "jsoncallback",
                content: { f: "json" },
                handleAs: "json"
            });
            requestHandle.then(requestSucceeded, requestFailed);


            function requestSucceeded(response, io) {
                //loop through the items and add to the feature layer
                var features = [];
                array.forEach(response.items, function (item) {
                    var attr = {};
                    attr["description"] = item.description;
                    attr["title"] = item.title ? item.title : "Flickr Photo";

                    var geometry = new Point(item);

                    var graphic = new Graphic(geometry);
                    graphic.setAttributes(attr);
                    features.push(graphic);
                });

                me.map.featureLayer.applyEdits(features, null, null);
            }

            function requestFailed(error) {
                console.log(' Cannot grab flickr Layer. Request failed');
            }
        }

        });

    },

    //HTML5 MESSAGES received from the IOController
    onProcessHTML5Message: function (evt) {

    },
    onMessageRequest: function (e) {
        var me = this;
        console.log('MapController recibido un MessageRequest desde MainController. Remitiendo a IoCOntroller.');
        me.fireEvent('onMessageRequest', e, this);
    }
    ,
    //MAP EVENT HANDLERS!!!
    onMapLoad: function (evt) {
        var me = this;

        //var myPoint = new Point(-87.6278, 41.8819);
        //var symbol = new SimpleMarkerSymbol().setColor(new Color('blue'));
        //var graphic = new Graphic(myPoint, symbol);
        //me.map.graphics.add(graphic);

        console.log('Map is loaded...');
    },
    onMapClick: function (evt) {
        var me = this;
        console.log('Click on the MAP...');
        me.fireEvent('onMessageRequest', 'CLICK_DATA', me);
    },
    onFeatureClick: function (evt) {
        var me = this;
        me.map.infoWindow.setFeatures([evt.graphic]);
        console.log('Click on a feature of the MAP...');
        me.fireEvent('onMessageRequest', 'FEATURE_CLICK', me);
    }
});

