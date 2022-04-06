require("dotenv").config();

const {
  inquirerMenu,
  pausa,
  leerInput,
  listarLugares
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");
require("colors");

const main = async () => {
  let opt;

  const busquedas = new Busquedas();

  do {
    // Imprimir el menú
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        const criterio = await leerInput("Ciudad:");

        const lugares = await busquedas.ciudad(criterio);

        const idSeleccionado = await listarLugares(lugares);

        if (idSeleccionado === "0") continue;

        const lugarSeleccionado = lugares.find(
          (lugar) => (lugar.id = idSeleccionado)
        );

        busquedas.agregarHistorial(lugarSeleccionado.nombre);

        const clima = await busquedas.climaLugar(
          lugarSeleccionado.lat,
          lugarSeleccionado.lng
        );

        console.log("\nInformacion de la ciudad\n".green);
        console.log("Ciudad:", lugarSeleccionado.nombre.green);
        console.log("Latitud:", lugarSeleccionado.lat);
        console.log("Longitud:", lugarSeleccionado.lng);
        console.log("Temperatura:", clima.temp);
        console.log("Temp min:", clima.min);
        console.log("Temp max:", clima.max);
        console.log("Como esta el clima:", clima.desc.green);
        break;
      case 2:
        //busquedas.historialCapitalizado
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
