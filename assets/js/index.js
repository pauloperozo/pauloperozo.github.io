///////////////////////////////////////////////////////////////////////////////////
const video = document.createElement("video");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");
const btnScanQR = document.getElementById("btn-scan-qr");
const divPrincipal = document.getElementById("principal")
const divSumary = document.getElementById("sumary")
const divRespuesta = document.getElementById("respuesta")
const audio = document.getElementById('audioScaner');
let [scanning,candidatos] = [ false,[]]
///////////////////////////////////////////////////////////////////////////////////
function imprimir( sumary ){

  try {
 
    const template = document.getElementById('template').innerHTML;
    const rendered = Mustache.render(template, sumary);
    divRespuesta.innerHTML = rendered;

  } catch (e) {
    throw new Error("Error Render")
  }
}
///////////////////////////////////////////////////////////////////////////////////
async function getCandidatos() {
  try {
      const resp = await fetch('./assets/json/candidatos.json');
      cantidatos = await resp.json();
  } catch (e) {
      throw new Error("Error Load")
  }
}
///////////////////////////////////////////////////////////////////////////////////
function ErrorReload( msj = "" )
{
  Swal.fire(msj)
  setTimeout( ()=> window.location.reload(), 5000);
}
///////////////////////////////////////////////////////////////////////////////////
function getInfo(str) {
  
  if (typeof str !== 'string' ) throw new Error("Error Scan");
  if (/^[0-9.,!]+$/.test(str) === false) throw new Error("Error Scan");

  const data = str.split("!");
  const arry = data[1].split(",").map((n) => Number(n)).filter((n) => !isNaN(n) );
  if (data.length !== 4 || arry.length !== 38) throw new Error("Error Scan");

  const resumen = { circuito: data[0], total: 0, data: [] };

  for (let [index, votos] of arry.entries()) {
    const { organizacion, nombre,foto } = cantidatos[index];

    let ref = resumen.data.findIndex((row) => row.nombre === nombre);

    if (ref === -1) {
      resumen.data.push({ nombre, votos: 0, detalle: [],foto});
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
    setTimeout(scan, 500);
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
qrcode.callback = (response) => {

  try {

      if (!response) throw new Error("Error Response")
      audio.play()
      cerrarCamara(); 
      divPrincipal.hidden = true;
      const sumary = getInfo( response )
      imprimir( sumary );
      divSumary.hidden = false

  } catch (e) {
    ErrorReload(e?.message)
  }

};
/////////////////////////////////////////////////////////////////////////////////// 
window.addEventListener('load', async (e) => {
  try {
    divSumary.hidden = true
    await getCandidatos()
  } catch (e) {
    ErrorReload(e?.message)
  }
})
/////////////////////////////////////////////////////////////////////////////////// 

