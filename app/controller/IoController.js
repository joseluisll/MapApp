Ext.define('MapApp.controller.IoController', {
    extend: 'Ext.app.Controller',

    init:function() {
        var me=this;
        me.missionwindow=null;

        me.listen({
            'controller': {
                '#MapController': {
                    'onMessageRequest':function(evt) {
                        me.onMessageRequest(evt);
                    }
                },
                '#OL3MapController': {
                    'onMessageRequest':function(evt) {
                        me.onMessageRequest(evt);
                    }
                }
            }

        });
        console.log('IoController registering Message Handler...');

        //REGISTER THE MESSAGE HANDLER
        if (window.addEventListener){ //handle different browsers case
            window.addEventListener("message", function(evt) {
                    console.log('IoController recibe un mensaje...'+Ext.JSON.decode(evt.data).operation);
                    me.missionwindow=window.open('','MISSION_APP_WINDOW',null,false);
                    me.fireEvent('onProcessHTML5Message',Ext.JSON.decode(evt.data),me);
            }, false);
        } else {
            window.attachEvent("onmessage", function(evt) {
                console.log('IoController recibe un mensaje...'+Ext.JSON.decode(evt.data).operation);
                me.missionwindow=window.open('','MISSION_APP_WINDOW',null,false);
                me.fireEvent('onProcessHTML5Message',Ext.JSON.decode(evt.data),me);
            });
        }
    },

    //EVENT HANDLERS
    onMessageRequest:function (data) {
        var me = this;
        //THIS IO CONTROLLER WILL SEND OUT MESSAGES TO THE MISSION APP!!!
        console.log('IoController intenta postMessage...');
        try {
            var c = me.missionwindow.postMessage(Ext.JSON.encode(data), window.location.href);
        }catch(error) {
            console.debug('IoController could not send the message. Check if the MissionApp is opened.');
        }
    }
});
