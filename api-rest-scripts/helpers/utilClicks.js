import robot from "robotjs";
import { sleep } from "./util.js";


async function click(x, y, button, double, sleepMs) {
    try {
        
        robot.moveMouse(x, y);
        robot.mouseClick(button, double);
        await sleep(sleepMs);

        return true;

    } catch (error) {
        throw new Error("No se pudo clickear en el coordenada ingresada")
    }
}

async function clickAndWrite(x, y, value, sleepMs) {
    try {
        
        robot.moveMouse(x, y);
        robot.mouseClick();
        await sleep(500);
        robot.typeString(value);
        await sleep(sleepMs);

        return true;

    } catch (error) {
        throw new Error("No se pudo clickear o escribir en el coordenada ingresada")
    }
}

export {
    click,
    clickAndWrite
}