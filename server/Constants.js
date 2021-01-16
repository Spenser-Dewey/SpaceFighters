const width = 5000;
const height = 5000;
const minAsteroids = 1;
const clientWidth = 1500;
const clientHeight = 800;
const powerupProbability = .01;
const maxPowerups = 20;
const powerups = {
    "invincibility": 400,
    "reflection": 400,
    "triple shot": 400,
    "minify": 600,
    "asteroid shot": 300,
    "turbo shot": 400,
    "drill": 6,
    "dex boost": 600,
    "turbo jump": 300,
    "missile": 3,
    "bomb": 6,
}
const debug = false;

module.exports = {width, height, minAsteroids, clientWidth, clientHeight, powerupProbability, maxPowerups, powerups, debug}