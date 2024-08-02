///////////////////////////////////////////////////////////////////////////////////
const video = document.createElement("video");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");
const btnScanQR = document.getElementById("btn-scan-qr");
let scanning = false;
let cantidatos = []
///////////////////////////////////////////////////////////////////////////////////
async function getCandidatos() {
  try {
      const response = await fetch('./assets/json/candidatos.json');
      cantidatos = await response.json();
  } catch (error) {
      console.error('Error al obtener datos:', error);
  }
}
///////////////////////////////////////////////////////////////////////////////////
function getInfo(str) {
  const data = str.split("!");
  const arry = data[1].split(",").map((n) => Number(n));

  const resumen = { circuito: data[0], total: 0, data: [] };

  for (let [index, votos] of arry.entries()) {
    const { organizacion, nombre } = cantidatos[index];

    let ref = resumen.data.findIndex((row) => row.nombre === nombre);

    if (ref === -1) {
      resumen.data.push({ nombre, votos: 0, detalle: [] });
      ref = resumen.data.length - 1;
    }

    resumen.data[ref].votos += votos;
    resumen.data[ref].detalle.push({ organizacion, votos });

    resumen.total += votos;
  }

  resumen.data.sort((a, b) => b.votos - a.votos);

  return resumen;
}
///////////////////////////////////////////////////////////////////////////////////
 const encenderCamara = () => {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function (stream) {
      scanning = true;
      btnScanQR.hidden = true;
      canvasElement.hidden = false;
      video.setAttribute("playsinline", true);
      video.srcObject = stream;
      video.play();
      tick();
      scan();
    });
};
///////////////////////////////////////////////////////////////////////////////////
 function tick() {
  canvasElement.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

  scanning && requestAnimationFrame(tick);
}
///////////////////////////////////////////////////////////////////////////////////
function scan() {
  try {
    qrcode.decode();
  } catch (e) {
    setTimeout(scan, 300);
  }
}
///////////////////////////////////////////////////////////////////////////////////
const cerrarCamara = () => {
  video.srcObject.getTracks().forEach((track) => {
    track.stop();
  });
  canvasElement.hidden = true;
  btnScanQR.hidden = false;
};
///////////////////////////////////////////////////////////////////////////////////
const activarSonido = () => {
  var audio = document.getElementById('audioScaner');
  audio.play();
}
///////////////////////////////////////////////////////////////////////////////////
qrcode.callback = (respuesta) => {
  if (respuesta) {
    
    const data = getInfo( respuesta )
    document.getElementById("respuesta").innerHTML= JSON.stringify(data,null,2)


    //Swal.fire(respuesta)
    activarSonido();
    cerrarCamara();    

  }
};
/////////////////////////////////////////////////////////////////////////////////// 



window.addEventListener('load', (e) => {
   
    getCandidatos()



})


