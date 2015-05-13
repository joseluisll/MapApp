Ext.define('MapApp.controller.IoController', {
    extend: 'Ext.app.Controller',

    init:function() {
        var me=this;
        me.missionwindow=null;
        me.keepalive=null;
        me.keepaliveerror=false;
        me.targets=null;

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

        //WE WILL SET UP A KEEPALIVE WITH THE MISSION WINDOW. WHEN IT IS LOST, AN EVENT IS GENERATED AND THEN
        //THE MAP WINDOW SHALL CLOSE ITSELF GRACEFULLY
        me.keepalive = function(){
            if( me.missionwindow===null || me.missionwindow===undefined ||  me.missionwindow.closed===true || me.missionwindow.closed===undefined){
                console.info('The MISSIONAPP window has been closed...');
                me.missionwindow=null;
                me.keepalive=null;
                me.fireEvent('onKeepAliveError',me);
                runner.destroy();
                return;
            }
            var object=new Object();
            object.operation='MISSIONAPP_KEEPALIVE';
            try {
                var ret=me.missionwindow.postMessage(Ext.JSON.encode(object), window.location.href);
            }catch(error) {
                console.error('KeepAlive with the MISSIONAPP is not working well...');
                me.fireEvent('onKeepAliveError',me);
            }
        }
        var task = {
            run: me.keepalive,
            interval: 10000 //10 second
        }
        var runner = new Ext.util.TaskRunner();
        if(window.opener!=null) {//ONLY START THE KEEPALIVE IN CASE OF BEIGN A DEPENDENT WINDOW!!!
            console.log('MapAPP is on Slave Mode.');
            me.operatingmode='SLAVE';
            var delayed_task = new Ext.util.DelayedTask(function(){
                runner.start(task);
            });

            // Wait 10000ms before starting the keepalive Thread.
                delayed_task.delay(10000);
                me.fireEvent('onSlaveMode',me);
        }else {
            me.operatingmode='STANDALONE';
            console.log('MapAPP is on Standalone Mode.');
            me.fireEvent('onStandAloneMode',me);
        }

        console.log('IoController registering Message Handler...');

        //REGISTER THE MESSAGE HANDLER
        if (window.addEventListener){ //handle different browsers case
            //window.addEventListener("message", me.onMessageReceived, false);
            window.addEventListener("message", function(evt) {
                console.log('IoController recibe un mensaje...');
                me.missionwindow=window.open('','MISSION_APP_WINDOW',null,false);
                me.fireEvent('onProcessHTML5Message',Ext.JSON.decode(evt.data),me);
            }, false);
        } else {
            //window.attachEvent("onmessage", me.onMessageReceived,false);
            window.addEventListener("message", function(evt) {
            console.log('IoController recibe un mensaje...');
            me.missionwindow=window.open('','MISSION_APP_WINDOW',null,false);
            me.fireEvent('onProcessHTML5Message',Ext.JSON.decode(evt.data),me);
            }, false);
        }
    },
    onMessageReceived:function (evt){
        var me=this;
        console.log('IoController recibe un mensaje');

        //CHECK POSSIBLE TARGETS AND REGISTER INTERESTED PARTIES


        //IF IN STANDALONE MODE, WE CAN RECEIVE ONLY MESSAGES FROM EXISTING TARGETS THAT
        //ARE MANUALLY CREATED WHEN CLICKING THE UI BUTTON IN THIS APP.AFTER RECEIVING ONE MESSAGE FROM A SLAVE WINDOW
        //THEN WE NEED TO BROADCAST IT TO THE REST OF SLAVES CONTAINED IN THE TARGETS VARIABLE.



        //IF IN SLAVEMODE, WE WILL RECEIVE MESSAGES ONLY FROM THE MASTER, CHECK IF THE ORIGIN IS OK. THERE
        //SHALL BE ONLY 1 TARGET IN THE VARIABLE TARGETS, AND EQUALS TO THE OPENER VARIABLE.

        me.missionwindow=window.open('','MISSION_APP_WINDOW',null,false);


        me.fireEvent('onProcessHTML5Message',Ext.JSON.decode(evt.data),me);

    },
    //EVENT HANDLERS
    onMessageRequest:function (data) {
        var me = this;


        //THE APP WILL SEND THE MESSAGE TO THE LIST OF SLAVES IF IT IS IN STANDALONE MODE.
        //THE APP WILL SEND THE MESSAGE ONLY TO THE MASTER (OPENER) IF IT IS IN SLAVE MODE. THE MASTER WILL BROADCAST THE EVENT

        console.log('IoController intenta postMessage...');

        if(me.operatingmode==='STANDALONE') {
            //LETS

        }else{

        }

        try {
            var c = me.missionwindow.postMessage(Ext.JSON.encode(data), window.location.href);
        }catch(error) {
            console.debug('IoController could not send the message. Check if the MissionApp is opened.');
        }
    }
});
