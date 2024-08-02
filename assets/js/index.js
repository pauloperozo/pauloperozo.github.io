///////////////////////////////////////////////////////////////////////////////////
const video = document.createElement("video");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");
const btnScanQR = document.getElementById("btn-scan-qr");
const divPrincipal = document.getElementById("principal")
const divRespuesta = document.getElementById("respuesta")
const audio = document.getElementById('audioScaner');
let [scanning,candidatos] = [ false,[]]
///////////////////////////////////////////////////////////////////////////////////
function imprimir( resumen ){

  return `<div class="accordion accordion-flush" id="accordionFlushExample">
  <div class="accordion-item">
    <h2 class="accordion-header" id="flush-headingOne">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
        Accordion Item #1
      </button>
    </h2>
    <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
      <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the first item's accordion body.</div>
    </div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header" id="flush-headingTwo">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">
        Accordion Item #2
      </button>
    </h2>
    <div id="flush-collapseTwo" class="accordion-collapse collapse" aria-labelledby="flush-headingTwo" data-bs-parent="#accordionFlushExample">
      <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the second item's accordion body. Let's imagine this being filled with some actual content.</div>
    </div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header" id="flush-headingThree">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree" aria-expanded="false" aria-controls="flush-collapseThree">
        Accordion Item #3
      </button>
    </h2>
    <div id="flush-collapseThree" class="accordion-collapse collapse" aria-labelledby="flush-headingThree" data-bs-parent="#accordionFlushExample">
      <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the third item's accordion body. Nothing more exciting happening here in terms of content, but just filling up the space to make it look, at least at first glance, a bit more representative of how this would look in a real-world application.</div>
    </div>
  </div>
</div>`

}
///////////////////////////////////////////////////////////////////////////////////
async function getCandidatos() {
  try {
      const resp = await fetch('./assets/json/candidatos.json');
      cantidatos = await resp.json();
  } catch (e) {
      throw new Error("Se Presento Un Problema...!!!")
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
qrcode.callback = (response) => {

  try {

  if (!response) throw new Error("Respuesta Invalida....")
  
  const data = getInfo( response )
  audio.play()
  cerrarCamara(); 
  divPrincipal.hidden = true;
  divRespuesta.innerHTML= imprimir( data )

  } catch (e) {
    Swal.fire(e?.message)
  }

};
/////////////////////////////////////////////////////////////////////////////////// 
window.addEventListener('load', async (e) => {
  try {
    await getCandidatos()
  } catch (e) {
    Swal.fire(e?.message)
  }
})
/////////////////////////////////////////////////////////////////////////////////// 

