/**
 * The main application class. An instance of this class is created by app.js when it calls
 * Ext.application(). This is the ideal place to handle application launch and initialization
 * details.
 */
Ext.define('MapApp.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'MapApp.controller.IoController',
        'MapApp.controller.OL3MapController'
    ],
    
    name: 'MapApp',

    map:null,

    controllers: [
        'IoController','OL3MapController'
    ],

    views: [
      //
    ],

    stores: [
        // TODO: add global / shared stores here
    ],
    
    launch: function () {
        // TODO - Launch the application
        var me=this;
        window.name='MAP_APP_WINDOW';
        /*require(["esri/map", "dojo/domReady!"], function(Map) {
            me.map = new Map("map", {
                center: [-56.049, 38.485],
                zoom: 3,
                basemap: "streets"
            });
        });
        console.log(me.map);
        dojo.connect(me.map, "onLoad", function() {
            console.log("Map onLoad event");
            me.onMapLoad();
        });
        dojo.connect(me.map, "onClick", function() {
            console.log("Map onClick event");
            me.onMapClick();
        });

    },
    onMapLoad:function(evt) {
        console.log('Map is loaded...');
    },
    onMapClick:function(evt) {
        console.log('Click on the MAP...');*/

/*        dojo.require("esri.map");
*        dojo.require("esri.request");
*        dojo.require("esri.graphic");
*        dojo.require("esri.layers.FeatureLayer");
*        dojo.require("esri.InfoTemplate");
*        dojo.require("esri.geometry.Point");
*        dojo.require("dojo.domReady!")
*        dojo.ready(this.getMapControllerController().initMap);*/

        //this.getMapControllerController().initMap();
        this.getOL3MapControllerController().initMap();
    }
});
