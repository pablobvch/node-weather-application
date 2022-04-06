const axios = require("axios");
const fs = require("fs");
const _ = require("lodash");

class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    console.log("constructor");
    this.leerDB();
  }

  get historialCapitalizado() {
    return this.historial.map((expression) =>
      expression.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
        letter.toUpperCase()
      )
    );
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es"
    };
  }

  async ciudad(lugar = "") {
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox
      });

      const resp = await instance.get();

      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1]
      }));
    } catch (err) {
      console.log("error", err);
      return [];
    }
  }

  get paramsOpenWeather() {
    return {
      appId: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es"
    };
  }

  async climaLugar(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsOpenWeather, lat, lon }
      });

      const resp = await instance.get();

      return {
        desc: resp.data.weather[0].description,
        temp: resp.data.main.temp,
        min: resp.data.main.temp_min,
        max: resp.data.main.temp_max
      };
    } catch (err) {
      console.log(err);
    }
  }

  agregarHistorial(lugar = "") {
    //TODO prevenir duplicados
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }

    this.historial = this.historial.splice(0, 5);

    this.historial.unshift(lugar.toLocaleLowerCase());

    //grabar en db
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    if (!fs.existsSync(this.dbPath)) {
      return;
    }

    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);
    this.historial = data.historial;
  }
}

module.exports = Busquedas;
