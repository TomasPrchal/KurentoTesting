window["startTheApp"] = startTheApp;

function startTheApp() {
  console.log(_id);

  load();

  //let eCfg: ElementsCfg = {
  //  local: document.getElementById('localVideo'),
  //  remote: document.getElementById('remoteVideo')
  //}
  //let weTalkWebRtc = new WeTalkWebRtc(window["kurentoClient"], window["kurentoUtils"], eCfg);
  //weTalkWebRtc.startConnection(null);
}

let _id = {
  uid: "578c0bd270d1cdba23f5f16d",
  csid: "578c0c3370d1cdba23f5f16f",
  pid: "57a14a8598702f3da8bb80f3"
}

interface ConnectionCfg {
  wsUri?: string;
  fileUri?: string;
  iceServers?: string[];
}

interface ElementsCfg {
  local: any;
  remote: any;
}

class WeTalkWebRtc {
  kurentoClient: any;
  kurentoUtils: any;

  sessionId: string;

  connectionConfig: ConnectionCfg;

  webRtcPeer: any;
  webRtcEntryPoint: any;
  pipeline: any;
  recorder: any;

  videoElements: ElementsCfg;

  constructor(kC, kU, vE: ElementsCfg, connectionConfig?: ConnectionCfg) {
    this.kurentoClient = kC;
    this.kurentoUtils = kU;
    this.videoElements = vE;

    if (connectionConfig) {
      this.connectionConfig = connectionConfig;
    } else {
      this.connectionConfig = {
        wsUri: 'wss://kurento.applicloud.com:8433/kurento',
        fileUri: "file:///tmp/tomasRecord.webm",
        iceServers: null
      };
    }
  }

  startConnection(sessionId: string) {
    this.sessionId = sessionId;

    // http://doc-kurento.readthedocs.io/en/stable/mastering/kurento_utils_js.html
    // Creates RTCPeerConnection, invokes getUserMedia, but NO connection YET  
    this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(this.connectionConfig, function (error) {
      if (error) return this.onError(error)

      // SDP generated, handled in callback
      this.generateOffer(this.onOffer)
    });
  }

  endConnection(sessionId: string) {
    if (this.webRtcPeer) {
      this.webRtcPeer.dispose();
      this.webRtcPeer = null;
    }

    if (this.pipeline) {
      this.pipeline.release();
      this.pipeline = null;
    }

    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }
  }

  blockLocalAudio() {
  }

  blockLocalVideo() {
  }

  muteRemoteAudio() {
  }

  getStats() {
  }

  startRecording() {
  }

  endRecording() {
  }

  setIceCandidateCallbacks(onerror) {
    this.webRtcPeer.on('icecandidate', function (candidate) {
      console.log("Local candidate:", candidate);

      candidate = kurentoClient.register.complexTypes.IceCandidate(candidate);

      this.webRtcEntryPoint.addIceCandidate(candidate, onerror)
    });

    this.webRtcEntryPoint.on('OnIceCandidate', function (event) {
      var candidate = event.candidate;

      console.log("Remote candidate:", candidate);

      this.webRtcPeer.addIceCandidate(candidate, onerror);
    });
  }

  onError(error) {
    if (error) {
      console.error(error);
      this.endConnection(null);
    }
  }

  onOffer(error, sdpOffer) {
    if (error) return this.onError(error)

    //http://doc-kurento.readthedocs.io/en/stable/_static/langdoc/jsdoc/kurento-client-js/module-kurentoClient.KurentoClient.html
    // Creates connection to Kurento Media Server
    kurentoClient(args.wsUri, function (error, client) {
      if (error) return this.onError(error);

      // http://doc-kurento.readthedocs.io/en/stable/_static/langdoc/jsdoc/kurento-client-js/module-core.MediaPipeline.html
      // The AV manager object, controlling what happens on Server
      client.create("MediaPipeline", function (error, _pipeline) {
        if (error) return this.onError(error);

       this.pipeline = _pipeline;

        var elements =
          [
            { type: 'RecorderEndpoint', params: { uri: args.fileUri } },
            { type: 'WebRtcEndpoint', params: {} }
          ]

        // http://doc-kurento.readthedocs.io/en/stable/_static/langdoc/jsdoc/kurento-client-js/module-elements.WebRtcEndpoint.html
        // Add enpoint for the user
        this.pipeline.create(elements, function (error, elements) {
          if (error) return this.onError(error);

          let recorder = elements[0];
          let webRtc = elements[1];

          this.setIceCandidateCallbacks(this.onError);

          webRtc.processOffer(sdpOffer, function (error, sdpAnswer) {
            if (error) return this.onError(error);

            this.webRtcPeer.processAnswer(sdpAnswer, this.onError);
          });
          webRtc.gatherCandidates(this.onError);

          client.connect(webRtc, webRtc, recorder, function (error) {
            if (error) return this.onError(error);

            console.log("Loopback established");

            recorder.record(function (error) {
              if (error) return this.onError(error);

              console.log("Recording");
              setTimeout(() => {
                recorder.stop();
                console.log("Recording stopped");
              }, 60000);
            });
          });
        });


      });
    });
  }
}
//http://doc-kurento.readthedocs.io/en/stable/_static/langdoc/jsdoc/kurento-client-js/index.html
let kurentoClient: any = window["kurentoClient"];
//http://doc-kurento.readthedocs.io/en/stable/_static/langdoc/jsdoc/kurento-utils-js/index.html
let kurentoUtils: any = window["kurentoUtils"];


var args = {
  wsUri: 'wss://kurento.applicloud.com:8433/kurento',
  //ws_uri: 'wss://nope.com/kurento',
  fileUri: 'file:///tmp/tomasRecord',
  iceServers: null
};

function setIceCandidateCallbacks(webRtcPeer, webRtcEp, onerror) {
  webRtcPeer.on('icecandidate', function (candidate) {
    console.log("Local candidate:", candidate);

    candidate = kurentoClient.register.complexTypes.IceCandidate(candidate);

    webRtcEp.addIceCandidate(candidate, onerror)
  });

  webRtcEp.on('OnIceCandidate', function (event) {
    var candidate = event.candidate;

    console.log("Remote candidate:", candidate);

    webRtcPeer.addIceCandidate(candidate, onerror);
  });
}


function load() {
  var webRtcPeer;
  var pipeline;

  var videoInput = document.getElementById('localVideo');
  var videoOutput = document.getElementById('remoteVideo');

  var options = {
    localVideo: videoInput,
    remoteVideo: videoOutput,
    configuration: {}
  };


  if (args.iceServers) {
    console.log("Use ICE servers: " + args.iceServers);
    options.configuration = {
      iceServers: JSON.parse(args.iceServers)
    };
  } else {
    console.log("Use freeice")
  }

  // http://doc-kurento.readthedocs.io/en/stable/mastering/kurento_utils_js.html
  // Creates RTCPeerConnection, invokes getUserMedia, but NO connection YET  
  webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function (error) {
    if (error) return onError(error)

    // SDP generated, handled in callback
    this.generateOffer(onOffer)
  });

  // Handles connection and negotiation
  function onOffer(error, sdpOffer) {
    if (error) return onError(error)

    //http://doc-kurento.readthedocs.io/en/stable/_static/langdoc/jsdoc/kurento-client-js/module-kurentoClient.KurentoClient.html
    // Creates connection to Kurento Media Server
    kurentoClient(args.wsUri, function (error, client) {
      if (error) return onError(error);

      // http://doc-kurento.readthedocs.io/en/stable/_static/langdoc/jsdoc/kurento-client-js/module-core.MediaPipeline.html
      // The AV manager object, controlling what happens on Server
      client.create("MediaPipeline", function (error, _pipeline) {
        if (error) return onError(error);

        pipeline = _pipeline;

        var recordFileName = args.fileUri + new Date().getTime().toString() + ".webm";
        console.log(recordFileName);
        var elements =
          [
            { type: 'RecorderEndpoint', params: { uri: recordFileName } },
            { type: 'WebRtcEndpoint', params: {} }
          ]

        // http://doc-kurento.readthedocs.io/en/stable/_static/langdoc/jsdoc/kurento-client-js/module-elements.WebRtcEndpoint.html
        // Add endpoint for the user to the PIPELINE
        pipeline.create(elements, function (error, elements) {
          if (error) return onError(error);

          let recorder = elements[0];
          let webRtc = elements[1];

          setIceCandidateCallbacks(webRtcPeer, webRtc, onError)

          webRtc.processOffer(sdpOffer, function (error, sdpAnswer) {
            if (error) return onError(error);

            webRtcPeer.processAnswer(sdpAnswer, onError);
          });
          webRtc.gatherCandidates(onError);

          client.connect(webRtc, webRtc, recorder, function (error) {
            if (error) return onError(error);

            console.log("Loopback established");

            recorder.record(function (error) {
              if (error) return onError(error);

              console.log("Recording");
              setTimeout(() => {
                recorder.stop();
                console.log("Recording stopped");
              }, 300000);
            });
          });
        });


      });
    });
  }

  function stop() {
    if (webRtcPeer) {
      webRtcPeer.dispose();
      webRtcPeer = null;
    }

    if (pipeline) {
      pipeline.release();
      pipeline = null;
    }
  }

  function onError(error) {
    if (error) {
      console.error(error);
      stop();
    }
  }
}
