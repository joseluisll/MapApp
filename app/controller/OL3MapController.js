Ext.define('MapApp.controller.OL3MapController', {
    extend: 'Ext.app.Controller',

    init: function () {
        var me = this;
        me.missionwindow = null;
        me.isDrawing = false;
        me.operatingmode='STANDALONE';
        me.listen({
            'controller': {
                '#MainController': {

                    onMapStopDrawing: function (e) {
                        me.onMapStopDrawing(e);
                    },
                    OnMapPublishFeatures:function (e) {
                        me.OnMapPublishFeatures(e);
                    }

                },
                '#IoController': {
                    onProcessHTML5Message: function (e) {
                        me.onProcessHTML5Message(e);
                    },
                    onKeepAliveError:function(e) {
                        me.onKeepAliveError(e);
                    },
                    onStandAloneMode:function(e) {
                        me.onStandAloneMode(e);
                    },
                    onSlaveMode:function(e) {
                        me.onSlaveMode(e);
                    }
                }
            }


        });
    },
    initMap: function () {
        var me = this;
        var osm_source = new ol.source.OSM({
            url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        });

        me.raster = {};
        me.vector = {};

        me.raster = new ol.layer.Tile({
            source: osm_source
        });

        var source = new ol.source.Vector();

        me.vector = new ol.layer.Vector({
            source: source,
            name: 'my-vector-layer',
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });

        var extent = ol.proj.transform([34.7193330, 31.8573201, 34.9892725, 32.2086729], 'EPSG:4326', 'EPSG:3857');
        var center = ol.proj.transform([34.8543028, 32.0329965], 'EPSG:4326', 'EPSG:3857');


        me.map = new ol.Map({
            target: 'mapDiv',//this is the div id that maust be the inner tag of a Panel!!!
            renderer: 'canvas',
            layout: 'fit',
            layers: [me.raster, me.vector],
            view: new ol.View({
                projection: 'EPSG:3857',
                center: center,
                zoom: 5,
                minZoom: 0,
                maxZoom: 16
            })
        });

        me.map.getView().fitExtent(extent, me.map.getSize());


        me.map.select_interaction = new ol.interaction.Select({
            // make sure only the desired layer can be selected
            layers: function (vector) {
                return vector.get('name') === 'my-vector-layer';
            }
        });


        // grab the features from the select interaction to use in the modify interaction
        me.map.selected_features = me.map.select_interaction.getFeatures();
        // when a feature is selected...
        me.map.selected_features.on('add', me.onFeatureSelected, me);
        me.map.selected_features.on('remove', me.onFeatureUnSelected, me);

        //me.map.on('moveend', function (evt) { //CUANDO SE ARRASTRA EL MAPA CON EL BOTON IZQ PULSADO, O SE HACE ZOOM
        //    me.onMapMoveEnd(evt);
        //});
        //me.map.on('singleclick', me.onMapClick);
        //me.map.on('dblclick', me.onMapDoubleClick);
        //me.map.on('rightclick',me.onMapRightClick);//NO FUNCIONA
        //me.map.on('load',me.onMapLoad);//NO FUNCIONA
        //me.map.on('pointerenter',me.onMapEnter);//NO FUNCIONA
        //me.map.on('pointerleave',me.onMapLeave);//NO FUNCIONA
        me.map.on('pointermove', me.onMapMove, me);

        me.map.draw_interaction = new ol.interaction.Draw({
            source: source,
            type: /** @type {ol.geom.GeometryType} */ 'Point'
        });
        me.isDrawing = true;
        me.imageStyle = new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({color: 'yellow'}),
            stroke: new ol.style.Stroke({color: 'red', width: 1})
        });
        me.map.addInteraction(me.map.draw_interaction);
        me.map.draw_interaction.on('drawend', me.onFeatureDraw, me);

        var cmp=Ext.ComponentQuery.query('#MAP_PANEL')[0];
        cmp.on('resize',me.onMapResize,me);


    },

    newFeature: function (data) {
        var me = this;
        //The map will draw a feature. We need data though: id, long, lat at least.
        //data must me a JSON objet coming from CMAPI
        //{"id":"ID2","name":"Avionaco2","coordinateX":"-10664594.0","coordinateY":"4623072.0","operation":"PUBLISH_FEATURE"}
        //console.debug(data);
        //1.- Validate data as JSON object.
            if (data === null || data.id === null || data.coordinateX === null || data.coordinateY === null || data.name === null) {
                console.log('OL3MapController cannot add a feature because some data is null.');
            return null;
        }
      //  SEE IF THE FEATURE EXISTS!!! LOOK FOR DUPLICATE ID´S
        var feature=me.vector.getSource().getFeatureById(data.id);

        if(feature!==null && feature!==undefined) {
            //it exists, so don't draw it!!!
            console.debug('Existing feauture, not new.');
            return;
        }

        //2.- Extract needed data

        //3.- Create the feature and add it to the MAP.
        //ar newfeature = new ol.Feature({
        //    geometry: new ol.geom.Point(data.coordinateX, data.coordinateY),
        //    name: data.name,
        //    id: data.id
        //});

        var point = new ol.geom.Point ([data.coordinateX, data.coordinateY]);

    // create some attributes for the feature
        var attributes = {name: data.name, id: data.id};


        var feature = new ol.Feature(attributes);
        console.debug(feature);
        feature.setGeometry(point);
        feature.setId(data.id);

        me.vector.getSource().addFeatures([feature]);

        console.log('OL3MapController added a Feature due to REMOTE_EVENT.');
    },
    selectFeature:function(jsonObject) {
        var me=this;
        //1.- Validate data as JSON object.
        if (jsonObject === null || jsonObject.id === null || jsonObject.coordinateX === null || jsonObject.coordinateY === null || jsonObject.name === null) {
            console.log('OL3MapController cannot select a feature because some data is null.');
            return null;
        }
        //  SEE IF THE FEATURE EXISTS!!!
        var feature=me.vector.getSource().getFeatureById(jsonObject.id);

        if(feature===null || feature===undefined) {
            //it exists, so don't draw it!!!
            console.debug('The feature does not exist feauture, cannot select it.');
            return;
        }

        me.map.select_interaction.getFeatures().clear();
        me.map.select_interaction.getFeatures().push(feature);
        console.log('Selected a feature from Mission APP.');

    },
    onStandAloneMode:function(evt)
    {
        //WE ARE ON STANDALONE MODE!!!.
        var me=this;
        me.operatingmode='STANDALONE';
        console.debug('OL3MapController operating in Standalone Mode...');
    },
    onSlaveMode:function(evt) {
        //WE ARE ON SLAVE MODE.
        var me=this;
        me.operatingmode='SLAVE';
        console.debug('OL3MapController operating in Slave Mode...');
    },
    OnMapPublishFeatures:function(evt) {
        var me=this;

        var features=me.vector.getSource().getFeatures();
        var index=0;
        for(index=0;index<features.length;++index) {
            var feature=features[index];
            var object=new Object();
            object.operation='PUBLISH_FEATURE';
            object.id=feature.getId();
            object.name=feature.get('name');
            object.coordinateX=feature.getGeometry().getCoordinates()[0];
            object.coordinateY=feature.getGeometry().getCoordinates()[1];
            me.fireEvent('onMessageRequest',object,me);
        }
    },

    //HTML5 MESSAGES received from the IOController
    onProcessHTML5Message: function (evt) {
        var me = this;
        console.log('OL3MapController recibe evento de IOController:' + evt.operation);
        if (evt.operation === 'PUBLISH_FEATURE') {
            me.newFeature(evt);
            return;
        }

        if(evt.operation ==='FEATURE_SELECTED') {
            me.selectFeature(evt);
            return;
        }
    },
    onMessageRequest: function (e) {
        var me = this;
        console.log('OL3MapController recibido un MessageRequest desde MainController. Remitiendo a IoCOntroller:' + e);
        me.fireEvent('onMessageRequest', e, me);
    },

    //MAP EVENT HANDLERS!!!
    onMapResize:function(evt) {
            var me=this;
            if(me.map!==null && me.map!== undefined) {
                me.map.updateSize();
                console.debug('Update Size.');
            }
    },
    onMapStopDrawing: function (e) {
        var me = this;

        me.map.removeInteraction(me.map.draw_interaction);
        if (me.isDrawing) {
            console.log('Fin del modo de dibujo...');
            me.map.addInteraction(me.map.select_interaction);
        }
        me.isDrawing = false;
        var object = new Object();
        object.isDrawing = me.isDrawing;
        me.fireEvent('onUpdateStatusPanel', object, me);
    },
    onMapLeave: function (evt) {
        var me = this;
        console.log('Map Pointer Leave event...');
        me.onMapStopDrawing();
    },
    onMapEnter: function (evt) {
        var me = this;
        console.log('Map Pointer Enter event...');
        me.onMapStopDrawing();
    },
    onMapMoveEnd: function (evt) {
        var me = this;
        console.debug('Map event: onMapMoveEnd...');
    },
    onMapLoad: function (evt) {
        console.log('Map is loaded...');
    },
    onMapClick: function (evt) {
        //ONLY PROCESS CLICKS WHEN NOT DRAWING...
        if (!me.isDrawing) {
            var object=new Object();
            object.operation='MAP_CLICK';
            me.fireEvent('onMessageRequest', object, me);
            var feature = me.map.forEachFeatureAtPixel(evt.pixel, me.onFeatureClick, me);
            if (feature === undefined) {
                console.log('Click on the MAP...');
                //CLICK ON THE BACKGROUND MAP!!!
                return;
            }
        }
    },

    onMapMove: function (evt) {
        var me = this;
        //console.log('Map Event PointerMove...')
        evt.isDrawing = me.isDrawing;
        me.fireEvent('onUpdateStatusPanel', evt);
    },

    onMapDoubleClick: function (evt) {
        var me = this;
        console.log('On Map Double Click Event...');
        me.onMapStopDrawing();
    },
    onMapRightClick: function (evt) {
        var me = this;
        console.debug('Map Right Click event...');
        me.onMapStopDrawing();
    },
    onFeatureClick: function (feature, layer) {
        var me = this;
        console.log('Click on a feature of the MAP...');
        evt.operation='FEATURE_CLICK';
        me.fireEvent('onMessageRequest', evt, me);
    },
    onFeatureSelected: function (evt) {
        var me = this;
        console.log('A Feature has been selected...');
        var object=new Object();
        object.operation='FEATURE_SELECTED';
        object.id=evt.element.getId();
        me.fireEvent('onMessageRequest', object, me);
    },
    onFeatureUnSelected: function (evt) {
        var me = this;
        console.log('A Feature has been UNselected...');
        var object=new Object();
        object.operation='FEATURE_UNSELECTED';
        object.id=evt.element.getId();
        me.fireEvent('onMessageRequest', object, me);
    },
    onFeatureDraw: function (evt) {
        var me = this;
        console.debug('Feature Draw event...');
        // when a new feature has been drawn...
        // create a unique id
        // it is later needed to delete features
        var id = generateUUID();
        // give the feature this id
        var object=new Object();

        evt.feature.setId(id);
        evt.feature.set('name',id);
        // evt.feature.setName('Feature '+id); CANNOT USE THE CUSTOM ATTRIBUTE NAME FOR THE FEATURE OR I DONT KNOW HOW TO
        // creates unique id's
        object.operation='FEATURE_DRAW';
        object.id = id;
        object.name = id;
        object.coordinateX=evt.feature.getGeometry().getCoordinates()[0];
        object.coordinateY=evt.feature.getGeometry().getCoordinates()[1];
        //object.name=evt.feature.Name();

        me.fireEvent('onMessageRequest', object, me);

        function generateUUID(){
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        };

    },
    onKeepAliveError: function (evt) {
        //THE KEEPALIVE FAILED. Let's cut the MAP down, we will close the window soon!.
        window.close();
    }
});

