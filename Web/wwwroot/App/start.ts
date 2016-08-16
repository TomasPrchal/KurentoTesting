window["startTheApp"] = startTheApp;

function startTheApp() {
  console.log(_id);

  load();
}

let kurentoClient: any = window["kurentoClient"];
let kurentoUtils: any = window["kurentoUtils"];

let _id = {
  uid: "578c0bd270d1cdba23f5f16d",
  csid: "578c0c3370d1cdba23f5f16f",
  pid: "57a14a8598702f3da8bb80f3"
}

var args = {
  ws_uri: 'wss://kurento.applicloud.com/kurento',
  ice_servers: null
};

function setIceCandidateCallbacks(webRtcPeer, webRtcEp, onerror) {
  webRtcPeer.on('icecandidate', function (candidate) {
    console.log("Local candidate:", candidate);

    candidate = kurentoClient.getComplexType('IceCandidate')(candidate);

    webRtcEp.addIceCandidate(candidate, onerror)
  });

  webRtcEp.on('OnIceCandidate', function (event) {
    var candidate = event.candidate;

    console.log("Remote candidate:", candidate);

    webRtcPeer.addIceCandidate(candidate, onerror);
  });
}


function load() {
  console = console;

  var webRtcPeer;
  var pipeline;

  var videoInput = document.getElementById('localVideo');
  var videoOutput = document.getElementById('remoteVideo');

  var options = {
    localVideo: videoInput,
    remoteVideo: videoOutput,
    configuration: {}
  };


  if (args.ice_servers) {
    console.log("Use ICE servers: " + args.ice_servers);
    options.configuration = {
      iceServers: JSON.parse(args.ice_servers)
    };
  } else {
    console.log("Use freeice")
  }

  webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function (error) {
    if (error) return onError(error)

    this.generateOffer(onOffer)
  });

  function onOffer(error, sdpOffer) {
    if (error) return onError(error)

    kurentoClient(args.ws_uri, function (error, client) {
      if (error) return onError(error);

      client.create("MediaPipeline", function (error, _pipeline) {
        if (error) return onError(error);

        pipeline = _pipeline;

        pipeline.create("WebRtcEndpoint", function (error, webRtc) {
          if (error) return onError(error);

          setIceCandidateCallbacks(webRtcPeer, webRtc, onError)

          webRtc.processOffer(sdpOffer, function (error, sdpAnswer) {
            if (error) return onError(error);

            webRtcPeer.processAnswer(sdpAnswer, onError);
          });
          webRtc.gatherCandidates(onError);

          webRtc.connect(webRtc, function (error) {
            if (error) return onError(error);

            console.log("Loopback established");
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
