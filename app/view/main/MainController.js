/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('MapApp.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Ext.window.MessageBox',
    ],

    alias: 'controller.main',

    init:function() {
       var me=this;

        me.setId('MainController');

        me.listen({
            'controller': {
                '#IoController': {
                    onProcessHTML5Message:function(e) {
                        me.onProcessHTML5Message(e);
                    }
                },
                '#OL3MapController': {
                    onUpdateStatusPanel:function(evt) {
                        me.onUpdateStatusPanel(evt);
                    }
                }
            }
        });

    },
    processHTML5Message:function (e) {
        var me = this;
        console.log('MainController got an HTML5Message:'+ e.operation);
        var event_panel = Ext.ComponentQuery.query('#MAP_EVENT_PANEL')[0];
        var label=Ext.create ('Ext.form.Label', {
                html: '<p>'+ Ext.JSON.encode(e)+'</p>'
            }
        );
        event_panel.add(label);
    },

    //EVENT HANDLERS
    onProcessHTML5Message:function(e) {
        var me = this;
        me.processHTML5Message(e);
    },
    onClickButton: function (btn) {
        var me = this;
        if(btn.itemId==='MAP_BTN_STOPDRAW') {
            //console.log('Firing onMapStopDrawing para MAP_BTN_STOPDRAW');
            me.fireEvent('onMapStopDrawing',me);
        }else if(btn.itemId==='MAP_PUBLISH_FEATURES') {
            me.fireEvent('OnMapPublishFeatures',me);
        }else if(btn.itemId==='BTN_CLOSE_MAPAPP') {
            Ext.Msg.confirm('Confirm', 'Are you sure?', 'onConfirm', me);
        }
    },

    onConfirm: function (choice) {
        var me = this;
        if (choice === 'yes') {
            me.onCloseWindow();
        }
    },
    onCloseWindow:function() {
        var me = this;
        window.close();
    },
    onUpdateStatusPanel:function(evt) {
        //UPDATE THE COORDINATES OF THE STATUS BAR
        var me = this;
        var drawingMode=evt.isDrawing;
        if(drawingMode===null || drawingMode ===undefined) {
            cconsole.error('There is something wrong with the Update Status Panel Event...');
            return;
        }
        var isDrawing = Ext.ComponentQuery.query('#isDrawing')[0];
        if(drawingMode) {
            isDrawing.setText('TRUE ');
        }else {
            isDrawing.setText('FALSE ');
        }


        if(evt.coordinate===null || evt.coordinate===undefined) {
            return;
        }
        var long=0;
        long=evt.coordinate[0];
        var lat=0;
        lat=evt.coordinate[1];
        var label_long = Ext.ComponentQuery.query('#LONG')[0];
        label_long.setText(long+' ');

        var label_lat = Ext.ComponentQuery.query('#LAT')[0];
        label_lat.setText(lat+' ');

    }

});
