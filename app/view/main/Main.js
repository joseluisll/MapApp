/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('MapApp.view.main.Main', {
    extend: 'Ext.container.Container',
    requires: [
        'MapApp.view.main.MainController',
        'MapApp.view.main.MainModel',
    ],

    xtype: 'app-main',

    controller: 'main',
    viewModel: {
        type: 'main'
    },

    layout: {
        type: 'border'
    },

    items: [
        {//FIRST THE WEST REGION. IT IS THE NAVIGATION TOOL BAR
            //IN THIS CASE, THERE IS NO MAIN WINDOW YET.
            xtype: 'panel',
            bind: {
                title: '{name}'
            },
            region: 'west',
            width: 250,
            split: true,
            items: [{
                html: '<ul><li>GROUP OF CONTROL BUTTONS</li></ul>'
            },
                {
                    tbar: [{
                        text: 'Close Map Application',
                        itemId: 'BTN_CLOSE_MAPAPP',
                        handler: 'onClickButton'
                    }]
                },
                {
                    html: '<ul><li>MAP OPERATIONS</li></ul>'
                },
                {
                    tbar: [{
                        text: 'Stop Drawing',
                        itemId: 'MAP_BTN_STOPDRAW',
                        handler: 'onClickButton'
                    }, {
                        text: 'Publish Features',
                        itemId: 'MAP_PUBLISH_FEATURES',
                        handler: 'onClickButton'
                    }]
                },
                {
                    xtype: 'panel',
                    itemId: 'MAP_EVENT_PANEL',
                    width: 250,
                    height: 400,
                    split: true,
                    autoScroll:true,
                    items: [{
                        html: '<ul><li>LIST OF EVENTS</li></ul>'
                    }
                    ]
                }
            ]
        },
        {
            xtype: 'panel',
            region: 'center',
            itemId: 'MAP_PANEL',
            html: "<div id='mapDiv' style='height:100%; width:100%;z-index=: 1000;'></div>",
            layout:'fit'
        },
        {
            xtype: 'panel',
            region: 'south',
            itemId: 'status_panel',
            split:true,
            items: [
                {
                    //isDrawing CAPTION
                    xtype:'label',
                    text:'Drawing:',
                    itemId:'isDrawing_CAPTION'
                },
                {
                    //long
                    xtype:'label',
                    text:'TRUE',
                    itemId:'isDrawing'
                },
                {
                    //long CAPTION
                    xtype:'label',
                    text:'Longitude:',
                    itemId:'long_CAPTION'
                },
                {
                    //long
                    xtype:'label',
                    text:'0',
                    itemId:'LONG'
                },
                {
                    //lat CAPTION
                    //long CAPTION
                    xtype:'label',
                    text:'Latitude:',
                    itemId:'lat_CAPTION'
                },
                {
                    //lat
                    xtype:'label',
                    text:'0',
                    itemId:'LAT'
                }
            ]
        }
    ]
});